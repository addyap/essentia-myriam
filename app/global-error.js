'use client';
import { RevealContact } from '@/components/RevealContact';
import { CONTACT } from '@/lib/contact';
export default function GlobalError({ reset }) {
  return <html lang="fr"><body style={{ fontFamily: 'system-ui, sans-serif', padding: '32px', color: '#26382E', background: '#FAF6EF' }}>
    <main><h1>Essentia</h1><p>Le site rencontre une interruption. Merci de réessayer.</p>
      <button onClick={reset} style={{ minHeight: 44, padding: '12px 20px' }}>Réessayer</button>
      <p><RevealContact enc={CONTACT.email} kind="email">Contacter Myriam par email</RevealContact></p>
    </main>
  </body></html>;
}
