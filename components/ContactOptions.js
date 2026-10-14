'use client';
import { useApp } from './Providers';
import { RevealContact, RevealText } from './RevealContact';
import { CONTACT } from '@/lib/contact';
import { Icon } from './Icon';

export function ContactOptions() {
  const { t } = useApp();
  return <div className="contact-options">
    <span className="eyebrow">{t.contact.infoTitle}</span>
    <h2>{t.contact.directTitle}</h2>
    <p className="prose">{t.contact.directLead}</p>
    <div className="contact-actions">
      <RevealContact enc={CONTACT.wa} kind="wa" waText={t.booking.waGreeting} className="btn btn-whatsapp"><Icon name="whatsapp" />{t.contact.whatsapp}</RevealContact>
      <RevealContact enc={CONTACT.email} kind="email" className="contact-line"><Icon name="mail" />{t.contact.emailAction}<span aria-hidden="true">↗</span></RevealContact>
      <RevealContact enc={CONTACT.phone} kind="tel" className="contact-line"><Icon name="phone" /><span className="contact-line-text"><span>{t.contact.phoneAction}</span><RevealText className="contact-line-detail" enc={CONTACT.phone} kind="tel" /></span><span aria-hidden="true">↗</span></RevealContact>
    </div>
  </div>;
}
