export const EDITOR_EMAIL = 'mdbchandale@gmail.com';
export const OWNER_EMAIL = 'antony@antonyaddy.com';
export function cmsEnvironment(env = process.env) {
  const siteId = env.DECAPBRIDGE_SITE_ID || '';
  const configured = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(siteId);
  return { configured, available: configured, siteId: configured ? siteId : null };
}
