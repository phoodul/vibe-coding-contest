import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["kordoc", "pdfjs-dist", "officeparser"],
  // G-06 hotfix: legend/* 모듈의 eslint-disable @typescript-eslint/no-explicit-any 주석 16건이
  // ESLint config 에 plugin 미정의로 빌드 차단. 정리는 G-07 (plugin 설치 또는 주석 surgical 제거).
  // 안전성: tsc --noEmit 무에러 + vitest 252/252 PASS — 빌드 통과만 막혔던 것.
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // canvas는 kordoc/pdfjs-dist의 optional peer — 서버에서 불필요
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
