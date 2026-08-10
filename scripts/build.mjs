#!/usr/bin/env node
// Wraps the production build so a missing/not-yet-configured TinaCMS backend
// (NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN) never takes the public site down.
// `tinacms build` hard-fails without those — unlike `tinacms dev`, which has a
// local-only fallback — so until TinaCloud is connected we skip straight to
// `next build`. Once the env vars are set (locally or in Vercel), this
// automatically starts building the real /admin app too.
import { spawnSync } from 'node:child_process';

const hasTina = Boolean(process.env.NEXT_PUBLIC_TINA_CLIENT_ID && process.env.TINA_TOKEN);

const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: true }).status ?? 1;

if (hasTina) {
  console.log('[build] TinaCMS credentials found — building the CMS admin too.');
  const tinaExit = run('npx', ['tinacms', 'build']);
  if (tinaExit !== 0) process.exit(tinaExit);
} else {
  console.log('[build] No TinaCMS credentials (NEXT_PUBLIC_TINA_CLIENT_ID / TINA_TOKEN) — skipping `tinacms build`.');
  console.log('[build] The public site will build normally; /admin will 404 until TinaCloud is connected.');
}

process.exit(run('npx', ['next', 'build']));
