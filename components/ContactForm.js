'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from './Providers';
import { LogoMark } from './LogoMark';
import { ROUTES } from '@/lib/routes';
import { LIMITS, validateContact } from '@/lib/contact-rules';
import { messageDigest, solveProof } from '@/lib/proof';

const MIN_AGE_MS = 3000, REFRESH_AFTER_MS = 23 * 60 * 60 * 1000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// A signed token from the server marks when the form was opened (lib/form-token.js).
async function fetchToken() {
  const response = await fetch('/api/contact/token', { cache: 'no-store' });
  if (!response.ok) throw new Error('token');
  return { ...(await response.json()), at: Date.now() };
}

// Sends a message to Myriam through /api/contact. Rules match the server's, so
// visitors see problems before sending; the direct links below stay as a fallback.
export function ContactForm() {
  const { t, lang } = useApp();
  const f = t.contact.form;
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | busy
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const ticket = useRef(null);
  const thanks = useRef(null);
  const renew = () => { ticket.current = fetchToken().catch(() => null); };
  useEffect(renew, []);
  // Move focus to the thank-you panel so screen readers announce it.
  useEffect(() => { if (status === 'sent') thanks.current?.focus(); }, [status]);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const check = validateContact(values);
    setErrors(check.errors);
    if (!check.ok) {
      const first = Object.keys(check.errors)[0];
      form.querySelector(`[name="${first === 'links' ? 'message' : first}"]`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      // Never send without a token: the server would quietly treat it as a bot.
      const ready = async () => {
        let current = await ticket.current;
        if (!current || Date.now() - current.at > REFRESH_AFTER_MS) { renew(); current = await ticket.current; }
        if (!current) throw new Error('token');
        await wait(MIN_AGE_MS - (Date.now() - current.at));
        return current;
      };
      const digest = await messageDigest(check.data);
      const send = async () => {
        const { token, bits } = await ready();
        const proof = await solveProof(token.split('.')[1], digest, bits);
        return fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, lang, token, proof }),
        });
      };
      let response = await send();
      // A token can expire if the page stayed open for a day: fetch a new one and retry once.
      if (response.status === 409) { renew(); response = await send(); }
      if (response.ok) { setConfirmed(Boolean((await response.json().catch(() => ({}))).confirmed)); renew(); setStatus('sent'); return; }
      const result = await response.json().catch(() => ({}));
      if (response.status === 400 && result.fields?.length) {
        setErrors(Object.fromEntries(result.fields.map((name) => [name, true])));
        setStatus('idle');
        return;
      }
      setStatus(response.status === 429 ? 'busy' : 'error');
    } catch {
      setStatus('error');
    }
  }

  const field = (name, label, control) => (
    <div className="field">
      <label htmlFor={`contact-${name}`}>{label}</label>
      {control({
        id: `contact-${name}`,
        name,
        required: true,
        'aria-invalid': errors[name] || (name === 'message' && errors.links) ? true : undefined,
        'aria-describedby': errors[name] ? `contact-${name}-error` : name === 'message' && errors.links ? 'contact-links-error' : undefined,
      })}
      {errors[name] ? <p id={`contact-${name}-error`} className="field-error">{f[`error${name[0].toUpperCase()}${name.slice(1)}`]}</p> : null}
      {name === 'message' && errors.links ? <p id="contact-links-error" className="field-error">{f.errorLinks}</p> : null}
    </div>
  );

  if (status === 'sent') return (
    <div className="contact-thanks" role="status">
      <span className="contact-thanks-mark"><LogoMark /></span>
      <h2 className="contact-thanks-title" ref={thanks} tabIndex={-1}>{f.successTitle}</h2>
      <span className="contact-thanks-rule" aria-hidden="true" />
      <p className="contact-thanks-text">{f.success}</p>
      {confirmed ? <p className="contact-thanks-note">{f.confirmNote}</p> : null}
      <button type="button" className="editorial-link contact-thanks-again" onClick={() => setStatus('idle')}>
        {f.sendAnother}
      </button>
    </div>
  );

  const message = { error: f.error, busy: f.busy }[status];
  return (
    <form className="contact-form" method="post" action="/api/contact" noValidate onSubmit={submit}>
      <span className="eyebrow">{f.eyebrow}</span>
      <h2>{f.title}</h2>
      <p className="prose">{f.lead}</p>
      <div className="contact-form-fields">
        {field('name', f.name, (props) => <input {...props} type="text" autoComplete="name" maxLength={LIMITS.name} />)}
        {field('email', f.email, (props) => <input {...props} type="email" autoComplete="email" inputMode="email" maxLength={LIMITS.email} />)}
        {field('message', f.message, (props) => <textarea {...props} rows={6} maxLength={LIMITS.message} />)}
        <p className="form-hint">{f.messageHint}</p>
        {/* Hidden from people; simple bots fill it in and are quietly ignored. */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="contact-website">Website</label>
          <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <p className="form-note">{f.privacy} <Link href={ROUTES.privacy}>{f.privacyLink}</Link></p>
      <button className="btn btn-gold" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? f.sending : f.send}
      </button>
      <p className={'form-status' + (message ? ' is-error' : '')} role="status" aria-live="polite">
        {message || ''}
      </p>
    </form>
  );
}
