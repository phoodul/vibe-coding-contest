import type { Metadata } from "next";
import { Outfit, Noto_Sans_KR, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="ko" className={cn("dark", "font-sans", geist.variable)}>
      <body
        className={`${geist.variable} ${notoSansKR.variable} font-sans antialiased`}
      >
        <div className="mesh-gradient" />
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
