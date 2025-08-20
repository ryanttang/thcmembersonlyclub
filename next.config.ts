import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'thcmembersonlyclub.s3.us-west-1.amazonaws.com' },
      { protocol: 'https', hostname: 'thcmembersonlyclub.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
    ],
    qualities: [25, 50, 75, 85, 100],
  },
};

export default nextConfig;
