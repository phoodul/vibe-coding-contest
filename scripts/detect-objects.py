"""
Claude Vision API로 사진 속 사물 인식 + bounding box 반환
"""
import anthropic
import base64
import json
import os
import sys
from pathlib import Path

# .env에서 API 키 로드
env_path = Path(__file__).parent.parent / ".env"
for line in env_path.read_text().splitlines():
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        os.environ[k.strip()] = v.strip()
os.environ["ANTHROPIC_API_KEY"] = os.environ.get("ANTHROPIC_API_KEY", "")

IMG_PATH = Path(__file__).parent.parent / "public" / "spaces" / "geunjeongjeon-interior.jpg"
img_b64 = base64.standard_b64encode(IMG_PATH.read_bytes()).decode()

client = anthropic.Anthropic()

print("Claude Vision으로 사물 인식 중...", file=sys.stderr)

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {"type": "base64", "media_type": "image/jpeg", "data": img_b64},
            },
            {
                "type": "text",
                "text": """이 사진에서 구별 가능한 모든 사물/영역을 식별하고 bounding box를 viewport % 좌표로 반환하세요.

JSON만 응답 (다른 텍스트 없이):
[
  {"name": "한국어 이름", "region": {"x": 0, "y": 0, "w": 10, "h": 20}, "desc": "설명"}
]

규칙:
- 좌표는 이미지 전체 대비 % (0-100), 소수점 없이 정수
- 큰 사물(기둥, 벽, 천장)부터 작은 사물(등, 장식)까지 최대한 많이
- 같은 종류여도 위치 다르면 별도 (좌측 기둥, 우측 기둥)
- 겹치는 영역 허용"""
            },
        ],
    }],
)

text = response.content[0].text
if "```" in text:
    text = text[text.find("["):text.rfind("]") + 1]

result = json.loads(text)
print(json.dumps(result, ensure_ascii=False, indent=2))
print(f"\n총 {len(result)}개 사물 인식", file=sys.stderr)
