export default function Button({
  text,
  onClick,
  width = "w-96",
  isOutline = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        h-12 mb-2 font-semibold border ${width}  ${
        isOutline
          ? "border-deep-green text-deep-green bg-white"
          : "text-white bg-deep-green border"
      }`}
    >
      {text}
    </button>
  );
}
