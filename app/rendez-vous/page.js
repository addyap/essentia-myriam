'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';
import { RevealContact } from '@/components/RevealContact';
import { CONTACT } from '@/lib/contact';

function Calendar({ b }) {
  const dn = b.weekdays;
  const free = [3, 4, 10, 11, 12, 17, 18, 24, 25];
  const cells = [];
  for (let i = 0; i < 35; i++) {
    const day = i - 2;
    if (day < 1 || day > 30) cells.push(<div className="d muted" key={i} />);
    else cells.push(<div className={'d' + (free.includes(day) ? ' free' : '')} key={i}>{day}</div>);
  }
  return (
    <div className="cal">
      <div className="cal-head">
        <strong style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{b.calTitle}</strong>
        <span style={{ color: 'var(--gold-deep)' }}>‹ ›</span>
      </div>
      <div className="cal-grid">
        {dn.map((d, i) => <div className="dn" key={'dn' + i}>{d}</div>)}
        {cells}
      </div>
      <div className="pill-note"><Icon name="spark" /> {b.payNote}</div>
      <p style={{ fontSize: 12.5, color: 'var(--faint)', marginTop: 14 }}>{b.calNote}</p>
    </div>
  );
}

export default function BookingPage() {
  const { t } = useApp();
  const b = t.booking;
  const [sent, setSent] = useState(false);
  const [startedAt] = useState(() => Date.now());

  // Front-line spam filter. NOTE: client-side deterrent only — a real backend
  // MUST re-check the honeypot + timing server-side and add rate-limiting.
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
        <PageHeader eyebrow={b.eyebrow} title={b.title} lead={b.lead} photo="/hero-booking.jpg" />
      </section>
      <section className="section-soft" style={{ paddingTop: 20 }}>
        <div className="wrap book-grid">
          <form className="mock" onSubmit={handleSubmit}>
            <div className="hp" aria-hidden="true"><label htmlFor="booking-company">Ne pas remplir</label><input id="booking-company" name="company" type="text" tabIndex={-1} autoComplete="off" /></div>
            <div className="field"><label htmlFor="booking-name">{b.fName}</label><input id="booking-name" name="name" type="text" autoComplete="name" placeholder={b.fName} required /></div>
            <div className="field"><label htmlFor="booking-email">{b.fEmail}</label><input id="booking-email" name="email" type="email" autoComplete="email" placeholder={b.fEmail} required /></div>
            <div className="field">
              <label htmlFor="booking-type">{b.fType}</label>
              <select id="booking-type" name="type">{b.opt.map((o, i) => <option key={i}>{o}</option>)}</select>
            </div>
            <div className="field"><label htmlFor="booking-message">{b.fMsg}</label><textarea id="booking-message" name="message" rows={4} placeholder={b.fMsg} required /></div>
            <button className="btn btn-gold" style={{ justifyContent: 'center' }} disabled={sent}>{b.send}</button>
            {sent ? <p className="notice" role="status">{t.ui.formUnavailable}</p> : null}
            <span className="kicker" style={{ marginTop: 8 }}>{b.coordsTitle}</span>
            <div className="coords">
              <div><span className="ic"><Icon name="pin" /></span> {b.address}</div>
              <div><span className="ic"><Icon name="mail" /></span> <RevealContact enc={CONTACT.email} kind="email" /></div>
              <div><span className="ic"><Icon name="phone" /></span> <RevealContact enc={CONTACT.phone} kind="tel" /></div>
            </div>
          </form>
          <Calendar b={b} />
        </div>
      </section>
    </>
  );
}
