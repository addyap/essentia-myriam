// Apply only known French text fields. Preserve structural/icon values from the public site.
export function mergePreview(base, draft) {
  if (typeof base === 'string') return typeof draft === 'string' ? draft : base;
  if (Array.isArray(base)) return Array.isArray(draft) && draft.length === base.length ? base.map((value, index) => mergePreview(value, draft[index])) : base;
  if (base && typeof base === 'object') return Object.fromEntries(Object.entries(base).map(([key, value]) => [key, key === 'ic' ? value : mergePreview(value, draft?.[key])]));
  return base;
}
export function validBranch(branch) {
  return typeof branch === 'string' && /^[A-Za-z0-9][A-Za-z0-9._/-]{0,199}$/.test(branch) && !branch.includes('..') && !branch.endsWith('/') && !branch.includes('//');
}
