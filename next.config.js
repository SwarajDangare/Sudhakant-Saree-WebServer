/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Explicitly set distDir to ensure proper path resolution
  distDir: '.next',
  // Ensure proper image configuration
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig
