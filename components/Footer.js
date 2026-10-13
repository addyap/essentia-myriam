'use client';
import Link from 'next/link';
import { useApp } from './Providers';
import { ROUTES } from '@/lib/routes';
import { RevealContact } from './RevealContact';
import { ENABLED_LANGS } from '@/lib/config';
import { CONTACT } from '@/lib/contact';

export function Footer() {
  const { t, brand, lang, setLang } = useApp();
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="name">{brand.name}</div>
            <div className="byline">{brand.byline}</div>
            <div className="sub">{brand.sub}</div>
            <p style={{ marginTop: 14, fontSize: 14, maxWidth: 280 }}>{t.footer.blurb}</p>
            <div className="footer-languages" role="group" aria-label={t.ui.language}>
              {ENABLED_LANGS.map(code => <button type="button" key={code} lang={code} aria-pressed={lang === code} onClick={() => setLang(code)}>{{ fr: 'Français', en: 'English', it: 'Italiano', es: 'Español' }[code]}</button>)}
            </div>
          </div>
          <div>
            <h3>{t.footer.explore}</h3>
            <ul>
              <li><Link href={ROUTES.about}>{t.nav.about}</Link></li>
              <li><Link href={ROUTES.coaching}>{t.nav.coaching}</Link></li>
              <li><Link href={ROUTES.rh}>{t.nav.rh}</Link></li>
            </ul>
          </div>
          <div>
            <h3>{t.footer.contact}</h3>
            <ul>
              <li><Link href={ROUTES.booking}>{t.ui.book}</Link></li>
              <li><Link href={ROUTES.contact}>{t.nav.contact}</Link></li>
              <li><RevealContact enc={CONTACT.email} kind="email" /></li>
              <li><RevealContact enc={CONTACT.wa} kind="wa" waText={t.booking.waGreeting}>{t.contact.whatsapp}</RevealContact></li>
            </ul>
          </div>
          <div>
            <h3>{t.footer.legal}</h3>
            <ul>
              <li><Link href={ROUTES.legalNotice}>{t.footer.legalNotice}</Link></li>
              <li><Link href={ROUTES.privacy}>{t.footer.privacy}</Link></li>
              <li><Link href={ROUTES.rgpd}>{t.footer.rgpd}</Link></li>
              <li><Link href={ROUTES.ethics}>{t.footer.ethics}</Link></li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>{t.footer.rights.replace('{year}', new Date().getFullYear()).replace('{name}', brand.name)}</span>
          <a href="/cms/index.html" className="footer-editor-link" rel="nofollow" lang="fr">Espace d’édition</a>
          <span className="script" style={{ fontSize: 15 }}>{t.footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
