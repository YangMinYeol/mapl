import CustomCalendarHeader from "./CustomCalendarHeader";
import CustomCalendarDays from "./CustomCalendarDays";
import CustomCalendarDate from "./CustomCalendarDate";
import { useState } from "react";
import "./CustomCalendar.css";
import { addMonths } from "date-fns";

export default function CustomCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  function handleMonth(month) {
    setCurrentDate(addMonths(currentDate, month));
  }

  return (
    <div className="flex flex-col w-full h-full border-x">
      <CustomCalendarHeader
        currentDate={currentDate}
        handleMonth={handleMonth}
      />
      <CustomCalendarDays />
      <CustomCalendarDate currentDate={currentDate} />
    </div>
  );
}
