import { formatDateYYYYMMDD } from "../../util/dateUtil";
import { formatTimeTo12Hour } from "../../util/timeUtil";

export default function LinkMemoItem({ memo }) {
  const { periodName, startDate, endDate, startTime, endTime } = memo;

  const formattedStartDate = formatDateYYYYMMDD(startDate);
  const formattedEndDate = formatDateYYYYMMDD(endDate);

  const isBucketList = periodName === "Bucket List";

  return (
    <div className="flex items-center py-1.5 my-1 border rounded hover:bg-gray-50 group border-mapl-slate">
      <div className="flex w-full">
        {isBucketList ? (
          <div className="flex items-center justify-center w-full font-semibold text-center">
            {periodName}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-1/5 font-semibold">
              {periodName}
            </div>
            <div className="flex flex-col w-4/5 text-sm">
              <div className="flex">
                <div className="w-2/12">From</div>
                <div className="w-5/12">: {formattedStartDate}</div>
                <div className="w-5/12">{formatTimeTo12Hour(startTime)}</div>
              </div>
              <div className="flex">
                <div className="w-2/12">To</div>
                <div className="w-5/12">: {formattedEndDate}</div>
                <div className="w-5/12">{formatTimeTo12Hour(endTime)}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
