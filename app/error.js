'use client';
import Link from 'next/link';
import { RevealContact } from '@/components/RevealContact';
import { CONTACT } from '@/lib/contact';
export default function ErrorPage({ reset }) {
  return <section lang="fr"><div className="wrap">
    <h1 className="big">Une interruption passagère</h1>
    <p className="lead">La page n’a pas pu s’afficher. Vous pouvez réessayer ou nous contacter directement.</p>
    <div className="contact-actions">
      <button type="button" className="btn btn-gold" onClick={reset}>Réessayer</button>
      <Link className="contact-line" href="/contact">Contacter Myriam</Link>
      <RevealContact className="contact-line" enc={CONTACT.email} kind="email">Écrire un email</RevealContact>
    </div>
  </div></section>;
}
