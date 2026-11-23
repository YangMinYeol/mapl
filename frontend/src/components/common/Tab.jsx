export default function Tab({ options, selected, onSelect, size = "sm" }) {
  const sizeClass = size === "lg" ? "text-base px-2" : "px-1";
  return (
    <div className="mapl-tabs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={selected === option.value}
          onClick={() => onSelect(option.value)}
          className={`mapl-tab ${sizeClass}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
