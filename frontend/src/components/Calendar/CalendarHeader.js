import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { useRef, useState, useEffect } from "react";
import DropdownCalendar from "./DropdownCalendar";

export default function CalendarHeader({
  currentDate,
  handleChangeMonth,
  handleYearMonth,
  goToToday,
}) {
  const TABS = { MEMO: "Memo", TODO: "Todo", WALLET: "Wallet" };
  const tabs = Object.values(TABS);
  const [activeTab, setActiveTab] = useState(TABS.MEMO);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownButtonRef = useRef(null);
  const yearMonth = format(currentDate, "yyyy년 MM월");

  // 드롭다운 달력 위치 선정
  useEffect(() => {
    const rect = dropdownButtonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: 30,
      left: rect.left,
    });
  }, []);

  // Memo, Todo, Wallet 탭 변경
  function handleTab(tabId) {
    setActiveTab(tabId);
  }

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
    <div className="relative flex items-center justify-between h-10 py-2 border-y-2">
      
      {/* Left */}
      <div className="calendar-header-left">
        <div className="flex pl-1 space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-1 border rounded-md ${
                activeTab === tab ? "bg-deep-green text-white" : "bg-white"
              } hover:bg-deep-green hover:text-white`}
              onClick={() => handleTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center justify-center w-40 calendar-header-center">
        <button
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-mapl-slate"
          onClick={() => handleChangeMonth(-1)}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
        <button
          className="inline-block px-3 font-semibold rounded dropdown-btn hover:bg-mapl-slate w-28"
          onClick={toggleCalendarDropdown}
          ref={dropdownButtonRef}
        >
          {yearMonth}
        </button>
        <button
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-mapl-slate"
          onClick={() => handleChangeMonth(+1)}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </button>

        {/* 드롭다운 */}
        <DropdownCalendar
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          currentDate={currentDate}
          onSelectYearMonth={handleYearMonth}
          handleTodayClick={handleDropdownTodayClick}
          dropdownPosition={dropdownPosition}
          dropdownButtonRef={dropdownButtonRef}
        />
      </div>

      {/* Right */}
      <div className="pr-2">
        <button className="group" onClick={goToToday}>
          <FontAwesomeIcon
            icon={faCalendar}
            className="group-hover:text-green-900"
          />
        </button>
      </div>
    </div>
  );
}
