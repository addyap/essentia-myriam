import Image from 'next/image';

// Natural pixel dimensions per source file, so next/image gets an accurate
// width/height (and correct aspect ratio) whichever variant is requested.
const VARIANTS = {
  '/logo.webp': { width: 681, height: 842 },
  '/logo-hero-2.webp': { width: 536, height: 838 },
};

// The wrapping element at each call site (.mark, .hero-mark-bg, .mark-lg)
// sets width:100%/height:100% on this img and constrains its own box in CSS
// — Image just needs an accurate `sizes` hint per usage so it doesn't fetch
// a variant sized for the largest (300px hero watermark) everywhere,
// including the 44-62px header mark that loads on every single page.
export function Logo({ className, sizes = '80px', priority = false, src = '/logo.webp' }) {
  const { width, height } = VARIANTS[src];
  return (
    <Image
      src={src}
      alt=""
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      aria-hidden="true"
    />
  );
}
