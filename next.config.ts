import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    '@libsql/client',
    '@mastra/libsql'
  ],
};

export default nextConfig;
