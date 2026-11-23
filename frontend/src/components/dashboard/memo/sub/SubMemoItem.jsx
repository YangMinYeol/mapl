import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../../../common/IconButton";

export default function SubMemoItem({
  memo,
  checked,
  onToggle,
  openLinkModal,
  onEdit,
}) {
  return (
    <div className="planner-edit-row flex items-center px-1 py-1 hover:bg-gray-50 group">
      <div className="planner-row-control flex justify-center w-1/20">
        <IconButton
          icon={checked ? faSquareCheck : faSquare}
          onClick={onToggle}
          title={checked ? "선택 해제" : "가져올 메모 선택"}
        />
      </div>
      <button type="button" className="planner-edit-target break-words w-16/20" onClick={onEdit} aria-label={`메모 편집: ${memo.content}`}>
        {memo.content}
      </button>
      <div className="planner-row-control grid grid-cols-3 opacity-0 w-3/20 group-hover:opacity-100">
        {/* Link */}
        {memo.isLinked && (
          <IconButton
            icon={faLink}
            onClick={() => openLinkModal(memo)}
            title="링크"
          />
        )}
      </div>
    </div>
  );
}
