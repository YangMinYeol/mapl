export function PrimaryButton({
  text,
  onClick,
  width = "w-96",
  isOutline = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mapl-button h-12 mb-2 ${width}${isOutline ? " mapl-button-outline" : ""}`}
    >
      {text}
    </button>
  );
}
