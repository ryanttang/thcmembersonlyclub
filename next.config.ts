import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'your-bucket.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'cdn.yourdomain.com' },
    ],
  },
};

export default nextConfig;
