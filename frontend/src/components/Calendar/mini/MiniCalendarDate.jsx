import { format, isSameDay } from "date-fns";
import { getDateTextColor, getWeekDates } from "../../../util/calendarUtil";

export default function MiniCalendarDate({ calendarDate, date, setDate }) {
  const weeks = getWeekDates(calendarDate);

  return (
    <div className={`grid flex-1 grid-rows-${weeks.length} h-36`}>
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((d, index) => (
            <div
              key={index}
              className={`date-cell rounded flex flex-col items-center justify-center ${getDateTextColor(
                d,
                calendarDate
              )} ${
                isSameDay(d, date)
                  ? "text-white bg-deep-green"
                  : "hover:bg-gray-200 bg-white"
              }`}
              onClick={() => setDate(d)}
            >
              <div className="flex items-center justify-center rounded w-[24px] h-[24px] cursor-pointer">
                {format(d, "d")}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
