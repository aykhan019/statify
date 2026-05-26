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
      {
        // Deezer artwork backfill (cdn-images / e-cdns-images .dzcdn.net).
        hostname: '**.dzcdn.net',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ['@statify/shared'],
  typedRoutes: true,
};

export default nextConfig;
