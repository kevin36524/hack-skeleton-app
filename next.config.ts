import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'pub-a9cd5deb9a674cf781fe4e56075c4c4d.r2.dev' },
    ],
  },
};

export default nextConfig;
