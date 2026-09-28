import Image from 'next/image';

const scenes = new Set(['home', 'coaching', 'rh', 'resources', 'contact', 'booking']);

export function HeroScene({ scene = 'home' }) {
  if (!scenes.has(scene)) return null;
  return (
    <div className={`hero-scene hero-scene--${scene}`} aria-hidden="true">
      <Image src={`/images/nature/${scene}.webp`} alt="" fill sizes="100vw" priority className="hero-scene-photo" />
    </div>
  );
}
