import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: ['@mastra/libsql', '@libsql/client', 'googleapis'],
  turbopack: {},
};

export default nextConfig;
