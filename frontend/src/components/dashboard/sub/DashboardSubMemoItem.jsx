import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../../common/IconButton";

export default function DashboardSubMemoItem({ memo, checked, onToggle }) {
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50 group">
      <div className="flex justify-center w-1/20 ">
        <IconButton
          icon={checked ? faSquareCheck : faSquare}
          onClick={onToggle}
        />
      </div>
      <div className="break-words w-16/20">{memo.content}</div>
      <div className="grid grid-cols-3 opacity-0 w-3/20 group-hover:opacity-100">
        {/* Link */}
        <div className={memo.isLinked ? "" : "invisible"}>
          <IconButton icon={faLink} />
        </div>
      </div>
    </div>
  );
}
