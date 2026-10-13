export function cmsEnvironment(env = process.env) {
  const local = env.NODE_ENV === 'development' && !env.VERCEL && env.NEXT_PUBLIC_KEYSTATIC_LOCAL === 'true';
  const configured = Boolean(env.KEYSTATIC_GITHUB_CLIENT_ID && env.KEYSTATIC_GITHUB_CLIENT_SECRET && env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG && env.KEYSTATIC_SECRET?.length >= 32);
  return { local, configured, available: local || configured };
}
