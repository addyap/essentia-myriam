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

// Wording comes from content/fr/contact.json ("E-mail reçu par Myriam" in the
// CMS); any field left empty falls back to these defaults.
export const EMAIL_DEFAULTS = {
  senderName: 'Essentia',
  subject: 'Nouveau message du site Essentia — {nom}',
  labelName: 'Nom',
  labelEmail: 'Email',
  labelLanguage: 'Langue du site',
  footer: 'Envoyé depuis le formulaire de contact de essentiademdb.com.\nRépondez directement à cet email pour écrire à cette personne.',
};
const oneLine = (value) => String(value).replace(/[\r\n]+/g, ' ').trim();

export function composeEmail({ name, email, message }, { from = CONTACT_FROM, to = CONTACT_TO, lang = 'fr', wording = {} } = {}) {
  const text = { ...EMAIL_DEFAULTS };
  for (const key of Object.keys(EMAIL_DEFAULTS)) if (typeof wording[key] === 'string' && wording[key].trim()) text[key] = wording[key].trim();
  // A custom display name replaces "Essentia" in front of the sending address.
  const sender = oneLine(text.senderName).replace(/[<>"]/g, '');
  const address = from.match(/<([^>]+)>/)?.[1] || from;
  return {
    from: `${sender} <${address}>`,
    to: [to],
    reply_to: email,
    subject: oneLine(text.subject.replaceAll('{nom}', name)),
    text: [
      `${text.labelName} : ${name}`,
      `${text.labelEmail} : ${email}`,
      `${text.labelLanguage} : ${lang.toUpperCase()}`,
      '',
      message,
      '',
      '—',
      text.footer,
    ].join('\n'),
  };
}
