#!/usr/bin/env node
// Wraps the production build so a missing/not-yet-configured TinaCMS backend
// (NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN) never takes the public site down.
// TinaCloud tokens are often scoped to the production branch, so Vercel preview
// builds skip the admin bundle and still build the public site successfully.
import { spawnSync } from 'node:child_process';

const hasTina = Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID && process.env.TINA_TOKEN);
const isVercelPreview = process.env.VERCEL_ENV === 'preview';

const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: true }).status ?? 1;

if (hasTina && !isVercelPreview) {
  console.log('[build] TinaCMS credentials found — building the CMS admin too.');
  const tinaExit = run('npx', ['tinacms', 'build']);
  if (tinaExit !== 0) process.exit(tinaExit);
} else if (isVercelPreview) {
  console.log('[build] Vercel preview deployment — skipping the TinaCMS admin build because the token may be scoped to the production branch.');
  console.log('[build] The public site will build normally; /admin is only included in production builds.');
} else {
  console.log('[build] No TinaCMS credentials (NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN) — skipping `tinacms build`.');
  console.log('[build] The public site will build normally; /admin will 404 until TinaCloud is connected.');
}

process.exit(run('npx', ['next', 'build']));
