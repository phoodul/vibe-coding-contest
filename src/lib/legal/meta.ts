/**
 * 22차 (2026-05-09) — 법무 문서 메타데이터.
 *
 * 약관 4종 (terms / privacy / refund / business-info) 의 시행일·버전 중앙 관리.
 * 변경 시 SUMMARY 갱신 + 사용자에게 1회 동의 다시 받기 (큰 변경 시).
 *
 * 사업자 정보 (BUSINESS_INFO) 는 환경변수로 override 가능 — 부산 임대 이전 후
 * 사용자가 vercel env 에 추가하면 즉시 반영.
 */

export const TERMS_VERSION = '1.0';
export const TERMS_EFFECTIVE_DATE = '2026-05-15'; // 베타 종료 + 결제 활성화 시점 가정

export const PRIVACY_VERSION = '1.0';
export const PRIVACY_EFFECTIVE_DATE = '2026-05-15';

export const REFUND_VERSION = '1.0';
export const REFUND_EFFECTIVE_DATE = '2026-05-15';

/**
 * 사업자 정보 — 부산 임대 이전 + 통신판매업 신고 후 사용자 입력 필요.
 * 베타 동안은 placeholder 노출. vercel env 에 추가 시 자동 교체.
 */
export const BUSINESS_INFO = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || '(사업자 등록 후 갱신)',
  representative: process.env.NEXT_PUBLIC_BUSINESS_REP || '(대표자명 갱신)',
  registration_number:
    process.env.NEXT_PUBLIC_BUSINESS_REG_NO || '(사업자등록번호 갱신)',
  ecommerce_number:
    process.env.NEXT_PUBLIC_BUSINESS_ECOMMERCE_NO || '(통신판매업 신고 후 갱신)',
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '부산광역시 (임대 이전 후 갱신)',
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'phoodul@gmail.com',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '(연락처 갱신)',
  privacy_officer_name:
    process.env.NEXT_PUBLIC_PRIVACY_OFFICER || '(개인정보 보호책임자명)',
  privacy_officer_email:
    process.env.NEXT_PUBLIC_PRIVACY_OFFICER_EMAIL || 'phoodul@gmail.com',
  service_url: 'https://easyedu.ai',
  hosting_provider: 'Vercel Inc. (미국, 한국 region)',
} as const;
