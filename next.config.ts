import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["kordoc", "pdfjs-dist"],
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
