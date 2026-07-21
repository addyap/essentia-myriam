'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { RevealContact } from '@/components/RevealContact';
import { CONTACT } from '@/lib/contact';

export default function ContactPage() {
  const { t } = useApp();
  const c = t.contact;
  const b = t.booking;
  const [sent, setSent] = useState(false);
  const [startedAt] = useState(() => Date.now());

  // Front-line spam filter. NOTE: this is a client-side deterrent only — when a
  // real backend is wired up it MUST re-check the honeypot + timing server-side
  // and add rate-limiting, since anything here can be bypassed by a determined bot.
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.company && form.company.value) return;      // honeypot filled → silently drop
    if (Date.now() - startedAt < 2500) return;           // submitted too fast to be human
    setSent(true);
  };
  return (
    <>
      <section className="page-hero">
        <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} photo="/hero-contact.jpg" />
      </section>
      <section className="section-soft" style={{ paddingTop: 24 }}>
        <div className="wrap book-grid">
          <form className="mock" onSubmit={handleSubmit}>
            <div className="hp" aria-hidden="true"><label htmlFor="contact-company">Ne pas remplir</label><input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" /></div>
            <div className="field"><label htmlFor="contact-name">{c.fName}</label><input id="contact-name" name="name" autoComplete="name" placeholder={c.fName} required /></div>
            <div className="field"><label htmlFor="contact-email">{c.fEmail}</label><input id="contact-email" name="email" type="email" autoComplete="email" placeholder={c.fEmail} required /></div>
            <div className="field"><label htmlFor="contact-subject">{c.fSubject}</label><input id="contact-subject" name="subject" placeholder={c.fSubject} /></div>
            <div className="field"><label htmlFor="contact-message">{c.fMsg}</label><textarea id="contact-message" name="message" rows={5} placeholder={c.fMsg} required /></div>
            <button className="btn btn-gold" style={{ justifyContent: 'center' }} disabled={sent}>{c.send}</button>
            {sent ? <p className="notice" role="status">{t.ui.formUnavailable}</p> : null}
          </form>
          <div>
            <div className="card">
              <h3>{c.infoTitle}</h3>
              <div className="coords">
                <div><span className="ic"><Icon name="mail" /></span> <RevealContact enc={CONTACT.email} kind="email" /></div>
                <div><span className="ic"><Icon name="phone" /></span> <RevealContact enc={CONTACT.phone} kind="tel" /></div>
                <div><span className="ic"><Icon name="whatsapp" /></span> <RevealContact enc={CONTACT.wa} kind="wa" waText={b.waGreeting}>{c.whatsapp}</RevealContact></div>
                <div><span className="ic"><Icon name="pin" /></span> {b.address}</div>
              </div>
            </div>
            <div className="card" style={{ marginTop: 20 }}>
              <h3>{c.hoursTitle}</h3>
              <p style={{ color: 'var(--muted)' }}>{c.hours}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
