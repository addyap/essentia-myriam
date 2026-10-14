'use client';
import { useEffect, useState } from 'react';
import { reveal } from '@/lib/contact';

// Spam harvesters read page code; people touch, click or tab to a link. So the
// page code only ever holds a link to the Contact page, and the real address
// or number is put in place at the moment the link is used. Displayed details
// appear once the page runs in a real browser.
const FALLBACK = '/contact';

export function contactUrl(kind, value, waText) {
  if (!value) return FALLBACK;
  if (kind === 'email') return `mailto:${value}`;
  if (kind === 'tel') return `tel:${value.replace(/\(0\)/g, '').replace(/[^+\d]/g, '')}`;
  if (kind === 'wa') return `https://wa.me/${value.replace(/[^\d]/g, '')}${waText ? `?text=${encodeURIComponent(waText)}` : ''}`;
  return FALLBACK;
}

// A French number written "+33 (0)6 …" reads as "+33 6 …" for dialling from anywhere.
export const displayValue = (kind, value) => (kind === 'tel' ? value.replace('(0)', '').replace(/\s+/g, ' ').trim() : value);

function useRevealed(enc, kind, active = true) {
  const [text, setText] = useState('');
  useEffect(() => { if (active) setText(displayValue(kind, reveal(enc))); }, [enc, kind, active]);
  return text;
}

export function RevealContact({ enc, kind, className, children, waText, ...rest }) {
  const text = useRevealed(enc, kind, children == null);
  const arm = (event) => { event.currentTarget.href = contactUrl(kind, reveal(enc), waText); };
  return (
    <a
      className={className}
      href={FALLBACK}
      onPointerDown={arm}
      onTouchStart={arm}
      onFocus={arm}
      onClick={arm}
      {...(kind === 'wa' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children ?? text}
    </a>
  );
}

// A detail shown as text only (e.g. the number beneath "Appeler Myriam").
export function RevealText({ enc, kind, className }) {
  return <span className={className}>{useRevealed(enc, kind)}</span>;
}
