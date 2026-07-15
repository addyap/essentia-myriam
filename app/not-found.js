'use client';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  const { t } = useApp();
  const n = t.notFound;
  return (
    <section>
      <div className="wrap center">
        <span className="eyebrow">{n.eyebrow}</span>
        <h2 className="big">{n.title}</h2>
        <div className="divider" />
        <p className="lead" style={{ marginBottom: 30 }}>{n.text}</p>
        <Link className="btn btn-gold" href={ROUTES.home}>{n.backBtn}</Link>
      </div>
    </section>
  );
}
