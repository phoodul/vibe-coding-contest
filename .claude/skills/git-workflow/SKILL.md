---
name: git-workflow
description: Git 워크플로우 및 커밋 컨벤션 가이드. Conventional Commits 형식으로 커밋 메시지를 작성하고, 브랜치 전략, PR 작성, .gitignore 설정 등 Git 관련 모든 작업을 안내한다. "커밋 메시지 작성", "브랜치 전략", "git 사용법", "PR 작성", "커밋해줘", "변경사항 정리" 등의 요청에서 반드시 이 skill을 사용한다.
---

# Git Workflow & Conventional Commits

일관되고 추적 가능한 Git 히스토리를 유지하기 위한 워크플로우 가이드.

## Conventional Commits

### 형식
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Type 종류

| Type | 용도 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 | `feat(auth): 소셜 로그인 추가` |
| `fix` | 버그 수정 | `fix(cart): 수량 0 이하로 내려가는 문제 수정` |
| `docs` | 문서 변경 | `docs(readme): 설치 가이드 업데이트` |
| `style` | 코드 포맷팅 (동작 변경 없음) | `style: trailing comma 적용` |
| `refactor` | 리팩토링 (기능 변경 없음) | `refactor(user): Repository 패턴 적용` |
| `test` | 테스트 추가/수정 | `test(login): 로그인 실패 케이스 추가` |
| `chore` | 빌드, 설정 변경 | `chore: flutter 3.24로 업그레이드` |
| `perf` | 성능 개선 | `perf(list): ListView.builder로 전환` |
| `ci` | CI/CD 설정 | `ci: GitHub Actions 워크플로우 추가` |

### 규칙
- description은 명령형 현재 시계로 작성 (한국어는 "~추가", "~수정", "~제거" 형태)
- 첫 글자 소문자 (영어인 경우)
- 마침표 없음
- 50자 이내 (한국어 기준 25자 내외)
- Breaking change는 `!` 추가: `feat(api)!: 응답 형식 변경`

## 브랜치 전략 (GitHub Flow)

```
main (항상 배포 가능)
 ├── feat/social-login
 ├── fix/cart-quantity-bug
 ├── refactor/user-repository
 └── chore/update-dependencies
```

### 브랜치 네이밍
```
<type>/<간단한-설명>
```
- 영어 소문자 + 하이픈
- 예: `feat/google-login`, `fix/splash-crash`, `refactor/theme-system`

## 커밋 작성 워크플로우

1. `git status`로 변경 사항 확인
2. 관련 파일만 선택적 스테이징: `git add <files>`
3. 논리적 단위로 커밋 분리 (한 커밋 = 한 변경 목적)
4. Conventional Commit 형식으로 메시지 작성
5. 커밋 전 `flutter analyze` 통과 확인

## .gitignore (Flutter 프로젝트)

```gitignore
# Flutter/Dart
.dart_tool/
.packages
build/
.flutter-plugins
.flutter-plugins-dependencies

# IDE
.idea/
.vscode/
*.iml

# OS
.DS_Store
Thumbs.db

# 환경 변수 (절대 커밋하지 않는다)
.env
.env.*
*.keystore
*.jks
google-services.json
GoogleService-Info.plist
```

## PR(Pull Request) 작성 템플릿

```markdown
## 변경 사항
- 무엇을 왜 변경했는지 간단히 설명

## 변경 유형
- [ ] 새 기능
- [ ] 버그 수정
- [ ] 리팩토링
- [ ] 기타

## 테스트
- [ ] 기존 테스트 통과
- [ ] 새 테스트 추가

## 스크린샷 (UI 변경 시)
```
