'use client';
import { useApp } from './Providers';

export function SkipLink() {
  const { t } = useApp();
  return <a href="#main-content" className="skip-link">{t.ui.skip}</a>;
}
