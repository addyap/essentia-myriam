// Public contact endpoints, stored base64-encoded on purpose.
//
// They are decoded and turned into real mailto:/tel:/wa.me links ONLY in the
// browser, after hydration (see components/RevealContact). That keeps the raw
// address, phone number and WhatsApp number out of the server-rendered HTML that
// spam harvesters scrape — the single biggest source of unsolicited contact.
//
// This is deterrence, not secrecy: the details are fully public to real visitors
// the instant the page loads. It just stops the naive "regex the HTML for
// name@domain" bots that feed spam lists.
export const CONTACT = {
  email: 'bWRiY2hhbmRhbGVAZ21haWwuY29t',       // mdbchandale@gmail.com
  phone: 'KzMzICgwKTYgMDEgMzAgMDYgNDI=',        // +33 (0)6 01 30 06 42
  wa: 'MzM2MDEzMDA2NDI=',                       // 33601300642
};
