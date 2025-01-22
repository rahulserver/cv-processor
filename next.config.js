/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['pdfkit'],

  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },
};

module.exports = nextConfig;
