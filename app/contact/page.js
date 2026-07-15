'use client';
import { useApp } from '@/components/Providers';
import { Icon } from '@/components/Icon';

export default function ContactPage() {
  const { t } = useApp();
  const c = t.contact;
  const b = t.booking;
  return (
    <>
      <section>
        <div className="wrap center">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 className="big">{c.title}</h2>
          <div className="divider" />
          <p className="lead">{c.lead}</p>
        </div>
      </section>
      <section className="section-soft" style={{ paddingTop: 24 }}>
        <div className="wrap book-grid">
          <form className="mock" onSubmit={(e) => e.preventDefault()}>
            <div className="field"><label>{c.fName}</label><input placeholder={c.fName} /></div>
            <div className="field"><label>{c.fEmail}</label><input placeholder={c.fEmail} /></div>
            <div className="field"><label>{c.fSubject}</label><input placeholder={c.fSubject} /></div>
            <div className="field"><label>{c.fMsg}</label><textarea rows={5} placeholder={c.fMsg} /></div>
            <button className="btn btn-gold" style={{ justifyContent: 'center' }}>{c.send}</button>
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
