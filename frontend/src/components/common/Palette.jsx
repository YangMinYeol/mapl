import { useColors } from "../../context/ColorContext";

export default function Palette({ selectedColorId, setSelectedColorId, setSelectedColor }) {
  const colors = useColors();
  const hasCocoa = colors.some(({ id }) => id === 11);
  // Retain the legacy color in the API for records that reference it.
  const choices = hasCocoa ? colors.filter(({ id }) => id !== 10 || id === selectedColorId) : colors;

  function selectedColor(id, hex) {
    setSelectedColorId(id);
    setSelectedColor?.(hex);
  }

  return (
    <div className={selectedColorId == null ? "flex flex-wrap gap-1 p-1 border rounded" : "planner-record-colors"} role="group" aria-label="색상">
      {choices.map(({ id, hex }) => {
        return (
          <button type="button"
            key={id}
            aria-label={`색상 ${id}`}
            aria-pressed={selectedColorId == null ? undefined : selectedColorId === id}
            className="w-4 h-4 rounded cursor-pointer border"
            style={{ backgroundColor: hex, borderColor: hex }}
            onClick={() => selectedColor(id, hex)}
          />
        );
      })}
    </div>
  );
}
