'use client';

import Image from 'next/image';

export function HeroScene({ scene = 'home' }) {
  return (
    <div className={`hero-scene hero-scene--${scene}`} aria-hidden="true">
      <Image src={`/images/heroes/${scene}.webp`} alt="" fill priority sizes="100vw"
        className="hero-scene-photo" style={{ animation: 'none' }} />
    </div>
  );
}
