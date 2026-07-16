'use client';

// Shared eyebrow/h1/divider/lead block used at the top of every page. Centralizing
// it means a page can no longer accidentally reuse the same content key for both
// the eyebrow and the title (as accompagnement's methods/pricing sections once did).
export function PageHeader({ eyebrow, title, lead, center = true }) {
  return (
    <div className={center ? 'wrap center' : 'wrap'}>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="big">{title}</h1>
      <div className="divider" />
      {lead ? <p className="lead">{lead}</p> : null}
    </div>
  );
}
