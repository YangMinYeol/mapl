import { isSameDay } from "date-fns";
import { MEMO_TYPE } from "../../util/memoUtil";

function getMemoTagClass(memo, date) {
  if (!memo) return "";

  if (memo.type === MEMO_TYPE.MORE) {
    return "mx-0.5 text-gray-500 rounded";
  }

  const isStart = memo.startDate && isSameDay(date, new Date(memo.startDate));
  const isEnd = memo.endDate && isSameDay(date, new Date(memo.endDate));

  return [
    "text-white",
    isStart ? "rounded-l ml-1" : "",
    isEnd ? "rounded-r mr-1" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function MemoTag({ memo, date, onClick }) {
  const shouldShow =
    memo?.content &&
    (memo.type === MEMO_TYPE.MORE ||
      isSameDay(date, new Date(memo.startDate)) ||
      date.getDay() === 0);

  const handleClick = (e) => {
    if (memo) {
      e.stopPropagation(); // 버블링 방지
      onClick(memo);
    }
  };

  return (
    <div
      key={memo?.id}
      className={`px-1 h-5 truncate ${getMemoTagClass(memo, date)} ${
        memo && "hover:cursor-pointer hover:font-bold"
      }`}
      style={memo ? { backgroundColor: memo.colorHex } : {}}
      onClick={handleClick}
    >
      {shouldShow ? memo.content : null}
    </div>
  );
}
