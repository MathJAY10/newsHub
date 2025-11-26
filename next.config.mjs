/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  api: {
    bodyParser: false,
    responseLimit: false,
  },

  experimental: {
    middlewareClientMaxBodySize: 200 * 1024 * 1024, // 200MB
    serverActionsBodySizeLimit: "200mb",
  },
};

export default nextConfig;
