/**
 * 22차 (2026-05-09) — 사업자 정보 (/business-info).
 *
 * 전자상거래법 제13조 (신원 및 거래조건의 정보 제공) 의무. 부산 임대 이전 +
 * 통신판매업 신고 후 환경변수로 사업자 정보 갱신 (lib/legal/meta.ts BUSINESS_INFO).
 */
import { LegalLayout } from '@/components/legal/LegalLayout';
import { BUSINESS_INFO } from '@/lib/legal/meta';

export const metadata = {
  title: '사업자 정보 — easyedu.ai',
  description: 'easyedu.ai 사업자 정보 — 상호·대표자·사업자번호·통신판매업 신고·연락처',
};

export default function BusinessInfoPage() {
  return (
    <LegalLayout title="사업자 정보" version="1.0" effectiveDate="2026-05-15">
      <p>
        「전자상거래 등에서의 소비자보호에 관한 법률」 제13조 및 시행령에 따라 본
        서비스의 사업자 정보를 다음과 같이 제공합니다.
      </p>

      <table>
        <tbody>
          <tr>
            <th>상호 (사업자명)</th>
            <td>{BUSINESS_INFO.name}</td>
          </tr>
          <tr>
            <th>대표자</th>
            <td>{BUSINESS_INFO.representative}</td>
          </tr>
          <tr>
            <th>사업자등록번호</th>
            <td>{BUSINESS_INFO.registration_number}</td>
          </tr>
          <tr>
            <th>통신판매업 신고번호</th>
            <td>{BUSINESS_INFO.ecommerce_number}</td>
          </tr>
          <tr>
            <th>사업장 주소</th>
            <td>{BUSINESS_INFO.address}</td>
          </tr>
          <tr>
            <th>이메일</th>
            <td>
              <a href={`mailto:${BUSINESS_INFO.email}`}>{BUSINESS_INFO.email}</a>
            </td>
          </tr>
          <tr>
            <th>고객센터 전화</th>
            <td>{BUSINESS_INFO.phone}</td>
          </tr>
          <tr>
            <th>응대 시간</th>
            <td>평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00 제외)</td>
          </tr>
          <tr>
            <th>개인정보 보호책임자</th>
            <td>
              {BUSINESS_INFO.privacy_officer_name} (
              <a href={`mailto:${BUSINESS_INFO.privacy_officer_email}`}>
                {BUSINESS_INFO.privacy_officer_email}
              </a>
              )
            </td>
          </tr>
          <tr>
            <th>호스팅 제공자</th>
            <td>{BUSINESS_INFO.hosting_provider}</td>
          </tr>
          <tr>
            <th>서비스 URL</th>
            <td>
              <a href={BUSINESS_INFO.service_url} target="_blank" rel="noreferrer">
                {BUSINESS_INFO.service_url}
              </a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>결제 대행</h2>
      <p>
        본 서비스의 결제는 <strong>토스페이먼츠 (NHN KCP 자회사) </strong>가 대행하며,
        카드 정보는 회사가 보관하지 않습니다. 결제 관련 문의는 위 이메일·전화로 연락
        주시기 바랍니다. 토스페이먼츠 고객센터: 1544-7772.
      </p>

      <h2>분쟁 해결 기관</h2>
      <ul>
        <li>한국소비자원 — 1372 (소비자상담센터)</li>
        <li>전자거래분쟁조정위원회 — 02-3679-0900 (ecmc.or.kr)</li>
        <li>공정거래위원회 — 1357 (ftc.go.kr)</li>
      </ul>

      <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
        ※ 사업자 등록 절차 진행 중인 경우 일부 항목이 임시 표기되어 있을 수 있으며,
        등록 완료 즉시 갱신됩니다.
      </p>
    </LegalLayout>
  );
}
