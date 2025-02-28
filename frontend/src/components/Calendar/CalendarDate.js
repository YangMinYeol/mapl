import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  endOfWeek,
  isToday,
  getDay,
} from "date-fns";

export default function CalendarDate({ currentDate }) {
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

  const getDateTextColor = (date) => {
    const day = getDay(date);
    if (day === 0) {
      if (!isSameMonth(date, currentDate)) {
        return "text-red-200";
      }
      return "text-red-500";
    }
    if (day === 6) {
      if (!isSameMonth(date, currentDate)) {
        return "text-blue-200";
      }
      return "text-blue-500";
    }
    return isSameMonth(date, currentDate) ? "text-black" : "text-slate-400";
  };

  return (
    <div
      className={`grid flex-1 grid-rows-${weeks.length} gap-[1px] bg-gray-200`}
    >
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-[1px]">
          {week.map((date, dateIndex) => (
            <div
              key={dateIndex}
              className={`date-cell flex flex-col p-[2px] bg-white hover:bg-slate-50`}
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
