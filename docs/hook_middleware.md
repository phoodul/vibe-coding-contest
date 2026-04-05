# Claude Code Hooks 상세 가이드

> `.claude/settings.local.json`에 등록된 Hook 스크립트의 동작 원리와 커스텀 방법

---

## Hook 실행 흐름

```
사용자 입력
    ↓
Claude가 Tool 실행 결정
    ↓
[PreToolUse Hook] ← security-guard.sh (Bash 명령어 차단)
    ↓
도구 실행 (파일 읽기, 편집, 명령어 등)
    ↓
[PostToolUse Hook] ← post-edit-lint.sh (Edit/Write 후 타입 체크)
    ↓
Claude 응답 생성
    ↓
[Stop Hook] ← stop-build-check.sh (응답 완료 시 빌드 확인)
```

---

## 현재 설정 (.claude/settings.local.json)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/security-guard.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/post-edit-lint.sh" }]
      },
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/post-edit-lint.sh" }]
      }
    ],
    "Stop": [
      {
        "hooks": [{ "type": "command", "command": "bash .claude/hooks/stop-build-check.sh" }]
      }
    ]
  }
}
```

---

## Exit Code 규칙

| exit code | 의미 | 동작 |
|-----------|------|------|
| `0` | 성공/통과 | 도구 실행 허용, 계속 진행 |
| `1` | 경고 | stderr 내용을 Claude 컨텍스트에 주입 (실행은 허용) |
| `2` | **차단** | 도구 실행을 **거부**하고 차단 사유를 Claude에 전달 |

**보안 훅(PreToolUse)은 반드시 exit 2를 사용해야 실제 강제력이 생긴다.**

---

## 각 Hook 스크립트 상세

### security-guard.sh (PreToolUse → Bash)

| 차단 패턴 | 위험 | exit code |
|-----------|------|-----------|
| `rm -rf /`, `rm -rf ~`, `rm -rf ..` | 파일시스템 파괴 | 2 |
| `git push --force main/master` | 원격 히스토리 파괴 | 2 |
| `git reset --hard` | 로컬 변경 손실 | 2 |
| `curl \| bash`, `wget \| bash` | 원격 코드 실행 | 2 |
| `cat .env`, `echo .key` | 시크릿 유출 | 2 |
| `npm config set` | 글로벌 설정 변경 | 2 |

### post-edit-lint.sh (PostToolUse → Edit/Write)

1. `package.json` 존재 여부 확인 → 없으면 스킵
2. `node_modules` 존재 여부 확인 → 없으면 스킵
3. `npx tsc --noEmit --pretty` 실행 → 에러 상위 20줄 출력
4. 항상 `exit 0` → 경고만 표시, 작업은 계속

### stop-build-check.sh (Stop)

1. 프로젝트 초기화 여부 확인
2. `git diff`로 `.ts/.tsx` 파일 변경 확인 → 없으면 스킵
3. `npx next build --no-lint` → 하위 5줄 출력
4. 항상 `exit 0`

---

## 커스텀 Hook 추가 방법

### 예시: PostToolUse에 Prettier 자동 포맷팅 추가

```bash
# .claude/hooks/post-edit-format.sh
#!/bin/bash
PROJECT_ROOT="/c/Users/JSS/vibe-coding-contest"
if [ ! -f "$PROJECT_ROOT/package.json" ]; then exit 0; fi

# stdin에서 변경된 파일 경로 추출
INPUT=$(cat)
FILE=$(echo "$INPUT" | grep -oP '"file_path"\s*:\s*"\K[^"]*' 2>/dev/null)

if [ -n "$FILE" ] && [[ "$FILE" =~ \.(ts|tsx|css|json)$ ]]; then
  cd "$PROJECT_ROOT"
  npx prettier --write "$FILE" 2>/dev/null
fi

exit 0
```

settings.local.json에 추가:
```json
{
  "matcher": "Edit",
  "hooks": [{ "type": "command", "command": "bash .claude/hooks/post-edit-format.sh" }]
}
```

---

## 대회 임팩트

| Hook | 방지하는 문제 | 심사 항목 |
|------|-------------|----------|
| security-guard | 시크릿 유출, 데이터 손실 | 기술적 완성도 |
| post-edit-lint | 타입 에러 누적 (Doom Loop) | 기술적 완성도 |
| stop-build-check | 배포 불가능한 상태로 커밋 | 배포 안정성 |
| Lefthook pre-commit | 포맷팅/린트 에러 | 기술적 완성도 |
| Commitlint | 불규칙한 커밋 히스토리 | AI 활용 리포트 |
