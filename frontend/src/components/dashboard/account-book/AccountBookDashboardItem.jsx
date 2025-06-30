import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import IconButton from "../../common/IconButton";

export default function AccountBookDashboardItem({ item }) {
  const isExpense = item.type === "expense";
  const amountPrefix = isExpense ? "-" : "+";
  const amountColor = isExpense ? "text-red-500" : "text-blue-500";
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50 group">
      <div className="w-3/20">{item.categoryName}</div>
      <div className="w-10/20">{item.content}</div>
      <div className={`text-right w-5/20 font-semibold ${amountColor}`}>
        {`${amountPrefix} ${item.amount?.toLocaleString()}원`}
      </div>

      <div className="flex justify-center ml-auto opacity-0 w-2/20 group-hover:opacity-100">
        <IconButton icon={faPenToSquare} title="수정" />
        <IconButton icon={faTrashCan} title="삭제" />
      </div>
    </div>
  );
}
