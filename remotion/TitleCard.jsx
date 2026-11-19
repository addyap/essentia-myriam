import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont as loadSerif } from '@remotion/google-fonts/GFSDidot';
import { loadFont as loadScript } from '@remotion/google-fonts/Parisienne';

// Same palette and type as app/globals.css.
const colors = { cream: '#FAF6EF', ink: '#26382E', gold: '#FCC200', goldDeep: '#765916' };
const { fontFamily: serif } = loadSerif();
const { fontFamily: script } = loadScript();

export const TitleCard = ({ name, tagline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const logoIn = spring({ frame, fps, config: { damping: 200 } });
  const nameIn = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const rule = spring({ frame: frame - 28, fps, config: { damping: 200 }, durationInFrames: 30 });
  const taglineIn = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.cream,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '180px 160px',
        opacity: fadeOut,
      }}
    >
      <Img
        src={staticFile('logo.webp')}
        style={{
          height: 220,
          opacity: logoIn,
          transform: `scale(${interpolate(logoIn, [0, 1], [0.9, 1])})`,
        }}
      />
      <div
        style={{
          fontFamily: script,
          fontSize: 168,
          lineHeight: 1.1,
          color: colors.ink,
          marginTop: 24,
          opacity: nameIn,
          transform: `translateY(${interpolate(nameIn, [0, 1], [30, 0])}px)`,
        }}
      >
        {name}
      </div>
      <div
        style={{
          width: 120 * rule,
          height: 3,
          background: colors.gold,
          borderRadius: 2,
          margin: '28px 0 36px',
        }}
      />
      <div
        style={{
          fontFamily: serif,
          fontSize: 72,
          color: colors.goldDeep,
          textAlign: 'center',
          opacity: taglineIn,
          transform: `translateY(${interpolate(taglineIn, [0, 1], [20, 0])}px)`,
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};
