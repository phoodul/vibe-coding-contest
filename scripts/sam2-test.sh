#!/bin/bash
# SAM 2 via Replicate HTTP API
# Step 1: Create prediction
# Step 2: Poll for result

API_TOKEN="${REPLICATE_API_TOKEN:-}"
IMAGE_PATH="public/spaces/geunjeongjeon-interior.jpg"

# Base64 encode the image
IMAGE_B64=$(base64 -w 0 "$IMAGE_PATH" 2>/dev/null || base64 -i "$IMAGE_PATH" 2>/dev/null || python -c "import base64,sys; sys.stdout.write(base64.b64encode(open('$IMAGE_PATH','rb').read()).decode())")
IMAGE_URI="data:image/jpeg;base64,${IMAGE_B64}"

echo "Creating SAM 2 prediction..." >&2

RESPONSE=$(curl -s -X POST "https://api.replicate.com/v1/models/meta/sam-2/predictions" \
  -H "Authorization: Bearer ${API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": {
      \"image\": \"${IMAGE_URI}\",
      \"task_type\": \"automatic_mask_generation\",
      \"multimask_output\": false
    }
  }")

echo "$RESPONSE" | python -c "import sys,json; d=json.load(sys.stdin); print('Status:', d.get('status','?')); print('ID:', d.get('id','?'))" 2>/dev/null

PRED_ID=$(echo "$RESPONSE" | python -c "import sys,json; print(json.load(sys.stdin).get('id',''))")

if [ -z "$PRED_ID" ]; then
  echo "Error creating prediction:"
  echo "$RESPONSE" | python -m json.tool 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

# Poll for result
echo "Waiting for result..." >&2
for i in $(seq 1 30); do
  sleep 3
  RESULT=$(curl -s "https://api.replicate.com/v1/predictions/${PRED_ID}" \
    -H "Authorization: Bearer ${API_TOKEN}")

  STATUS=$(echo "$RESULT" | python -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
  echo "  Poll $i: status=$STATUS" >&2

  if [ "$STATUS" = "succeeded" ]; then
    echo "$RESULT" | python -c "
import sys, json
d = json.load(sys.stdin)
output = d.get('output', {})
print(json.dumps(output, indent=2, ensure_ascii=False))
"
    exit 0
  elif [ "$STATUS" = "failed" ]; then
    echo "Prediction failed:"
    echo "$RESULT" | python -m json.tool
    exit 1
  fi
done

echo "Timeout waiting for prediction"
exit 1
