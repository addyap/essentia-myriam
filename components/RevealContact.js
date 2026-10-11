const decode = (s) => {
  try {
    return typeof atob === 'function' ? atob(s) : Buffer.from(s, 'base64').toString('utf8');
  } catch {
    return '';
  }
};

// Public contact destinations work in server HTML, including without JavaScript.
export function RevealContact({ enc, kind, className, children, waText, ...rest }) {
  const value = decode(enc);

  let href;
  if (kind === 'email') href = `mailto:${value}`;
  else if (kind === 'tel') href = `tel:${value.replace(/\(0\)/g, '').replace(/[^+\d]/g, '')}`;
  else if (kind === 'wa') {
    href = `https://wa.me/${value.replace(/[^\d]/g, '')}`;
    if (waText) href += `?text=${encodeURIComponent(waText)}`;
  } else href = value;

  const external = kind === 'wa';
  return (
    <a
      className={className}
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children ?? value}
    </a>
  );
}
