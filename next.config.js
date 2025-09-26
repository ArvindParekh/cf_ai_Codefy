/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  distDir: 'out',
  assetPrefix: '',
  basePath: '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
  },
  async rewrites() {
    return [
      {
        source: '/agents/:path*',
        destination: 'http://localhost:8787/agents/:path*',
      },
    ]
  },
}

module.exports = nextConfig