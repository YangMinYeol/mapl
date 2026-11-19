import {
  faClock,
  faSquare,
  faSquareCheck,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../../../common/IconButton";

export default function MainMemoItem({
  memo,
  onComplete,
  onPostpone,
  onDelete,
  onEdit,
  openLinkModal,
  selectedPeriod,
}) {
  return (
    <div className="planner-edit-row flex items-center px-1 py-1 hover:bg-gray-50 group">
      {/* 체크박스 (완료 여부) */}
      <div className="planner-row-control flex justify-center w-1/20">
        <IconButton
          icon={memo.completed ? faSquareCheck : faSquare}
          onClick={() => onComplete(memo)}
          title={memo.completed ? "완료 취소" : "완료"}
        />
      </div>

      {/* 메모 내용 */}
      <button
        type="button"
        className={`planner-edit-target w-15/20 ${memo.completed && "line-through"} break-words`}
        onClick={() => onEdit(memo)}
        aria-label={`메모 편집: ${memo.content}`}
      >
        {memo.content}
      </button>

      <div className="planner-row-control planner-row-actions ml-auto">
        {/* 링크 아이콘: 연결된 메모일 경우만 표시 */}
        {memo.isLinked && (
          <IconButton
            icon={faLink}
            onClick={() => openLinkModal(memo)}
            title="링크"
          />
        )}
        {/* 미루기 아이콘: 버킷리스트가 아닐 경우만 표시 */}
        {selectedPeriod.name !== "Other" && (
          <IconButton
            icon={faClock}
            onClick={() => onPostpone(memo)}
            title="미루기"
          />
        )}
        {/* 삭제 아이콘 */}
        <IconButton
          icon={faTrashCan}
          onClick={() => onDelete(memo)}
          title="삭제"
        />
      </div>
    </div>
  );
}
