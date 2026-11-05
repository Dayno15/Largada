import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Evita que o Next use um package-lock.json de uma pasta acima do projeto.
  turbopack: { root: __dirname },
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1'],
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: { unoptimized: true },
};

export default nextConfig;
