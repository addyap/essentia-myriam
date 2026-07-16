'use client';
import { useState } from 'react';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';
import { PageHeader } from '@/components/PageHeader';

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
  return (
    <>
      <section>
        <PageHeader eyebrow={b.eyebrow} title={b.title} lead={b.lead} />
      </section>
      <section className="section-soft" style={{ paddingTop: 20 }}>
        <div className="wrap book-grid">
          <form className="mock" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="field"><label htmlFor="booking-name">{b.fName}</label><input id="booking-name" name="name" type="text" autoComplete="name" placeholder={b.fName} /></div>
            <div className="field"><label htmlFor="booking-email">{b.fEmail}</label><input id="booking-email" name="email" type="email" autoComplete="email" placeholder={b.fEmail} /></div>
            <div className="field">
              <label htmlFor="booking-type">{b.fType}</label>
              <select id="booking-type" name="type">{b.opt.map((o, i) => <option key={i}>{o}</option>)}</select>
            </div>
            <div className="field"><label htmlFor="booking-message">{b.fMsg}</label><textarea id="booking-message" name="message" rows={4} placeholder={b.fMsg} /></div>
            <button className="btn btn-gold" style={{ justifyContent: 'center' }} disabled={sent}>{b.send}</button>
            {sent ? <p className="notice" role="status">{t.ui.formUnavailable}</p> : null}
            <span className="kicker" style={{ marginTop: 8 }}>{b.coordsTitle}</span>
            <div className="coords">
              <div><span className="ic"><Icon name="pin" /></span> {b.address}</div>
              <div><span className="ic"><Icon name="mail" /></span> {b.email}</div>
              <div><span className="ic"><Icon name="phone" /></span> {b.phone}</div>
            </div>
          </form>
          <Calendar b={b} />
        </div>
      </section>
    </>
  );
}
