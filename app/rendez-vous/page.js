'use client';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';

function Calendar({ b }) {
  const dn = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
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
  return (
    <>
      <section>
        <div className="wrap center">
          <span className="eyebrow">{b.eyebrow}</span>
          <h2 className="big">{b.title}</h2>
          <div className="divider" />
          <p className="lead">{b.lead}</p>
        </div>
      </section>
      <section className="section-soft" style={{ paddingTop: 20 }}>
        <div className="wrap book-grid">
          <form className="mock" onSubmit={(e) => e.preventDefault()}>
            <div className="field"><label>{b.fName}</label><input type="text" placeholder={b.fName} /></div>
            <div className="field"><label>{b.fEmail}</label><input type="email" placeholder={b.fEmail} /></div>
            <div className="field">
              <label>{b.fType}</label>
              <select>{b.opt.map((o, i) => <option key={i}>{o}</option>)}</select>
            </div>
            <div className="field"><label>{b.fMsg}</label><textarea rows={4} placeholder={b.fMsg} /></div>
            <button className="btn btn-gold" style={{ justifyContent: 'center' }}>{b.send}</button>
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
