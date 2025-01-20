export default function Button({ text, onClick, width = "w-96", isDisabled = false }) {
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={`
        h-12 rounded-md mb-3 font-semibold border ${width} text-white
        ${isDisabled 
          ? "bg-[#c3d3ff] cursor-not-allowed" 
          : "bg-[#3557bf] hover:bg-blue-700"
        }
      `}
    >
      {text}
    </button>
  );
}
