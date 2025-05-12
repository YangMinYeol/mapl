import {
  faPenToSquare,
  faTrashCan,
  faSquare,
  faSquareCheck,
} from "@fortawesome/free-regular-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../../common/IconButton";

export default function DashboardMainMemoItem({
  memo,
  onComplete,
  onDelete,
  onEdit,
}) {
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50 group">
      <div className="flex justify-center w-1/20 ">
        {/* Complete */}
        <IconButton
          icon={memo.completed ? faSquareCheck : faSquare}
          onClick={() => onComplete(memo)}
        />
      </div>
      <div
        className={`w-16/20 ${
          memo.completed && "line-through"
        } break-words`}
      >
        {memo.content}
      </div>
      <div className="grid grid-cols-3 opacity-0 w-3/20 group-hover:opacity-100">
        {/* Link */}
        <div className={memo.isLinked ? "" : "invisible"}>
          <IconButton icon={faLink} />
        </div>
        {/* Edit */}
        <IconButton icon={faPenToSquare} onClick={() => onEdit(memo)} />
        {/* Delete */}
        <IconButton icon={faTrashCan} onClick={() => onDelete(memo)} />
      </div>
    </div>
  );
}
