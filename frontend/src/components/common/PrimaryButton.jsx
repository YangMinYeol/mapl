export function PrimaryButton({
  text,
  onClick,
  width = "w-96",
  isOutline = false,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`mapl-button h-12 mb-2 ${width}${isOutline ? " mapl-button-outline" : ""}`}
    >
      {text}
    </button>
  );
}
