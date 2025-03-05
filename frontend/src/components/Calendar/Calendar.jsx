import CalendarHeader from "./CalendarHeader";
import CalendarDays from "./CalendarDays";
import CalendarDate from "./CalendarDate";
import { useState, useMemo } from "react";
// import "./Calendar.css";
import { addMonths, setMonth, setYear } from "date-fns";

export default function Calendar({ selectedDate, setSelectedDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = useMemo(() => new Date(), []);

  // 한달씩 이동
  function handleChangeMonth(month) {
    setCurrentDate((prevDate) => addMonths(prevDate, month));
  }

  // 연,월을 선택한 숫자로 한번에 이동
  function handleYearMonth(selectedYear, selectedMonth) {
    setCurrentDate((prevDate) => {
      let newDate = setYear(prevDate, selectedYear);
      newDate = setMonth(newDate, selectedMonth - 1);
      return newDate;
    });
  }

  // Today로 이동
  function goToToday() {
    setCurrentDate(today);
    setSelectedDate(today);
  }

  return (
    <div className="flex flex-col w-full h-full border-x">
      <CalendarHeader
        currentDate={currentDate}
        handleChangeMonth={handleChangeMonth}
        handleYearMonth={handleYearMonth}
        goToToday={goToToday}
      />
      <CalendarDays />
      <CalendarDate
        currentDate={currentDate}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    </div>
  );
}
