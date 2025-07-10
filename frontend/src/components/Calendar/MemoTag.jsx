import { isSameDay } from "date-fns";
import { TAG_TYPE } from "../../constants/tag";
import Tooltip from "../common/Tooltip";

function getMemoTagClass(memo, date) {
  if (!memo) return "";

  if (memo.type === TAG_TYPE.MORE) {
    return "mx-1 text-gray-500 rounded";
  }

  if (memo.type === TAG_TYPE.HOLIDAY) {
    return "mx-1 text-white rounded";
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
    (memo.type === TAG_TYPE.MORE ||
      memo.type === TAG_TYPE.HOLIDAY ||
      isSameDay(date, new Date(memo.startDate)) ||
      date.getDay() === 0);

  const handleClick = (e) => {
    if (memo) {
      e.stopPropagation();
      onClick(memo);
    }
  };

  const memoTag = (
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

  return memo &&
    (memo.type === TAG_TYPE.DAILY || memo.type === TAG_TYPE.RANGE) ? (
    <Tooltip memo={memo}>{memoTag}</Tooltip>
  ) : (
    memoTag
  );
}
