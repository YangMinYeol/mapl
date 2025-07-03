import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { format } from "date-fns";
import { extractDateAndTime } from "../../../util/dateUtil";
import { formatTimeTo12Hour } from "../../../util/timeUtil";
import IconButton from "../../common/IconButton";

export default function AccountBookDashboardItem({ item, onEdit, onDelete }) {
  const isExpense = item.type === "expense";
  const amountPrefix = isExpense ? "-" : "+";
  const amountColor = isExpense ? "text-red-500" : "text-blue-500";
  const { date, time } = extractDateAndTime(item.occurredAt);

  return (
    <div className="flex items-center py-2 min-h-15 hover:bg-gray-50 group ">
      <div className="flex items-center justify-center text-white w-[125px] shrink-0">
        <div
          className="text-center border min-w-22 rounded-xl "
          style={{
            backgroundColor: item.colorHex,
            borderColor: item.colorHex,
          }}
        >
          {item.categoryName}
        </div>
      </div>
      <div className="space-y-1 w-8/20">
        <div className="break-words">{item.content}</div>
        <div className="text-xs text-gray-500">
          {format(date, "yyyy년 M월 d일")} {formatTimeTo12Hour(time)}
        </div>
      </div>
      <div className={`text-right w-5/20 ${amountColor}`}>
        {`${amountPrefix} ${item.amount?.toLocaleString()}원`}
      </div>

      <div className="flex justify-center ml-auto opacity-0 w-2/20 group-hover:opacity-100">
        <IconButton
          icon={faPenToSquare}
          title="수정"
          onClick={() => onEdit(item)}
        />
        <IconButton
          icon={faTrashCan}
          title="삭제"
          onClick={() => onDelete(item)}
        />
      </div>
    </div>
  );
}
