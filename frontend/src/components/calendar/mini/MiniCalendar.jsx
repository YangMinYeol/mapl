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
    <div className="absolute z-10 w-full h-48 mt-1 bg-white border rounded top-5">
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
