import { isSameDay } from "date-fns";
import { TAG_TYPE } from "../../constants/tag";
import Tooltip from "../common/Tooltip";

function getMemoTagClass(tag, date) {
  if (!tag) return "";

  if (tag.type === TAG_TYPE.MORE) {
    return "mx-1 text-gray-500 rounded";
  }

  if (tag.type === TAG_TYPE.HOLIDAY) {
    return "mx-1 text-white rounded";
  }

  const isStart = tag.startDate && isSameDay(date, new Date(tag.startDate));
  const isEnd = tag.endDate && isSameDay(date, new Date(tag.endDate));

  return [
    "text-white",
    isStart ? "rounded-l ml-1" : "",
    isEnd ? "rounded-r mr-1" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function MemoTag({ tag, date, onClick }) {
  const shouldShow =
    tag?.content &&
    (tag.type === TAG_TYPE.MORE ||
      tag.type === TAG_TYPE.HOLIDAY ||
      isSameDay(date, new Date(tag.startDate)) ||
      date.getDay() === 0);

  const handleClick = (e) => {
    if (tag) {
      e.stopPropagation();
      onClick(tag);
    }
  };

  const memoTag = (
    <div
      key={tag?.id}
      className={`px-1 h-5 truncate ${getMemoTagClass(tag, date)} ${
        tag && "hover:cursor-pointer hover:font-bold"
      }`}
      style={tag ? { backgroundColor: tag.colorHex } : {}}
      onClick={handleClick}
    >
      {shouldShow ? tag.content : null}
    </div>
  );

  return tag && (tag.type === TAG_TYPE.DAILY || tag.type === TAG_TYPE.RANGE) ? (
    <Tooltip memo={tag}>{memoTag}</Tooltip>
  ) : (
    memoTag
  );
}
