/**
 * 22차 (2026-05-09) — 개인정보처리방침 (/privacy).
 *
 * 한국 개인정보보호법 + 정보통신망법 + 표준 SaaS 패턴.
 */
import { LegalLayout } from '@/components/legal/LegalLayout';
import {
  PRIVACY_VERSION,
  PRIVACY_EFFECTIVE_DATE,
  BUSINESS_INFO,
} from '@/lib/legal/meta';

export const metadata = {
  title: '개인정보처리방침 — easyedu.ai',
  description: 'easyedu.ai 개인정보 수집·이용·제3자 제공·보유 기간·정보주체 권리',
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="개인정보처리방침"
      version={PRIVACY_VERSION}
      effectiveDate={PRIVACY_EFFECTIVE_DATE}
    >
      <p>
        {BUSINESS_INFO.name}(이하 &ldquo;회사&rdquo;)은 정보주체의 자유와 권리 보호를
        위해 「개인정보 보호법」 및 관련 법령에 따라 적법하게 개인정보를 처리하고
        안전하게 관리하고 있습니다.
      </p>

      <h2>1. 수집하는 개인정보의 항목</h2>
      <ul>
        <li>
          <strong>필수 항목</strong>: 이메일 주소, OAuth 제공자 식별자 (Google /
          GitHub / Kakao), 로그인 일시, 사용 IP
        </li>
        <li>
          <strong>선택 항목</strong>: 이름, 학년, 휴대전화번호 (베타 신청 또는 결제
          시), 학교명
        </li>
        <li>
          <strong>결제 시 자동 수집</strong>: 결제 수단 (카드사 / 간편결제 종류),
          토스페이먼츠 결제 키, 청구 주소 (전자 영수증 발송용). 카드 번호 자체는
          토스페이먼츠가 보관하고 회사는 보관하지 않습니다.
        </li>
        <li>
          <strong>학습 활동 자동 생성</strong>: 입력한 문제 텍스트·이미지, 풀이
          대화 이력, 사용 시간·횟수, 사용한 페르소나·도구
        </li>
      </ul>

      <h2>2. 수집 방법</h2>
      <ul>
        <li>홈페이지 회원가입 (OAuth)</li>
        <li>유료 결제 시 토스페이먼츠 결제 위젯</li>
        <li>고객 문의 (이메일)</li>
        <li>서비스 이용 과정에서 자동 생성</li>
      </ul>

      <h2>3. 개인정보의 처리 목적</h2>
      <ul>
        <li>회원 식별 및 본인 확인, 부정 이용 방지</li>
        <li>AI 코칭 응답 생성 및 학습 활동 리포트 제공</li>
        <li>요금제 결제, 환불, 영수증 발급</li>
        <li>법령상 의무 이행 (전자상거래법·세무 신고)</li>
        <li>고객 문의 응대 및 분쟁 해결</li>
      </ul>

      <h2>4. 개인정보의 보유 및 이용기간</h2>
      <ul>
        <li>
          회원 정보 (이메일·OAuth 식별자·이름·학년): 회원 탈퇴 즉시 파기 (단,
          관련 법령상 보관 의무가 있는 정보는 아래 항목에 따라 보관)
        </li>
        <li>
          전자상거래 등에서의 소비자보호에 관한 법률에 따른 보관:
          <ul>
            <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
          </ul>
        </li>
        <li>통신비밀보호법에 따른 로그 기록 보관: 3개월</li>
        <li>학습 활동 기록 (대화·풀이 이력): 회원 탈퇴 즉시 파기</li>
      </ul>

      <h2>5. 개인정보의 제3자 제공</h2>
      <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 아래의 경우 예외로 합니다:</p>
      <ul>
        <li>이용자가 사전에 동의한 경우</li>
        <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차에 따라 수사기관이 요구하는 경우</li>
      </ul>

      <h2>6. 개인정보 처리의 위탁</h2>
      <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다:</p>
      <table>
        <thead>
          <tr><th>수탁업체</th><th>위탁 업무 내용</th><th>국가</th></tr>
        </thead>
        <tbody>
          <tr><td>Vercel Inc.</td><td>웹 서비스 호스팅 (Asia/Seoul region)</td><td>미국 / 한국</td></tr>
          <tr><td>Supabase Inc.</td><td>데이터베이스 / 인증 / 파일 저장</td><td>미국 / 한국</td></tr>
          <tr><td>Anthropic</td><td>AI 응답 생성 (Claude Sonnet · Opus · Haiku)</td><td>미국</td></tr>
          <tr><td>OpenAI</td><td>AI 응답 생성 (GPT-5.5)</td><td>미국</td></tr>
          <tr><td>Google LLC</td><td>AI 응답 생성 (Gemini 3.1 Pro), OAuth 인증</td><td>미국</td></tr>
          <tr><td>토스페이먼츠</td><td>결제 처리, 빌링키 보관, 환불 처리</td><td>대한민국</td></tr>
          <tr><td>GitHub Inc.</td><td>OAuth 인증</td><td>미국</td></tr>
          <tr><td>Kakao Corp.</td><td>OAuth 인증</td><td>대한민국</td></tr>
        </tbody>
      </table>
      <p>
        AI 응답 생성을 위탁받은 업체는 이용자가 입력한 문제·이미지 텍스트를 AI 모델에
        전달하나, 자체 모델 학습 (fine-tuning) 에는 사용하지 않습니다 (해당 업체의
        zero-data-retention 정책 적용).
      </p>

      <h2>7. 정보주체의 권리·의무 및 행사 방법</h2>
      <ul>
        <li>이용자는 언제든지 등록된 개인정보의 열람·정정·삭제·처리 정지를 요구할 수 있습니다.</li>
        <li>
          서비스 내 <code>/account</code> 페이지에서 직접 처리하거나, 개인정보 보호책임자
          이메일로 신청 가능합니다.
        </li>
        <li>회사는 요청을 받은 날로부터 10일 이내에 처리합니다.</li>
      </ul>

      <h2>8. 개인정보의 안전성 확보 조치</h2>
      <ul>
        <li>관리적: 개인정보 취급 직원 최소화, 정기 교육, 접근 권한 관리</li>
        <li>기술적: HTTPS 통신, DB 암호화, OAuth 토큰 안전 보관, 비정상 접근 모니터링</li>
        <li>물리적: 위탁 업체의 데이터센터 보안 정책 준용</li>
      </ul>

      <h2>9. 쿠키의 운영</h2>
      <p>
        회사는 자동 로그인 유지를 위해 OAuth 인증 쿠키를 사용합니다. 이용자는 브라우저
        설정에서 쿠키 저장을 거부할 수 있으나, 이 경우 로그인 상태가 유지되지 않을 수
        있습니다.
      </p>

      <h2>10. 개인정보 보호책임자</h2>
      <ul>
        <li>이름: {BUSINESS_INFO.privacy_officer_name}</li>
        <li>이메일: {BUSINESS_INFO.privacy_officer_email}</li>
        <li>전화: {BUSINESS_INFO.phone}</li>
      </ul>
      <p>
        개인정보 침해 신고는 다음 기관에 문의 가능합니다:
      </p>
      <ul>
        <li>개인정보보호위원회 (privacy.go.kr / 국번없이 182)</li>
        <li>개인정보 분쟁조정위원회 (kopico.go.kr / 1833-6972)</li>
        <li>대검찰청 사이버수사과 (spo.go.kr / 02-3480-3573)</li>
        <li>경찰청 사이버수사국 (ecrm.cyber.go.kr / 국번없이 182)</li>
      </ul>

      <h2>부칙</h2>
      <p>본 개인정보처리방침은 {PRIVACY_EFFECTIVE_DATE} 부터 시행됩니다.</p>
    </LegalLayout>
  );
}
