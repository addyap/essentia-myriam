'use client';
import { useApp } from '@/components/Providers';
import { PageHeader } from '@/components/PageHeader';
import { ContactOptions } from '@/components/ContactOptions';

export default function ContactPage() {
  const { t } = useApp();
  return <>
    <section className="page-hero"><PageHeader eyebrow={t.contact.eyebrow} title={t.contact.title} lead={t.contact.lead} scene="contact" /></section>
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
