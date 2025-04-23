import { format } from "date-fns";
import { createMonthNavigationButton } from "../../../util/calendarUtil";

export default function MiniCalendarHeader({
  calendarDate,
  handleChangeMonth,
}) {
  return (
    <div
      className="flex items-center justify-center h-5"
      onClick={(e) => e.stopPropagation()}
    >
      {createMonthNavigationButton("prev", handleChangeMonth)}
      <span className="mx-1 font-medium">
        {format(calendarDate, "yyyy년 MM월")}
      </span>
      {createMonthNavigationButton("next", handleChangeMonth)}
    </div>
  );
}
