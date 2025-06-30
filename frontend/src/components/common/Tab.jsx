export default function Tab({ options, selected, onSelect }) {
  return (
    <div className="space-x-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={`px-1 border border-mapl-slate cursor-pointer rounded-md
            ${
              selected === option.value
                ? "bg-deep-green text-white"
                : "bg-white"
            }
            hover:bg-deep-green hover:text-white`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
