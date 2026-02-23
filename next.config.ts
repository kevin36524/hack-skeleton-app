import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    '@libsql/client',
    '@mastra/libsql',
    'pino',
    'thread-stream',
    'pino-abstract-transport',
    'pino-std-serializers',
    '@mastra/loggers'
  ],
};

export default nextConfig;
