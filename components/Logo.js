// Gold "elevation figure" mark. Interpretation of Myriam's logo —
// replace with the final SVG/PNG when available (see public/logo.svg).
export function Logo({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 156" aria-hidden="true">
      <circle cx="60" cy="24" r="11" fill="var(--gold)" />
      <path d="M60 40 C50 33 45 19 41 8" fill="none" stroke="var(--gold)" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M60 40 C70 33 75 19 79 8" fill="none" stroke="var(--gold)" strokeWidth="4.4" strokeLinecap="round" />
      <path d="M60 41 C62 66 92 60 88 96 C85 124 44 132 40 150 M40 150 C30 128 66 120 69 92 C71 70 57 66 60 41"
        fill="none" stroke="var(--gold)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
