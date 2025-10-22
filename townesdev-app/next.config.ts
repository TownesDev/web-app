import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

// Bundle analyzer setup
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable optimizePackageImports for common libraries
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
}

export default withBundleAnalyzer(nextConfig)
