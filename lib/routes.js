// Route map: content key -> real URL path
export const ROUTES = {
  home: '/',
  about: '/a-propos',
  coaching: '/accompagnement',
  rh: '/conseil-rh',
  formations: '/formations',
  resources: '/ressources',
  podcast: '/podcast',
  booking: '/rendez-vous',
  contact: '/contact',
  legalNotice: '/mentions-legales',
  privacy: '/confidentialite',
  rgpd: '/rgpd',
  ethics: '/charte-ethique',
};
// Order shown in the main navigation (booking is a button, handled separately)
export const NAV = ['home', 'about', 'coaching', 'rh', 'formations', 'resources', 'contact'];
// Blog articles live under this path (app/blog/[slug]); /blog itself redirects to the hub.
export const articlePath = (slug) => `/blog/${slug}`;
