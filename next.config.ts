import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: [
    '@mastra/libsql',
    '@libsql/client',
    '@mastra/loggers',
    'pino',
    'pino-pretty',
    'thread-stream'
  ],
  turbopack: {},
};

export default nextConfig;
