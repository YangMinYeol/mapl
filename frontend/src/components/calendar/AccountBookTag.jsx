import { TAG_TYPE } from "../../constants/tag";
import { ACCOUNT_TYPE } from "../../util/accountBookUtil";
import Tooltip from "../common/Tooltip";
import { extractDateAndTime, getAccountBookDate } from "../../util/dateUtil";

export default function AccountBookTag({ tag, onClick }) {
  const amountPrefix = tag.type === ACCOUNT_TYPE.EXPENSE ? "-" : "+";
  const isHoliday = tag.type === TAG_TYPE.HOLIDAY;

  const handleClick = (e) => {
    if (editable) {
      e.stopPropagation();
      onClick(tag);
    }
  };

  const editable = !isHoliday;
  const Tag = editable ? "button" : "div";
  const accountTag = (
    <Tag
      type={editable ? "button" : undefined}
      aria-label={editable ? tag.content || tag.categoryName : undefined}
      data-palette-color={tag?.colorId != null || undefined}
      className={`${tag && "hover:cursor-pointer hover:font-bold"} ${
        !isHoliday && "text-right"
      } text-white rounded mx-1 px-1 h-5 truncate`}
      style={tag ? { backgroundColor: tag.colorHex, "--tag-ink": tag.colorHex } : {}}
      onClick={handleClick}
    >
      {isHoliday
        ? tag.content
        : `${amountPrefix}${tag.amount?.toLocaleString()}원`}
    </Tag>
  );

  if (!editable) return accountTag;
  const { date, time } = extractDateAndTime(getAccountBookDate(tag));
  return (
    <Tooltip content={<>
      <strong>{tag.categoryName}{tag.content && ` · ${tag.content}`}</strong>
      <div>일시 · {date}{tag.hasTime === false ? "" : ` ${time}`}</div>
    </>}>{accountTag}</Tooltip>
  );
}
