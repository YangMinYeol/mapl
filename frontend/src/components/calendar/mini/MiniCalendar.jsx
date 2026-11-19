import { useState } from "react";
import { addMonths } from "date-fns";
import MiniCalendarHeader from "./MiniCalendarHeader";
import MiniCalendarDays from "./MiniCalendarDays";
import MiniCalendarDate from "./MiniCalendarDate";

export default function MiniCalendar({ date, setDate }) {
  const [calendarDate, setCalendarDate] = useState(date);

  function handleChangeMonth(amount) {
    setCalendarDate((prevDate) => addMonths(prevDate, amount));
  }

  return (
    <div className="planner-mini-calendar">
      <MiniCalendarHeader
        calendarDate={calendarDate}
        handleChangeMonth={handleChangeMonth}
      />
      <MiniCalendarDays />
      <MiniCalendarDate
        calendarDate={calendarDate}
        date={date}
        setDate={setDate}
      />
    </div>
  );
}
