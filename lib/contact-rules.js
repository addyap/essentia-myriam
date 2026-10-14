// Contact form validation, shared by the browser form and the /api/contact route
// so both apply identical rules. Holds no addresses: it is loaded in the browser.
export const LIMITS = { name: 100, email: 200, message: 5000, minMessage: 10 };

const EMAIL = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;
const clean = (value) => (typeof value === 'string' ? value.replace(/\r\n?/g, '\n').trim() : '');

export function validateContact(input = {}) {
  // Collapsing whitespace keeps line breaks out of the name, and so out of the subject line.
  const name = clean(input.name).replace(/\s+/g, ' ');
  const email = clean(input.email);
  const message = clean(input.message);
  const errors = {};
  if (!name || name.length > LIMITS.name) errors.name = true;
  if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = true;
  if (message.length < LIMITS.minMessage || message.length > LIMITS.message) errors.message = true;
  return { ok: Object.keys(errors).length === 0, errors, data: { name, email, message } };
}
