'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';

export default function ContactPage() {
  const { t } = useApp();
  const c = t.contact;
  const b = t.booking;
  const [sent, setSent] = useState(false);
  return (
    <>
      <section className="page-hero">
        <PageHeader eyebrow={c.eyebrow} title={c.title} lead={c.lead} photo="/hero-contact.jpg" />
      </section>
      <section className="section-soft" style={{ paddingTop: 24 }}>
        <div className="wrap book-grid">
          <form className="mock" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
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
                <div><span className="ic"><Icon name="mail" /></span> <a href={`mailto:${b.email}`}>{b.email}</a></div>
                <div><span className="ic"><Icon name="phone" /></span> <a href={`tel:+${b.waNumber}`}>{b.phone}</a></div>
                <div><span className="ic"><Icon name="whatsapp" /></span> <a href={`https://wa.me/${b.waNumber}`} target="_blank" rel="noopener noreferrer">{c.whatsapp}</a></div>
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
