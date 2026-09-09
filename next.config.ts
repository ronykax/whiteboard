import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    remotePatterns: [
      {
        hostname: "github.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
