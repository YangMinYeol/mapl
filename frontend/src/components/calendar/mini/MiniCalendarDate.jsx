import { format, isSameDay } from "date-fns";
import { getDateTextColor, getWeekDates } from "../../../util/calendarUtil";

export default function MiniCalendarDate({ calendarDate, date, setDate }) {
  const weeks = getWeekDates(calendarDate);

  return (
    <div className="grid flex-1 auto-rows-fr h-36">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((d, index) => (
            <button
              type="button"
              key={index}
              aria-label={format(d, "yyyy년 M월 d일")}
              aria-pressed={isSameDay(d, date)}
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
              {format(d, "d")}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
