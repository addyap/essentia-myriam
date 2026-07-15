'use client';
import Link from 'next/link';
import { useApp } from './Providers';
import { ROUTES } from '@/lib/routes';

export function Footer() {
  const { t, brand } = useApp();
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="name">{brand.name}</div>
            <div className="sub">{brand.sub}</div>
            <p style={{ marginTop: 14, fontSize: 14, maxWidth: 280 }}>{t.footer.blurb}</p>
            <div className="chips-langs" style={{ marginTop: 16 }}>
              <span>Français</span><span>English</span><span>Italiano</span><span>Español</span>
            </div>
          </div>
          <div>
            <h5>{t.footer.explore}</h5>
            <ul>
              <li><Link href={ROUTES.about}>{t.nav.about}</Link></li>
              <li><Link href={ROUTES.coaching}>{t.nav.coaching}</Link></li>
              <li><Link href={ROUTES.rh}>{t.nav.rh}</Link></li>
              <li><Link href={ROUTES.resources}>{t.nav.resources}</Link></li>
            </ul>
          </div>
          <div>
            <h5>{t.footer.contact}</h5>
            <ul>
              <li><Link href={ROUTES.booking}>{t.ui.book}</Link></li>
              <li><Link href={ROUTES.contact}>{t.nav.contact}</Link></li>
              <li><a href="mailto:contact@essentia.com">contact@essentia.com</a></li>
            </ul>
          </div>
          <div>
            <h5>{t.footer.legal}</h5>
            <ul>
              <li><a href="#">{t.footer.legalNotice}</a></li>
              <li><a href="#">{t.footer.privacy}</a></li>
              <li><a href="#">{t.footer.rgpd}</a></li>
              <li><a href="#">{t.footer.ethics}</a></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{t.footer.rights.replace('{year}', new Date().getFullYear()).replace('{name}', brand.name)}</span>
          <span className="script" style={{ fontSize: 15 }}>{t.footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
