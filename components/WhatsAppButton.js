'use client';
import { useApp } from './Providers';
import { Icon } from './Icon';

export function WhatsAppButton() {
  const { t } = useApp();
  return (
    <a
      className="wa-float"
      href={`https://wa.me/${t.booking.waNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.contact.whatsapp}
      title={t.contact.whatsapp}
    >
      <Icon name="whatsapp" />
    </a>
  );
}
