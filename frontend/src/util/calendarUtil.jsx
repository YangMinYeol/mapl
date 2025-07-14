import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  getDay,
  isSameMonth,
  format,
} from "date-fns";

export const days = ["일", "월", "화", "수", "목", "금", "토"];

// 주간 날짜를 계산하는 함수
export function getWeekDates(currentDate) {
  const startMonth = startOfMonth(currentDate);
  const endMonth = endOfMonth(currentDate);
  const startDate = startOfWeek(startMonth);
  const endDate = endOfWeek(endMonth);

  const dates = [];
  let day = startDate;
  while (day <= endDate) {
    dates.push(day);
    day = addDays(day, 1);
  }

  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return weeks;
}

// 날짜 텍스트 색상을 결정하는 함수
export function getDateTextColor(date, currentDate, holidays = []) {
  const day = getDay(date);
  const isOtherMonth = !isSameMonth(date, currentDate);
  const dateStr = format(date, "yyyyMMdd");

  const isHoliday = holidays.some((holiday) => {
    const { locdate, isHoliday } = holiday;
    return locdate?.toString() === dateStr && isHoliday === "Y";
  });

  if (day === 0 || isHoliday) {
    return isOtherMonth ? "text-red-200" : "text-red-500"; // 일요일 또는 공휴일
  }

  if (day === 6) {
    return isOtherMonth ? "text-blue-200" : "text-blue-500"; // 토요일
  }

  return isOtherMonth ? "text-slate-400" : "text-black"; // 평일
}

// 요일별 색상을 결정하는 함수
export function getDayTextColor(index) {
  if (index === 0) return "text-red-500"; // 일요일
  if (index === 6) return "text-blue-500"; // 토요일
  return "text-black"; // 평일
}

export function createMonthNavigationButton(direction, handleChangeMonth) {
  return (
    <button
      className="flex items-center justify-center w-5 h-5 rounded cursor-pointer hover:bg-mapl-slate"
      onClick={() => handleChangeMonth(direction === "next" ? 1 : -1)}
    >
      <FontAwesomeIcon
        icon={direction === "next" ? faAngleRight : faAngleLeft}
      />
    </button>
  );
}

// 날짜를 key로 사용
export function getDateKey(date) {
  return format(date, "yyyy-MM-dd");
}

// 달력에 들어갈 날짜 최대 개수 지정
export function getTagMaxCount(weeks) {
  if (weeks.length === 4) return 8;
  if (weeks.length === 5) return 6;
  return 5;
}

// 날짜 클릭 핸들러
export function handleDateClick(
  date,
  setSelectedDate,
  setSelectedPeriod,
  periods
) {
  setSelectedDate(date);
  setSelectedPeriod(periods[0]);
}
