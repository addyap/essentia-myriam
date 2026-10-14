// Contact form rules, shared by the browser form and the /api/contact route so
// both validate identically. Messages go to Myriam's inbox through Resend; the
// sender must be an address on the domain verified in Resend.
import { SITE_URL, TEST_MODE } from './config.js';

export const CONTACT_TO = 'mdbchandale@gmail.com';
export const CONTACT_FROM = 'Essentia de Myriam Diougoan Blanch <contact@essentiademdb.com>';
// In test mode (lib/config.js) messages go to Antony alone instead of Myriam.
export const TEST_RECIPIENT = 'formations@antonyaddy.com';
export const RECIPIENT = TEST_MODE ? TEST_RECIPIENT : CONTACT_TO;
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
  senderName: 'Essentia de Myriam Diougoan Blanch',
  subject: 'Nouveau message du site Essentia de Myriam Diougoan Blanch — {nom}',
  labelName: 'Nom',
  labelEmail: 'Email',
  labelLanguage: 'Langue du site',
  footer: 'Envoyé depuis le formulaire de contact de essentiademdb.com.\nRépondez directement à cet email pour écrire à cette personne.',
};
const oneLine = (value) => String(value).replace(/[\r\n]+/g, ' ').trim();
// The display name (editable in the CMS) goes in front of the sending address.
const sender = (name, from) => `${oneLine(name).replace(/[<>"]/g, '')} <${from.match(/<([^>]+)>/)?.[1] || from}>`;

export function composeEmail({ name, email, message }, { from = CONTACT_FROM, to = RECIPIENT, lang = 'fr', wording = {} } = {}) {
  const text = { ...EMAIL_DEFAULTS };
  for (const key of Object.keys(EMAIL_DEFAULTS)) if (typeof wording[key] === 'string' && wording[key].trim()) text[key] = wording[key].trim();
  return {
    from: sender(text.senderName, from),
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

// Automatic acknowledgement to the visitor, in the language they used. It
// deliberately repeats nothing they typed, so the form cannot be used to send
// someone else arbitrary text; replies go to Myriam.
export function composeConfirmation({ email }, { from = CONTACT_FROM, replyTo = RECIPIENT, senderName = EMAIL_DEFAULTS.senderName, lang = 'fr', title = '', subject, body, notice = '' }) {
  const plain = [String(body).trim(), String(notice).trim()].filter(Boolean).join('\n\n');
  return {
    from: sender(senderName || EMAIL_DEFAULTS.senderName, from),
    to: [email],
    reply_to: replyTo,
    subject: oneLine(subject),
    text: plain,
    html: confirmationHtml({ lang, title, subject: oneLine(subject), body, notice }),
  };
}

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const paragraphs = (value) => String(value).trim().split(/\n{2,}/).filter(Boolean)
  .map((block) => escape(block).replace(/\n/g, '<br>').replace(/(?:https?:\/\/)?(www\.essentiademdb\.com)/g, '<a href="https://$1" style="color:#765916;text-decoration:none;">$1</a>'));

// Table layout and inline styles: the only kind email apps render reliably.
// Brand colours match the site; the script face falls back to system cursives.
function confirmationHtml({ lang, title, subject, body, notice }) {
  const serif = "Georgia,'Times New Roman',serif";
  const blocks = paragraphs(body).map((html) => `<p style="margin:0 0 18px;font-family:${serif};font-size:17px;line-height:1.7;color:#26382E;">${html}</p>`).join('');
  const footnote = paragraphs(notice).map((html) => `<p style="margin:0;font-family:${serif};font-size:13px;line-height:1.6;color:#8A887E;">${html}</p>`).join('');
  return `<!doctype html>
<html lang="${escape(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${escape(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#F3EBDD;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EBDD;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFDFA;border:1px solid #E6DCC8;">
<tr><td align="center" style="padding:48px 40px 4px;"><img src="${SITE_URL}/email/monogram.png" width="78" height="96" alt="Essentia de Myriam Diougoan Blanch" style="display:block;border:0;outline:none;"></td></tr>
${title ? `<tr><td align="center" style="padding:6px 40px 0;font-family:'Parisienne','Snell Roundhand','Apple Chancery',cursive;font-size:54px;line-height:1.2;color:#765916;">${escape(title)}</td></tr>` : ''}
<tr><td align="center" style="padding:16px 40px 30px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="60" height="2" style="width:60px;height:2px;background:#FCC200;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding:0 48px 12px;">${blocks}</td></tr>
${footnote ? `<tr><td style="padding:22px 48px 40px;border-top:1px solid #EFE7D8;">${footnote}</td></tr>` : '<tr><td style="padding:0 0 28px;"></td></tr>'}
</table>
<p style="margin:22px 0 0;font-family:${serif};font-size:12px;letter-spacing:1px;color:#8A887E;">ESSENTIA DE MYRIAM DIOUGOAN BLANCH · <a href="${SITE_URL}" style="color:#765916;text-decoration:none;">essentiademdb.com</a></p>
</td></tr></table>
</body></html>`;
}
