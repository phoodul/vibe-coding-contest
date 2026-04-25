# Euler SymPy μSvc

FastAPI + SymPy 마이크로서비스. Vercel 외부(Railway) 에 배포.

## 로컬 개발

```bash
cd services/euler-sympy
pip install -r requirements.txt
uvicorn main:app --reload
```

## Railway 배포 (D-02)

1. https://railway.app/new → "Empty Project"
2. New Service → "Deploy from GitHub" → 본 디렉터리 선택
3. Variables:
   - `INTERNAL_TOKEN`: 32자 임의 문자열 (Next 와 동일하게 설정)
4. 도메인 발급 후 Next env 에 `EULER_SYMPY_URL` 추가

## 엔드포인트

모든 POST 는 헤더 `X-Internal-Token` 필수.

- `POST /differentiate` `{expr, var, order}`
- `POST /integrate` `{expr, var, lower?, upper?}`
- `POST /solve_equation` `{expr, var}`
- `POST /simplify` `{expr}`
- `POST /factor` `{expr}`
- `POST /series_expand` `{expr, var, point, n}`
- `GET  /health`

응답: `{ latex: string, result: string }` 또는 4xx 에러.

## 한도

- 단일 호출 30초 타임아웃 (SIGALRM, Linux 전용)
- Railway hobby plan: 메모리 512MB
