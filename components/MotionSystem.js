'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MotionSystem() {
  const pathname = usePathname();
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const main = document.querySelector('main');
    const targets = new Set();
    let observer;
    const reveal = el => {
      el.classList.remove('motion-pending');
      observer?.unobserve(el);
    };
    const setup = () => {
      observer?.disconnect();
      if (preference.matches || !('IntersectionObserver' in window)) { targets.forEach(reveal); return; }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: .15, rootMargin: '0px 0px -32px 0px' });
      const candidates = new Set(main.querySelectorAll('section:not(.hero-cine) h2, .card, .portrait, .about-nature'));
      candidates.forEach(el => {
        if (el.matches('h2')) {
          if (el.previousElementSibling?.matches('.kicker')) candidates.add(el.previousElementSibling);
          if (el.nextElementSibling?.matches('.lead')) candidates.add(el.nextElementSibling);
        }
      });
      candidates.forEach((el) => {
        if (el.closest('.hero-cine')) return;
        if (targets.has(el)) { if (el.classList.contains('motion-pending')) observer.observe(el); return; }
        targets.add(el);
        el.classList.add('motion-reveal');
        const siblings = [...el.parentElement.children].filter(child => child.matches('.card'));
        el.style.setProperty('--reveal-delay', `${Math.min(Math.max(0, siblings.indexOf(el)), 3) * 60}ms`);
        if (el.getBoundingClientRect().top >= innerHeight) {
          el.classList.add('motion-pending');
          observer.observe(el);
        }
      });
    };
    setup();
    const additions = new MutationObserver(records => {
      if (records.some(record => record.addedNodes.length)) setup();
    });
    additions.observe(main, { childList: true, subtree: true });
    preference.addEventListener('change', setup);
    return () => {
      observer?.disconnect(); additions.disconnect();
      targets.forEach(el => { reveal(el); el.classList.remove('motion-reveal'); el.style.removeProperty('--reveal-delay'); });
      preference.removeEventListener('change', setup);
    };
  }, [pathname]);
  return null;
}
