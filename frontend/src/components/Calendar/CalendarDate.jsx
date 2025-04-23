import { format, isSameDay, isToday } from "date-fns";
import { getDateTextColor, getWeekDates } from "../../util/calendarUtil";

export default function CalendarDate({
  currentDate,
  selectedDate,
  setSelectedDate,
  calendarMemos,
}) {
  const weeks = getWeekDates(currentDate);

  // weeks.length에 따라 tagMaxCount 설정
  let tagMaxCount = 5;

  if (weeks.length === 4) {
    tagMaxCount = 8;
  } else if (weeks.length === 5) {
    tagMaxCount = 6;
  } else if (weeks.length === 6) {
    tagMaxCount = 5;
  }

  return (
    <div
      className={`grid flex-1 grid-rows-${weeks.length} gap-[1px] bg-gray-200 h-[820px]`}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-[1px] ">
          {week.map((date, dateIndex) => (
            <div
              key={dateIndex}
              className={`date-cell flex flex-col p-[1px] h-full ${
                isSameDay(date, selectedDate)
                  ? "bg-gray-100"
                  : "hover:bg-gray-50 bg-white"
              }`}
              onClick={() => setSelectedDate(date)}
            >
              {/* 날짜 */}
              <div
                className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${getDateTextColor(
                  date,
                  currentDate
                )} ${isToday(date) && "text-white bg-deep-green"}`}
              >
                {format(date, "d")}
              </div>

              {/* 메모 태그 */}
              <div className="flex flex-col gap-[2px] px-1 overflow-hidden">
                {[
                  ...calendarMemos
                    .filter(
                      (memo) =>
                        isSameDay(new Date(memo.startDate), date) &&
                        memo.periodId === 1
                    )
                    .slice(0, tagMaxCount),
                  ...Array.from({ length: tagMaxCount }).fill(null),
                ]
                  .slice(0, tagMaxCount)
                  .map((memo, i) => (
                    <div
                      key={memo?.id ?? `placeholder-${i}`}
                      className="rounded px-1 h-[20px] text-white"
                      style={memo ? { backgroundColor: memo.colorHex } : {}}
                    >
                      {memo?.content ?? ""}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
