// Contact form rules, shared by the browser form and the /api/contact route so
// both validate identically. Messages go to Myriam's inbox through Resend; the
// sender must be an address on the domain verified in Resend.
export const CONTACT_TO = 'mdbchandale@gmail.com';
export const CONTACT_FROM = 'Essentia <contact@essentiademdb.com>';
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

export function composeEmail({ name, email, message }, { from = CONTACT_FROM, to = CONTACT_TO, lang = 'fr' } = {}) {
  return {
    from,
    to: [to],
    reply_to: email,
    subject: `Nouveau message du site Essentia — ${name}`,
    text: [
      `Nom : ${name}`,
      `Email : ${email}`,
      `Langue du site : ${lang.toUpperCase()}`,
      '',
      message,
      '',
      '—',
      'Envoyé depuis le formulaire de contact de essentiademdb.com.',
      'Répondez directement à cet email pour écrire à cette personne.',
    ].join('\n'),
  };
}
