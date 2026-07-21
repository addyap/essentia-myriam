'use client';
import { useApp } from './Providers';
import { Icon } from './Icon';
import { RevealContact } from './RevealContact';
import { CONTACT } from '@/lib/contact';

export function WhatsAppButton() {
  const { t } = useApp();
  return (
    <RevealContact
      enc={CONTACT.wa}
      kind="wa"
      waText={t.booking.waGreeting}
      className="wa-float"
      aria-label={t.contact.whatsapp}
      title={t.contact.whatsapp}
    >
      <Icon name="whatsapp" />
    </RevealContact>
  );
}
