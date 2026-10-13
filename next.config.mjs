/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'" },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }, { source: '/cms-preview', headers: [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ] }, { source: '/cms/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};
export default nextConfig;
