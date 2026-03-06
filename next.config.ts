import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "readdy.ai",
      },
      {
        protocol: "https",
        hostname: "public.readdy.ai",
      },
    ],
  },
};

export default nextConfig;
