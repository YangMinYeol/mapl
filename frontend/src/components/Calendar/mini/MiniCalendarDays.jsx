import { days, getDayTextColor } from "../../../util/calendarUtil";

export default function MiniCalendarDays() {
  return (
    <div className="grid grid-cols-7 gap-[1px] text-center h-5">
      {days.map((day, index) => (
        <div key={index} className={getDayTextColor(index)}>
          <span className="cursor-default select-none">{day}</span>
        </div>
      ))}
    </div>
  );
}
