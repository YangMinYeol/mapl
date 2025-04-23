import { days, getDayTextColor } from "../../util/calendarUtil";

export default function CalendarDays() {
  return (
    <div className="grid grid-cols-7 gap-[1px] text-center border-b border-mapl-slate bg-gray-200 h-[40px]">
      {days.map((day, index) => (
        <div key={index} className={`py-2 bg-white ${getDayTextColor(index)}`}>
          <span className="cursor-default select-none">{day}</span>
        </div>
      ))}
    </div>
  );
}
