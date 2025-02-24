import CustomCalendarHeader from "./CustomCalendarHeader";
import CustomCalendarDays from "./CustomCalendarDays";
import CustomCalendarDate from "./CustomCalendarDate";
import { useState, useMemo } from "react";
import "./CustomCalendar.css";
import { addMonths } from "date-fns";

export default function CustomCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = useMemo(() => new Date(), []);

  function handleMonth(month) {
    setCurrentDate(addMonths(currentDate, month));
  }

  function goToToday(){
    setCurrentDate(today);
  }

  return (
    <div className="flex flex-col w-full h-full border-x">
      <CustomCalendarHeader
        currentDate={currentDate}
        handleMonth={handleMonth}
        goToToday={goToToday}
      />
      <CustomCalendarDays />
      <CustomCalendarDate currentDate={currentDate} />
    </div>
  );
}
