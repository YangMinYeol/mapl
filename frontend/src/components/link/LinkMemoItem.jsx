import { formatDateYYYYMMDD } from "../../util/dateUtil";

export default function LinkMemoItem({ memo }) {
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50 group">
      <div className="flex items-center"></div>

      <div>
        {`${formatDateYYYYMMDD(memo.startDate)} ~ ${formatDateYYYYMMDD(
          memo.endDate
        )}`}
      </div>
    </div>
  );
}
