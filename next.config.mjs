/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  poweredByHeader: false,
  // Articles live at /blog/<slug>; the list itself is the Blog & podcast page.
  async redirects() {
    return [{ source: '/blog', destination: '/ressources', permanent: true }];
  },
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
    ] }, { source: '/cms/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    // Myriam's private writing page: never listed, and its address is never
    // passed on to the sites its links open.
    { source: '/ecrire', headers: [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive, nosnippet, noimageindex' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
    ] },
    // Files uploaded through the CMS are served from this site's own address,
    // where the editor keeps its login. Opened directly, an uploaded SVG or HTML
    // file must not be able to run script: the sandbox forbids it, and this
    // policy replaces the general one above, so it repeats frame-ancestors.
    { source: '/uploads/:path*', headers: [
      { key: 'Content-Security-Policy', value: "default-src 'none'; img-src 'self' data:; media-src 'self'; style-src 'unsafe-inline'; sandbox; frame-ancestors 'none'; base-uri 'none'; form-action 'none'" },
    ] }];
  },
};
export default nextConfig;
