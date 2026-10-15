// Contact form validation, shared by the browser form and the /api/contact route
// so both apply identical rules. Holds no addresses: it is loaded in the browser.
export const LIMITS = { name: 100, email: 200, message: 5000, minMessage: 10, links: 2 };

// Spam is mostly links. A genuine first message rarely needs more than one or
// two, and never HTML or forum-style link markup.
const LINK = /\b(?:https?:\/\/|www\.)\S+/gi;
const MARKUP = /<a\s[^>]*href|\[url[\]=]|\[link[\]=]/i;
export const countLinks = (text) => (String(text).match(LINK) || []).length;

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const clean = (value) => (typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '');

export function validateContact(input = {}) {
  // Collapsing whitespace keeps line breaks out of the name, and so out of the subject line.
  const name = clean(input.name).replace(/\s+/g, ' ');
  const email = clean(input.email);
  const message = clean(input.message);
  const errors = {};
  if (!name || name.length > LIMITS.name || countLinks(name) || MARKUP.test(name)) errors.name = true;
  if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = true;
  if (message.length < LIMITS.minMessage || message.length > LIMITS.message) errors.message = true;
  else if (countLinks(message) > LIMITS.links || MARKUP.test(message)) errors.links = true;
  return { ok: Object.keys(errors).length === 0, errors, data: { name, email, message } };
}
