// Explicit editorial placeholders, never presented as confirmed business facts.
export function PendingDetails({ title, status, note, fields }) {
  return <div className="pending-details">
    <span className="eyebrow">{status}</span>
    <h2>{title}</h2>
    <p className="prose">{note}</p>
    <dl>
      {fields.map(({ label, value }) => <div key={label}>
        <dt>{label}</dt><dd>{value}</dd>
      </div>)}
    </dl>
  </div>;
}
