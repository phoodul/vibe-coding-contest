// Conventional Commits 강제 — AI 활용 리포트에서 커밋 로그 자동 구조화
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새 기능
        'fix',      // 버그 수정
        'docs',     // 문서
        'style',    // 포맷팅 (동작 변경 없음)
        'refactor', // 리팩토링
        'perf',     // 성능 개선
        'test',     // 테스트
        'chore',    // 빌드, 설정
        'ci',       // CI/CD
        'revert',   // 되돌리기
      ],
    ],
  },
}
