'use client';
import { useApp } from '@/components/Providers';
import { PageHeader } from '@/components/PageHeader';
import { ContactOptions } from '@/components/ContactOptions';

export default function BookingPage() {
  const { t } = useApp();
  return <>
    <section className="page-hero"><PageHeader eyebrow={t.booking.eyebrow} title={t.booking.title} lead={t.booking.directLead} scene="booking" /></section>
    <section className="section-soft">
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
  </>;
}
