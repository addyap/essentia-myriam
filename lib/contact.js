// Contact details, stored scrambled (reversed, then base64) so that neither the
// page code nor this public repository contains a recognisable address or
// number for spam harvesters. They are unscrambled only in the visitor's
// browser at the moment a link is used (components/RevealContact.js), or on the
// server when an email is sent.
export const reveal = (value) => {
  try { return [...atob(value)].reverse().join(''); } catch { return ''; }
};
export const scramble = (value) => btoa([...value].reverse().join(''));

export const CONTACT = {
  email: 'bW9jLmxpYW1nQGVsYWRuYWhjYmRt',      // Myriam's email
  phone: 'MjQgNjAgMDMgMTAgNikwKCAzMys=',      // Myriam's phone, as displayed
  wa: 'MjQ2MDAzMTA2MzM=',                   // Myriam's WhatsApp
};
