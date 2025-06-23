import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { faCalendarCheck } from "@fortawesome/free-regular-svg-icons";
import { useRef, useState } from "react";
import DropdownCalendar from "./DropdownCalendar";
import { createMonthNavigationButton } from "../../util/calendarUtil";
import { TABS } from "../../constants/tab";

export default function CalendarHeader({
  currentDate,
  handleChangeMonth,
  handleYearMonth,
  goToToday,
  setActiveTab,
  activeTab,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownButtonRef = useRef(null);
  const yearMonth = format(currentDate, "yyyy년 MM월");

  // 드롭다운 달력 열기/닫기
  function toggleCalendarDropdown() {
    setIsDropdownOpen((prev) => !prev);
  }

  // Dropdwon Today 클릭
  function handleDropdownTodayClick() {
    goToToday();
    setIsDropdownOpen(false);
  }

  return (
    <div className="relative flex items-center justify-between py-2 border-y-1 border-mapl-slate h-[40px]">
      {/* Left */}
      <div className="calendar-header-left">
        <div className="flex pl-1 space-x-1">
          {Object.values(TABS).map((tab) => (
            <button
              key={tab}
              className={`px-1 border border-mapl-slate cursor-pointer rounded-md ${
                activeTab === tab ? "bg-deep-green text-white" : "bg-white"
              } hover:bg-deep-green hover:text-white`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-center w-40 calendar-header-center">
        {createMonthNavigationButton("prev", handleChangeMonth)}
        <button
          className="inline-block px-3 font-medium rounded cursor-pointer dropdown-btn hover:bg-mapl-slate w-28"
          onClick={toggleCalendarDropdown}
          ref={dropdownButtonRef}
        >
          {yearMonth}
        </button>
        {createMonthNavigationButton("next", handleChangeMonth)}

        {/* 드롭다운 */}
        <DropdownCalendar
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          currentDate={currentDate}
          onSelectYearMonth={handleYearMonth}
          handleTodayClick={handleDropdownTodayClick}
          dropdownButtonRef={dropdownButtonRef}
        />
      </div>

      {/* Right */}
      <div className="pr-2">
        <button className="cursor-pointer group" onClick={goToToday}>
          <FontAwesomeIcon
            icon={faCalendarCheck}
            className="group-hover:text-green-900"
          />
        </button>
      </div>
    </div>
  );
}
