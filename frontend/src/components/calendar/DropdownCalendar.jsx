import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";

export default function DropdownCalendar({
  onClose,
  currentDate,
  onSelectYearMonth,
  handleTodayClick,
  dropdownButtonRef,
}) {
  const dropdownRef = useRef(null);
  const [dropdownYear, setDropdownYear] = useState(currentDate.getFullYear());
  const calendarYear = currentDate.getFullYear();
  const calendarMonth = currentDate.getMonth() + 1;
  const today = new Date();

  useEffect(() => {
    dropdownRef.current?.querySelector("[aria-pressed=true]")?.focus();
  }, []);

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

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose();
        dropdownButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [onClose, dropdownButtonRef]);

  // 연도 변경
  function handleChangeYear(amount) {
    setDropdownYear((prevYear) => prevYear + amount);
  }

  return (
    <div
      ref={dropdownRef}
      id="planner-month-picker"
      role="dialog"
      aria-label="연월 선택"
      className="planner-month-picker"
    >
      <div className="planner-month-heading">
          <button aria-label="이전 해" onClick={() => handleChangeYear(-1)}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
        <strong aria-live="polite">{dropdownYear}년</strong>
          <button aria-label="다음 해" onClick={() => handleChangeYear(1)}>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
      </div>
      <div className="planner-month-grid">
        {Array.from({ length: 12 }, (_, index) => {
          const month = index + 1;
          const isCurrent = dropdownYear === today.getFullYear() && month === today.getMonth() + 1;
          return (
            <button
              key={month}
              aria-pressed={dropdownYear === calendarYear && month === calendarMonth}
              aria-current={isCurrent ? "date" : undefined}
              onClick={() => {
                onSelectYearMonth(dropdownYear, month);
                onClose();
                dropdownButtonRef.current?.focus();
              }}
            >
              {month}월
            </button>
          );
        })}
      </div>
      <div className="planner-month-footer">
        <button onClick={() => {
          handleTodayClick();
          dropdownButtonRef.current?.focus();
        }}>
          <time>{today.getMonth() + 1}월 {today.getDate()}일</time>
          <span>오늘로 이동 <FontAwesomeIcon icon={faAngleRight} /></span>
        </button>
      </div>
    </div>
  );
}
