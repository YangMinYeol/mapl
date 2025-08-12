import { TAG_TYPE } from "../../constants/tag";
import { ACCOUNT_TYPE } from "../../util/accountBookUtil";
import AccountBookToolTip from "./AccountBookTooltip";

export default function AccountBookTag({ tag, onClick }) {
  const amountPrefix = tag.type === ACCOUNT_TYPE.EXPENSE ? "-" : "+";
  const isHoliday = tag.type === TAG_TYPE.HOLIDAY;
  const isMore = tag.type === TAG_TYPE.MORE;

  const handleClick = (e) => {
    if (tag) {
      e.stopPropagation();
      onClick(tag);
    }
  };

  const accountTag = (
    <div
      key={tag?.id}
      className={`${tag && "hover:cursor-pointer hover:font-bold"} ${
        !isHoliday && "text-right"
      } ${
        isMore ? "text-gray-500" : "text-white"
      } rounded mx-1 px-1 h-5 truncate`}
      style={tag ? { backgroundColor: tag.colorHex } : {}}
      onClick={handleClick}
    >
      {isHoliday || isMore
        ? tag.content
        : `${amountPrefix}${tag.amount?.toLocaleString()}원`}
    </div>
  );

  return tag &&
    (tag.type === ACCOUNT_TYPE.INCOME || tag.type === ACCOUNT_TYPE.EXPENSE) ? (
    <AccountBookToolTip tag={tag} amountPrefix={amountPrefix}>
      {" "}
      {accountTag}
    </AccountBookToolTip>
  ) : (
    accountTag
  );
}
