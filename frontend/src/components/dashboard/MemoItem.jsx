import {
  faPenToSquare,
  faTrashCan,
  faSquare,
  faSquareCheck,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function IconButton({ icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-[18px] rounded cursor-pointer hover:bg-mapl-slate h-[18px]"
    >
      <FontAwesomeIcon icon={icon} className="w-[14px] h-[14px]" />
    </button>
  );
}

export default function MemoItem({ memo, onComplete, onDelete }) {
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50 group">
      <div className="flex justify-center w-1/20 ">
        {/* Complete */}
        <IconButton
          icon={memo.completed ? faSquareCheck : faSquare}
          onClick={() => onComplete(memo.id)}
        />
      </div>
      <div className="w-17/20">{memo.content}</div>
      <div className="grid grid-cols-2 opacity-0 w-2/20 group-hover:opacity-100">
        {/* Edit */}
        <IconButton icon={faPenToSquare} />
        {/* Delete */}
        <IconButton icon={faTrashCan} onClick={() => onDelete(memo.id)} />
      </div>
    </div>
  );
}
