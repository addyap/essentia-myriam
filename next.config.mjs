/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // tinacms dev's local wrapper proxies through 127.0.0.1 as well as
  // localhost; without this, Next 16 blocks its HMR requests as
  // cross-origin (dev-only setting, no effect on the Vercel build).
  allowedDevOrigins: ['127.0.0.1'],
};
export default nextConfig;
