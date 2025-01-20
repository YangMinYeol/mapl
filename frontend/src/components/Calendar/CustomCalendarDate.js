import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  endOfWeek,
  isWeekend,
  isToday,
} from "date-fns";

export default function CustomCalendarDate({ currentDate }) {
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

  return (
    <div className="grid flex-1 grid-rows-6">
      {weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7">
          {week.map((date, dateIndex) => (
            <div
              key={dateIndex}
              className={`date-cell flex flex-col p-[2px] border ${
                isSameMonth(date, currentDate) ? "text-black" : "text-slate-400"
              } ${isWeekend(date) && "bg-slate-50"}
                hover:bg-slate-100`}
            >
              <div
                className={`flex items-center justify-center rounded-full w-[24px] h-[24px] date-label hover:cursor-default ${
                  isToday(date) && "text-white bg-blue-600"
                }`}
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
