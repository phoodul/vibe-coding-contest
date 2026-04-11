import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyEdu AI — AI 기반 차세대 교육 솔루션",
  description:
    "소크라테스식 AI 튜터링, 진로 시뮬레이터, 공문서 포맷터를 통한 학생·교사 맞춤 교육 플랫폼",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EasyEdu AI",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/logo-icon.png" />
      </head>
      <body className="min-h-screen antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"))`,
          }}
        />
        <div className="mesh-gradient">
          <div className="mesh-blob-3" />
        </div>
        <div className="noise" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
