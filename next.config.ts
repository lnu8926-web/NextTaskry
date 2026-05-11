import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 개발 중 Fast Refresh 개선
  reactStrictMode: true,


  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Turbopack 설정 (Next.js 16+)
  turbopack: {},
};

export default nextConfig;
