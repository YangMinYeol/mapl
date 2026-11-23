export default function SecondaryPanel({ label, children, className = "" }) {
  return (
    <section className={`planner-panel secondary-panel ${className}`} aria-label={label}>
      <div className="secondary-body">{children}</div>
    </section>
  );
}
