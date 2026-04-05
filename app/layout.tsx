import type { Metadata } from "next";
import { Outfit, Noto_Sans_KR } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-korean",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MindPalace — AI 기억의 궁전",
  description:
    "교과서를 마인드맵으로 펼치고, 기억의 궁전에 저장하라. AI가 만드는 새로운 학습 경험.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${outfit.variable} ${notoSansKR.variable} font-sans antialiased`}
      >
        <div className="mesh-gradient" />
        <div className="noise-overlay" />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
