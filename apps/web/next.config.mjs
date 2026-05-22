/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@statify/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
