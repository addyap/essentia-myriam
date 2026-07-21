'use client';
import { useState, useEffect } from 'react';

const decode = (s) => {
  try {
    return typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString('utf8');
  } catch {
    return '';
  }
};

// Split an email into a human-readable, bot-unfriendly form for the pre-hydration
// (and no-JS) fallback: "name [at] domain [point] com". Real users can still read
// and type it; regex harvesters that scan the raw HTML miss it.
const maskEmail = (email) => {
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${user} [at] ${domain.replace(/\./g, ' [point] ')}`;
};

// Renders a contact link (email / phone / WhatsApp) whose real destination is
// assembled only in the browser after mount. During SSR and before hydration it
// renders a non-harvestable fallback instead of the raw endpoint.
//
// Props:
//   enc      base64-encoded value (from lib/contact CONTACT)
//   kind     'email' | 'tel' | 'wa'
//   children optional visible label; when omitted the (decoded) value is shown
//   waText   optional pre-filled WhatsApp message (kind='wa' only)
export function RevealContact({ enc, kind, className, children, waText, ...rest }) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    setValue(decode(enc));
  }, [enc]);

  // Pre-hydration / no-JS: never emit the raw endpoint into the HTML.
  if (value === null) {
    let fallback = children;
    if (fallback === undefined) {
      const raw = decode(enc);
      fallback = kind === 'email' ? maskEmail(raw) : raw; // phone digits are far less harvested than emails
    }
    return <span className={className} {...rest}>{fallback}</span>;
  }

  let href;
  if (kind === 'email') href = `mailto:${value}`;
  else if (kind === 'tel') href = `tel:${value.replace(/[^+\d]/g, '')}`;
  else if (kind === 'wa') {
    href = `https://wa.me/${value.replace(/[^\d]/g, '')}`;
    if (waText) href += `?text=${encodeURIComponent(waText)}`;
  } else href = value;

  const external = kind === 'wa';
  return (
    <a
      className={className}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children ?? value}
    </a>
  );
}
