export default function ColorButton({ text, onClick, color = "default" }) {
  const base =
    "h-14 mx-3 text-base font-semibold rounded w-36 hover:cursor-pointer";
  const colorClass =
    color === "green"
      ? "text-white bg-deep-green"
      : color === "red"
      ? "text-white bg-red-500"
      : "text-[#666] border border-mapl-slate";

  return (
    <button className={`${base} ${colorClass}`} onClick={onClick} type="button">
      {text}
    </button>
  );
}
