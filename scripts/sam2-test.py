"""
SAM 2 via Replicate Python SDK
근정전 사진에서 자동 마스크 생성
"""
import replicate
import json
import os
import sys
from pathlib import Path

os.environ.setdefault("REPLICATE_API_TOKEN", os.environ.get("Replicate_API_token", ""))
IMG_PATH = Path(__file__).parent.parent / "public" / "spaces" / "geunjeongjeon-interior.jpg"

print("SAM 2 자동 마스크 생성 중... (약 20-40초)", file=sys.stderr)

# 최신 버전 자동 선택
model = replicate.models.get("lucataco/segment-anything-2")
version = model.versions.list()[0]
print(f"Using version: {version.id}", file=sys.stderr)

output = replicate.run(
    f"lucataco/segment-anything-2:{version.id}",
    input={
        "image": open(IMG_PATH, "rb"),
    }
)

# 결과 저장
out_path = Path(__file__).parent / "sam2-result.json"
out_path.write_text(json.dumps(output, indent=2, ensure_ascii=False))
print(f"Result saved to {out_path}", file=sys.stderr)

# 요약
if isinstance(output, dict):
    combined = output.get("combined_mask", "")
    masks = output.get("individual_masks", [])
    print(f"Combined mask URL: {combined[:120]}...")
    print(f"Individual masks: {len(masks)}개")
    for j, m in enumerate(masks[:5]):
        url = m if isinstance(m, str) else str(m)
        print(f"  Mask {j}: {url[:120]}...")
elif isinstance(output, str):
    print(f"Output: {output[:200]}")
else:
    print(json.dumps(output, ensure_ascii=False)[:500])
