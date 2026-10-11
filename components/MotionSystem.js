'use client';
import { useEffect } from 'react';

export function MotionSystem() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let observer;
    const targets = [...document.querySelectorAll('main section:not(.hero-cine) h2, main section:not(.hero-cine) .card')];
    const setup = () => {
      observer?.disconnect();
      if (preference.matches || !('IntersectionObserver' in window)) {
        targets.forEach(el => el.classList.remove('motion-pending'));
        return;
      }
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove('motion-pending');
          observer.unobserve(entry.target);
        });
      }, { threshold: .15 });
      targets.forEach(el => {
        el.classList.add('motion-reveal');
        if (el.getBoundingClientRect().top > innerHeight) el.classList.add('motion-pending');
        observer.observe(el);
      });
    };
    setup();
    preference.addEventListener('change', setup);
    return () => {
      observer?.disconnect();
      targets.forEach(el => el.classList.remove('motion-pending'));
      preference.removeEventListener('change', setup);
    };
  }, []);
  return null;
}
