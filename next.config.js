/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable file uploads by increasing the body parser limit
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Add any other configurations you need
  // For example, if you need to use the experimental app directory:
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
