import {
  faPenToSquare,
  faTrashCan,
  faSquare,
  faSquareCheck,
} from "@fortawesome/free-regular-svg-icons";
import IconButton from "../../common/IconButton";

export default function DashboardMainMemoItem({ memo, onComplete, onDelete }) {
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50 group">
      <div className="flex justify-center w-1/20 ">
        {/* Complete */}
        <IconButton
          icon={memo.completed ? faSquareCheck : faSquare}
          onClick={() => onComplete(memo.id)}
        />
      </div>
      <div className={`w-17/20 ${memo.completed && "line-through"}`}>
        {memo.content}
      </div>
      <div className="grid grid-cols-2 opacity-0 w-2/20 group-hover:opacity-100">
        {/* Edit */}
        <IconButton icon={faPenToSquare} />
        {/* Delete */}
        <IconButton icon={faTrashCan} onClick={() => onDelete(memo.id)} />
      </div>
    </div>
  );
}
