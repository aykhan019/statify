/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'is*-ssl.mzstatic.com',
        protocol: 'https',
      },
      {
        hostname: 'i.scdn.co',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ['@statify/shared'],
  typedRoutes: true,
};

export default nextConfig;
