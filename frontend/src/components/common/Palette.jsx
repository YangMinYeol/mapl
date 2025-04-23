import { useColors } from "../../context/ColorContext";

export default function Palette({ setSelectedColorId, setSelectedColor }) {
  const colors = useColors();

  function selectedColor(id, hex) {
    setSelectedColorId(id);
    setSelectedColor(hex);
  }

  return (
    <div className="grid grid-cols-10 grid-rows-1 gap-1 p-1 border rounded place-items-center h-7 w-60">
      {colors.map(({ id, hex }) => {
        return (
          <div
            key={id}
            className="w-4 h-4 rounded cursor-pointer border-1 hover:w-5 hover:h-5"
            style={{ backgroundColor: hex, borderColor: hex }}
            onClick={() => selectedColor(id, hex)}
          ></div>
        );
      })}
    </div>
  );
}
