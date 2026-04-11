import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "원클릭 수업준비 | EasyEdu AI",
  description: "수업 주제 하나로 슬라이드, 배부용 문서, 모의 테스트, 교육 영상을 한번에 생성합니다.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
