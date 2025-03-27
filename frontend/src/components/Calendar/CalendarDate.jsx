import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  endOfWeek,
  isToday,
  getDay,
} from "date-fns";

export default function CalendarDate({
  currentDate,
  selectedDate,
  setSelectedDate,
}) {
  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(startMonth);
  const endDate = endOfWeek(endMonth);
  const dates = [];

  let day = startDate;
  while (day <= endDate) {
    dates.push(day);
    day = addDays(day, 1);
  }

  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  // 날짜 텍스트 색상
  const getDateTextColor = (date) => {
    const day = getDay(date);
    // Sun
    if (day === 0) {
      return !isSameMonth(date, currentDate) ? "text-red-200" : "text-red-500";
    }
    // Sat
    if (day === 6) {
      return !isSameMonth(date, currentDate)
        ? "text-blue-200"
        : "text-blue-500";
    }
    return isSameMonth(date, currentDate) ? "text-black" : "text-slate-400";
  };

  return (
    <div
      className={`grid flex-1 grid-rows-${weeks.length} gap-[1px] bg-gray-200 h-[820px]`}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-[1px]">
          {week.map((date, dateIndex) => (
            <div
              key={dateIndex}
              className={`date-cell flex flex-col p-[2px]  ${
                isSameDay(date, selectedDate)
                  ? "bg-gray-100"
                  : "hover:bg-gray-50 bg-white"
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <div
                className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${getDateTextColor(
                  date
                )} ${isToday(date) && "text-white bg-deep-green"}`}
              >
                {format(date, "d")}
              </div>
              <div className="todo-list"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
