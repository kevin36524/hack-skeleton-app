import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
