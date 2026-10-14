'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApp } from './Providers';
import { LogoMark } from './LogoMark';
import { ROUTES } from '@/lib/routes';
import { LIMITS, validateContact } from '@/lib/contact-rules';

// Sends a message to Myriam through /api/contact. Rules match the server's, so
// visitors see problems before sending; the direct links below stay as a fallback.
export function ContactForm() {
  const { t, lang } = useApp();
  const f = t.contact.form;
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error | busy
  const [errors, setErrors] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const opened = useRef(0);
  const thanks = useRef(null);
  useEffect(() => { opened.current = Date.now(); }, []);
  // Move focus to the thank-you panel so screen readers announce it.
  useEffect(() => { if (status === 'sent') thanks.current?.focus(); }, [status]);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const check = validateContact(values);
    setErrors(check.errors);
    if (!check.ok) {
      form.querySelector(`[name="${Object.keys(check.errors)[0]}"]`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, lang, elapsedMs: Date.now() - opened.current }),
      });
      if (response.ok) { setConfirmed(Boolean((await response.json().catch(() => ({}))).confirmed)); setStatus('sent'); }
      else setStatus(response.status === 429 ? 'busy' : 'error');
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
        'aria-invalid': errors[name] ? true : undefined,
        'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
      })}
      {errors[name] ? <p id={`contact-${name}-error`} className="field-error">{f[`error${name[0].toUpperCase()}${name.slice(1)}`]}</p> : null}
    </div>
  );

  if (status === 'sent') return (
    <div className="contact-thanks" role="status">
      <span className="contact-thanks-mark"><LogoMark /></span>
      <h2 className="contact-thanks-title" ref={thanks} tabIndex={-1}>{f.successTitle}</h2>
      <span className="contact-thanks-rule" aria-hidden="true" />
      <p className="contact-thanks-text">{f.success}</p>
      {confirmed ? <p className="contact-thanks-note">{f.confirmNote}</p> : null}
      <button type="button" className="editorial-link contact-thanks-again" onClick={() => { opened.current = Date.now(); setStatus('idle'); }}>
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
