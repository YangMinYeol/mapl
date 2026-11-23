import { formatDateYYYYMMDD } from "../../util/dateUtil";
import { getPeriodDisplayName } from "../../util/periodUtil";
import { formatTimeTo12Hour } from "../../util/timeUtil";

export default function LinkMemoItem({ memo, isCurrent, isOriginal }) {
  const { periodName, startDate, endDate, startTime, endTime } = memo;
  const hasDates = startDate && endDate;

  return (
    <div className="planner-link-row">
      <div className="planner-link-labels">
        <span className="planner-link-period">{getPeriodDisplayName(periodName, "memo")}</span>
        {isCurrent && <span className="planner-link-badge">현재 메모</span>}
        {isOriginal && <span className="planner-link-badge">원본</span>}
      </div>
      {hasDates ? (
        <dl className="planner-link-dates">
          <div><dt>시작</dt><dd>{formatDateYYYYMMDD(startDate)} {formatTimeTo12Hour(startTime)}</dd></div>
          <div><dt>종료</dt><dd>{formatDateYYYYMMDD(endDate)} {formatTimeTo12Hour(endTime)}</dd></div>
        </dl>
      ) : (
        <span className="planner-link-empty">날짜 없음</span>
      )}
    </div>
  );
}
