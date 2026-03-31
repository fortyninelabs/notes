/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  /* config options here */
  output: 'export',
  distDir: 'out',
  // Asset prefix needs to be './' for Electron file:// protocol, but empty for dev server
  assetPrefix: isProd ? './' : '',
  // Trailing slash is good for static export but can be optional in dev
  trailingSlash: isProd ? true : false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
