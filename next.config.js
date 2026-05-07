const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ['whisper.advancedmarketing.co', 'localhost:3001'] }
  },
  async headers() {
    return [
      {
        source: '/api/license/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
