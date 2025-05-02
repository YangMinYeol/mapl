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
    isStart ? "rounded-l ml-0.5" : "",
    isEnd ? "rounded-r mr-0.5" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function MemoTag({ memo, date }) {
  const shouldShow =
    memo?.content &&
    (memo.type === MEMO_TYPE.MORE ||
      isSameDay(date, new Date(memo.startDate)) ||
      date.getDay() === 0);

  return (
    <div
      key={memo?.id}
      className={`px-1 h-[20px] truncate ${getMemoTagClass(memo, date)}`}
      style={memo ? { backgroundColor: memo.colorHex } : {}}
    >
      {shouldShow ? memo.content : null}
    </div>
  );
}
