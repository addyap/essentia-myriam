'use client';
import { SectionLogo } from '@/components/SectionLogo';
import { useApp } from '@/components/Providers';
import { PageHeader } from '@/components/PageHeader';
import { PendingDetails } from '@/components/PendingDetails';
import { ContactOptions } from '@/components/ContactOptions';

export default function BookingPage() {
  const { t } = useApp();
  return <>
    <section className="page-hero"><PageHeader eyebrow={t.booking.eyebrow} title={t.booking.title} lead={t.booking.directLead} scene="booking" /></section>
    <section className="section-soft"><div className="wrap section-signature"><SectionLogo /></div>
      <div className="wrap contact-layout">
        <ContactOptions />
        <aside className="contact-aside">
          <span className="eyebrow">{t.contact.hoursTitle}</span>
          <p>{t.contact.hours}</p>
          <div className="divider" />
          <span className="eyebrow">{t.booking.coordsTitle}</span>
          <p>{t.booking.address}</p>
        </aside>
      </div>
    </section>
    <section><div className="wrap section-signature"><SectionLogo /></div><div className="wrap" style={{ maxWidth: 780 }}><h2>{t.booking.stepsTitle}</h2><ol className="booking-steps">{t.booking.steps.map(step => <li key={step}>{step}</li>)}</ol></div></section>
    <section><div className="wrap section-signature"><SectionLogo /></div><div className="wrap"><PendingDetails title={t.launchDetails.booking.title} status={t.launchDetails.status} note={t.launchDetails.note} fields={t.launchDetails.booking.fields} /></div></section>
  </>;
}
