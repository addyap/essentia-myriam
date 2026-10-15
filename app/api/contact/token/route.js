// Hands the contact form a signed token when the page opens (see lib/form-token.js).
import { formSecret, issueToken } from '../../../../lib/form-token.js';
import { PROOF_BITS } from '../../../../lib/proof.js';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };

export function GET() {
  const secret = formSecret();
  if (!secret) return Response.json({ error: 'unavailable' }, { status: 503, headers });
  return Response.json({ token: issueToken(secret), bits: PROOF_BITS }, { headers });
}
