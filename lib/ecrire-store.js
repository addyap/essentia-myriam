// Where /ecrire keeps each locked notebook: the site's own Vercel Blob storage,
// private (no public address). On a developer's machine without that storage,
// an in-memory stand-in is used so sync can be tried locally.
import { get, put, list, BlobPreconditionFailedError } from '@vercel/blob';

export class Conflict extends Error {}

const path = (vault) => `ecrire/${vault}.bin`;
const readAll = async (stream) => new Uint8Array(await new Response(stream).arrayBuffer());

const blobStore = {
  async read(vault, etag) {
    const result = await get(path(vault), { access: 'private', useCache: false, ...(etag ? { ifNoneMatch: etag } : {}) });
    if (!result) return null;
    if (result.statusCode === 304) return { etag: result.blob.etag, unchanged: true };
    return { etag: result.blob.etag, bytes: await readAll(result.stream) };
  },
  async write(vault, bytes, etag) {
    try {
      const result = await put(path(vault), Buffer.from(bytes), {
        access: 'private', contentType: 'application/octet-stream', addRandomSuffix: false,
        ...(etag ? { ifMatch: etag } : { allowOverwrite: false }),
      });
      return result.etag;
    } catch (error) {
      // Someone (another device) saved first: the caller reads, merges, retries.
      if (error instanceof BlobPreconditionFailedError || /exist/i.test(error?.message || '')) throw new Conflict();
      throw error;
    }
  },
  async count() {
    const { blobs } = await list({ prefix: 'ecrire/', limit: 20 });
    return blobs.length;
  },
};

const memory = new Map();
let tick = 0;
const memoryStore = {
  async read(vault, etag) {
    const item = memory.get(vault);
    if (!item) return null;
    if (etag && etag === item.etag) return { etag, unchanged: true };
    return { etag: item.etag, bytes: item.bytes };
  },
  async write(vault, bytes, etag) {
    const item = memory.get(vault);
    if (item ? item.etag !== etag : Boolean(etag)) throw new Conflict();
    const next = { etag: `"m${++tick}"`, bytes: new Uint8Array(bytes) };
    memory.set(vault, next);
    return next.etag;
  },
  async count() { return memory.size; },
};

export function vaultStore(env = process.env) {
  // Vercel connects a store either with a read-write key or, on newer
  // projects, with the store's id plus the deployment's own sign-in (OIDC).
  if (env.BLOB_READ_WRITE_TOKEN || env.BLOB_STORE_ID) return blobStore;
  if (env.NODE_ENV === 'development' || env.ECRIRE_MEMORY_STORE === '1') return memoryStore;
  return null;
}
