/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@statify/shared'],
  typedRoutes: true,
};

export default nextConfig;
