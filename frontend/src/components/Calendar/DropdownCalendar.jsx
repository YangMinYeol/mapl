import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

export default function DropdownCalendar({
  isOpen,
  onClose,
  currentDate,
  onSelectYearMonth,
  handleTodayClick,
  dropdownPosition,
  dropdownButtonRef,
}) {
  const dropdownRef = useRef(null);
  const [dropdownYear, setDropdownYear] = useState(currentDate.getFullYear());
  const calendarYear = currentDate.getFullYear();
  const calendarMonth = format(currentDate, "M");

  // 드롭다운이 열릴 때 현재 날짜 기준으로 초기화
  useEffect(() => {
    if (isOpen) {
      setDropdownYear(currentDate.getFullYear());
    }
  }, [isOpen, currentDate]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !dropdownButtonRef.current.contains(e.target)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 연도 변경
  function handleChangeYear(amount) {
    setDropdownYear((prevYear) => prevYear + amount);
  }

  return isOpen ? (
    <div
      ref={dropdownRef}
      className="absolute bg-white border border-gray-300 rounded shadow-md h-44 w-60"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left - 64}px`,
      }}
    >
      {/* Year */}
      <div className="flex justify-between px-2 py-1 font-medium border-b-2 text-deep-green border-mapl-slate">
        <div className="flex items-center justify-between w-24">
          <button
            className="w-5 rounded-lg cursor-pointer hover:bg-gray-200"
            onClick={() => handleChangeYear(-1)}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <span>{dropdownYear}</span>
          <button
            className="w-5 rounded-lg cursor-pointer hover:bg-gray-200"
            onClick={() => handleChangeYear(1)}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </div>
        <button
          className="w-12 text-center rounded-lg cursor-pointer hover:bg-gray-200"
          onClick={handleTodayClick}
        >
          Today
        </button>
      </div>

      {/* Month */}
      <div className="grid grid-cols-4 gap-1 p-1 h-5/6">
        {[...Array(12)].map((_, index) => {
          const dropdownMonth = index + 1;
          return (
            <button
              key={dropdownMonth}
              className={`${
                dropdownYear === calendarYear && dropdownMonth == calendarMonth
                  ? "bg-deep-green text-white"
                  : "hover:bg-gray-200"
              } flex items-center justify-center w-full h-full px-1 py-1 text-center rounded-lg cursor-pointer`}
              onClick={() => {
                onSelectYearMonth(dropdownYear, dropdownMonth);
                onClose();
              }}
            >
              {dropdownMonth}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;
}
