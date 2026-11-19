import { formatDateYYYYMMDD } from "../../util/dateUtil";
import { formatTimeTo12Hour } from "../../util/timeUtil";
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
    if (editable) {
      e.stopPropagation();
      onClick(tag);
    }
  };

  const editable = tag.type === TAG_TYPE.DAILY || tag.type === TAG_TYPE.RANGE;
  const Tag = editable ? "button" : "div";
  const memoTag = (
    <Tag
      type={editable ? "button" : undefined}
      aria-label={editable ? tag.content : undefined}
      data-palette-color={tag?.colorId != null || undefined}
      className={`block w-auto max-w-full text-left px-1 h-5 truncate ${getMemoTagClass(tag, date)} ${
        tag && "hover:cursor-pointer hover:font-bold"
      }`}
      style={tag ? { backgroundColor: tag.colorHex, "--tag-ink": tag.colorHex } : {}}
      onClick={handleClick}
    >
      {shouldShow ? tag.content : null}
    </Tag>
  );

  if (!editable) return memoTag;
  return (
    <Tooltip content={<>
      <strong>{tag.content}</strong>
      <div>시작 · {formatDateYYYYMMDD(tag.startDate)} {formatTimeTo12Hour(tag.startTime)}</div>
      <div>종료 · {formatDateYYYYMMDD(tag.endDate)} {formatTimeTo12Hour(tag.endTime)}</div>
    </>}>{memoTag}</Tooltip>
  );
}
