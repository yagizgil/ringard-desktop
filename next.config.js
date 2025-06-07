/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

const internalHost = process.env.TAURI_DEV_HOST || 'localhost';


const nextConfig = {
  // output: 'export',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.1v9.gg',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.forgecdn.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: '*',
        port: '',
        pathname: '/**'
      }
    ],
  },
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`
}

module.exports = nextConfig
