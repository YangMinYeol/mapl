import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCalendar } from "@fortawesome/free-regular-svg-icons";
import { useEffect, useRef } from "react";
import { format } from "date-fns";

import MiniCalendar from "../calendar/mini/MiniCalendar";

export default function DateTimeInput({
  showDateSelect,
  setShowDateSelect,
  date,
  setDate,
  showTimeSelect,
  setShowTimeSelect,
  time,
  setTime,
  allDay,
}) {
  const selectedTimeRef = useRef(null);

  // 날짜 아이콘 클릭
  function toggleDatePicker() {
    setShowDateSelect(!showDateSelect);
  }

  // 시간 아이콘 클릭
  function toggleTimePicker() {
    setShowTimeSelect(!showTimeSelect);
  }

  // 30분 단위 시간 목록 생성
  function getTimeOptions() {
    return Array.from({ length: 48 }, (_, i) => {
      const hour = String(Math.floor(i / 2)).padStart(2, "0");
      const minute = i % 2 === 0 ? "00" : "30";
      return `${hour}:${minute}`;
    });
  }
  const timeOptions = getTimeOptions();

  // 시간 선택 시 해당 시간으로 바로 스크롤 이동
  useEffect(() => {
    if (showTimeSelect && selectedTimeRef.current) {
      selectedTimeRef.current.scrollIntoView({
        block: "center",
        behavior: "auto",
      });
    }
  }, [showTimeSelect, time]);

  return (
    <div className="relative">
      {/* 날짜 + 시간 표시 input */}
      <input
        readOnly
        className="w-full px-1 pr-10 border rounded outline-none border-mapl-black"
        value={`${format(date, "yyyy년 MM월 dd일")}${allDay ? "" : ` ${time}`}`}
      />

      {/* Date Icon */}
      <IconWrapper
        icon={faCalendar}
        position={`${allDay ? "right-1" : "right-6"}`}
        onClick={toggleDatePicker}
      />
      {showDateSelect && <MiniCalendar date={date} setDate={setDate} />}

      {/* Time Icon */}
      {!allDay && (
        <IconWrapper
          icon={faClock}
          position="right-1"
          onClick={toggleTimePicker}
        />
      )}
      {showTimeSelect && (
        <ul className="absolute right-0 z-10 w-20 mt-1 overflow-auto bg-white border rounded max-h-44 time-selector border-mapl-black top-5">
          {timeOptions.map((timeOption, index) => (
            <li
              key={index}
              ref={timeOption === time ? selectedTimeRef : null}
              className={`pl-1 pr-2 py-0.5 cursor-pointer tabular-nums hover:bg-mapl-slate
                ${timeOption === time ? "bg-deep-green text-white" : ""}
              `}
              onClick={() => setTime(timeOption)}
            >
              {timeOption}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IconWrapper({ icon, position, onClick }) {
  return (
    <button
      className={`absolute flex items-center justify-center w-5 h-5 rounded cursor-pointer transform -translate-y-1/2 top-1/2 hover:bg-mapl-slate ${position}`}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={icon} />
    </button>
  );
}
