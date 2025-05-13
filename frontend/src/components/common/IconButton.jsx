import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function IconButton({ icon, onClick, title }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-[18px] rounded cursor-pointer hover:bg-mapl-slate h-[18px]"
      title={title}
    >
      <FontAwesomeIcon icon={icon} className="w-[14px] h-[14px]" />
    </button>
  );
}
