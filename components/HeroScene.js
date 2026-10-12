'use client';
import Image from 'next/image';
import { HeroVideo } from './HeroVideo';
import { useApp } from './Providers';

const scenes = new Set(['home', 'about', 'coaching', 'rh', 'resources', 'contact', 'booking']);
const videos = { about: 'sunrise-valley', rh: 'misty-lake', resources: 'sunlit-leaves', coaching: 'golden-sea', contact: 'quiet-shore', booking: 'mountain-clouds' };

export function HeroScene({ scene = 'home' }) {
  const { t } = useApp();
  if (!scenes.has(scene)) return null;
  const video = videos[scene];
  return <>
    <div className={`hero-scene hero-scene--${scene}`}>
      <Image src={`/images/nature/${video || scene}.webp`} alt="" fill sizes="100vw" priority className="hero-scene-photo" />
      {video && <HeroVideo desktopSource={`/videos/${video}.mp4`} mobileSource={`/videos/${video}-mobile.mp4`} controlsTarget={null} labels={t.ui.backgroundVideo} />}
    </div>
  </>;
}
