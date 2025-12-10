import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['@mastra/libsql', '@libsql/client'],
  },
  turbopack: {},
};

export default nextConfig;
