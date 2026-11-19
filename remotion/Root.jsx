import { Composition } from 'remotion';
import { z } from 'zod';
import { TitleCard } from './TitleCard';

export const titleCardSchema = z.object({
  name: z.string(),
  tagline: z.string(),
});

export const RemotionRoot = () => (
  <Composition
    id="TitleCard"
    component={TitleCard}
    schema={titleCardSchema}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{
      name: 'Essentia',
      tagline: "accompagner l'humain, en profondeur",
    }}
  />
);
