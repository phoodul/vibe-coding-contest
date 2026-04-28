/**
 * Phase G-06 — Legend Tutor 메인 채팅 페이지.
 *
 * 베이스: docs/architecture-g06-legend.md §8.1.
 * 본 라우트는 기존 `/euler-tutor` 의 채팅 컴포넌트를 무수정 재사용한다.
 * (architecture §8.1 매핑 — `/euler` → `/legend` 의 메인 진입점은 `/euler-tutor` 와 동일 UI 패턴)
 *
 * G06-21: re-export only (기존 컴포넌트 무수정).
 */
export { default } from "@/app/euler-tutor/page";
