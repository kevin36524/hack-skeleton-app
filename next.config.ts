import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    'pino',
    'thread-stream',
    'pino-abstract-transport',
    'pino-std-serializers',
    '@mastra/loggers'
  ],
};

export default nextConfig;
