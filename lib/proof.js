// A small proof of work for the contact form, shared by the browser and the
// server. Before sending, the browser searches for a number that, hashed with
// the server's nonce and the message itself, starts with PROOF_BITS zero bits:
// about half a second for one visitor, but a real cost for anyone sending in
// bulk. Because the message is part of the hash, each message needs its own
// search. Uses Web Crypto, available in browsers and in Node.

export const PROOF_BITS = 13;

const encoder = new TextEncoder();
const sha256 = async (text) => new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(text)));
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

function leadingZeroBits(bytes) {
  let bits = 0;
  for (const byte of bytes) {
    if (byte === 0) { bits += 8; continue; }
    return bits + Math.clz32(byte) - 24;
  }
  return bits;
}

// The validated fields, so the browser and server hash exactly the same text.
export const messageDigest = async ({ name, email, message }) => hex(await sha256(`${name}\n${email}\n${message}`));

export async function solveProof(nonce, digest, bits = PROOF_BITS) {
  for (let counter = 0; ; counter++) {
    if (leadingZeroBits(await sha256(`${nonce}:${digest}:${counter}`)) >= bits) return counter;
  }
}

export async function checkProof(nonce, digest, counter, bits = PROOF_BITS) {
  if (!Number.isSafeInteger(counter) || counter < 0) return false;
  return leadingZeroBits(await sha256(`${nonce}:${digest}:${counter}`)) >= bits;
}
