import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  serverExternalPackages: [
    '@mastra/libsql',
    '@mastra/core',
    '@mastra/loggers',
    '@mastra/memory',
    '@mastra/pg',
    '@mastra/mysql',
    '@mastra/evals',
    '@libsql/client',
    'pino',
    'thread-stream',
  ],
  turbopack: {},
};

export default nextConfig;
