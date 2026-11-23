import { addMonths, getDate, getDaysInMonth, setDate, setMonth, setYear, startOfMonth } from "date-fns";
import { useState } from "react";
import { TABS } from "../../constants/tab";
import useHolidayData from "../../hooks/useHolidayData";
import AccountBookCalendarDate from "./AccountBookCalendarDate";
import CalendarDays from "./CalendarDays";
import CalendarHeader from "./CalendarHeader";
import MemoCalendarDate from "./MemoCalendarDate";

export default function Calendar({
  calendarDatas,
  currentDate,
  setCurrentDate,
  selectedDate,
  setSelectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
  periods,
  setSelectedPeriod,
  setActiveTab,
  activeTab,
}) {
  const { holidays } = useHolidayData(currentDate);
  const [tagMaxCount, setTagMaxCount] = useState(1);

  function moveToMonth(month) {
    const day = Math.min(getDate(selectedDate), getDaysInMonth(month));
    setCurrentDate(month);
    setSelectedDate(setDate(month, day));
  }

  function handleChangeMonth(month) {
    moveToMonth(addMonths(startOfMonth(currentDate), month));
  }

  function handleYearMonth(selectedYear, selectedMonth) {
    const year = setYear(startOfMonth(currentDate), selectedYear);
    moveToMonth(setMonth(year, selectedMonth - 1));
  }

  // Today로 이동
  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  return (
    <div className="flex flex-col w-full h-full border-x border-mapl-slate">
      <CalendarHeader
        currentDate={currentDate}
        handleChangeMonth={handleChangeMonth}
        handleYearMonth={handleYearMonth}
        goToToday={goToToday}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />
      <CalendarDays />
      {activeTab === TABS.MEMO ? (
        <MemoCalendarDate
          tagMaxCount={tagMaxCount}
          onTagCapacityChange={setTagMaxCount}
          holidays={holidays}
          currentDate={currentDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          calendarDatas={calendarDatas}
          loadDashboardDatas={loadDashboardDatas}
          loadCalendarDatas={loadCalendarDatas}
          periods={periods}
          setSelectedPeriod={setSelectedPeriod}
        />
      ) : (
        <AccountBookCalendarDate
          tagMaxCount={tagMaxCount}
          onTagCapacityChange={setTagMaxCount}
          holidays={holidays}
          currentDate={currentDate}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          calendarDatas={calendarDatas}
          loadDashboardDatas={loadDashboardDatas}
          loadCalendarDatas={loadCalendarDatas}
          periods={periods}
          setSelectedPeriod={setSelectedPeriod}
        />
      )}
    </div>
  );
}
