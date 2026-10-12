'use client';
import Link from 'next/link';
import { useApp } from '@/components/Providers';
import { PageHeader } from '@/components/PageHeader';
import { ROUTES } from '@/lib/routes';

export default function ResourcesPage() {
  const { t } = useApp();
  return <>
    <section className="page-hero"><PageHeader eyebrow={t.resources.eyebrow} title={t.resources.title} lead={t.resources.lead} scene="resources" /></section>
    <section className="section-soft"><div className="wrap"><Link className="btn btn-gold" href={ROUTES.contact}>{t.nav.contact}</Link></div></section>
  </>;
}
