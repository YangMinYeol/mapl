import {
  faPenToSquare,
  faTrashCan,
  faSquare,
  faSquareCheck,
} from "@fortawesome/free-regular-svg-icons";
import { faLink, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import IconButton from "../../common/IconButton";

export default function DashboardMainMemoItem({
  memo,
  onComplete,
  onPostpone,
  onDelete,
  onEdit,
  selectedPeriod,
}) {
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50 group">
      {/* 체크박스 (완료 여부) */}
      <div className="flex justify-center w-1/20">
        <IconButton
          icon={memo.completed ? faSquareCheck : faSquare}
          onClick={() => onComplete(memo)}
        />
      </div>

      {/* 메모 내용 */}
      <div
        className={`w-15/20 ${memo.completed && "line-through"} break-words`}
      >
        {memo.content}
      </div>

      <div className="flex gap-2 ml-auto opacity-0 group-hover:opacity-100">
        {/* 링크 아이콘: 연결된 메모일 경우만 표시 */}
        {memo.isLinked && <IconButton icon={faLink} title="링크"/>}
        {/* 미루기 아이콘: 버킷리스트가 아닐 경우만 표시 */}
        {selectedPeriod.name !== "Bucket List" && (
          <IconButton icon={faArrowRight} onClick={() => onPostpone(memo)} title="미루기"/>
        )}
        {/* 수정 아이콘 */}
        <IconButton icon={faPenToSquare} onClick={() => onEdit(memo)} title="수정"/>
        {/* 삭제 아이콘 */}
        <IconButton icon={faTrashCan} onClick={() => onDelete(memo)} title="삭제"/>
      </div>
    </div>
  );
}
