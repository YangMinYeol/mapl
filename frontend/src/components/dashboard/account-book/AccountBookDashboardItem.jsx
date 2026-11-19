import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { format } from "date-fns";
import { extractDateAndTime, getAccountBookDate } from "../../../util/dateUtil";
import { formatTimeTo12Hour } from "../../../util/timeUtil";
import IconButton from "../../common/IconButton";

export default function AccountBookDashboardItem({ item, onEdit, onDelete }) {
  const isExpense = item.type === "expense";
  const amountPrefix = isExpense ? "-" : "+";
  const amountColor = isExpense ? "ledger-expense" : "ledger-income";
  const { date, time } = extractDateAndTime(getAccountBookDate(item));

  return (
    <div className="ledger-row planner-edit-row group">
      <div>
        <span className="ledger-category" style={{ backgroundColor: item.colorHex }}>
          {item.categoryName}
        </span>
      </div>
      <div className="ledger-description">
        <button
          type="button"
          className="ledger-memo planner-edit-target"
          onClick={() => onEdit(item)}
          aria-label={`가계부 내역 편집: ${item.content}`}
        >
          {item.content}
        </button>
        <div className="ledger-date">
          <time dateTime={format(date, "yyyy-MM-dd")}>{format(date, "yyyy.MM.dd")}</time>
          {item.hasTime !== false && <span>{formatTimeTo12Hour(time)}</span>}
        </div>
      </div>
      <div className={`ledger-amount ${amountColor}`}>
        {`${amountPrefix} ${item.amount?.toLocaleString()}원`}
      </div>

      <div className="planner-row-actions planner-row-control">
        <IconButton
          icon={faTrashCan}
          title="삭제"
          onClick={() => onDelete(item)}
        />
      </div>
    </div>
  );
}
