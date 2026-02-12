import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: [
    '@mastra/libsql',
    '@libsql/client',
    'googleapis',
    'pino',
    'pino-abstract-transport',
    'thread-stream',
    '@mastra/loggers'
  ],
  turbopack: {},
};

export default nextConfig;
