import { addMonths, setMonth, setYear } from "date-fns";
import { useMemo } from "react";
import { TABS } from "../../constants/tab";
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
  const today = useMemo(() => new Date(), []);

  // 한달씩 이동
  function handleChangeMonth(month) {
    setCurrentDate((prevDate) => addMonths(prevDate, month));
  }

  // 연도와 월을 선택한 숫자로 한번에 이동
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
