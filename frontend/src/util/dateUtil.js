import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getWeekOfMonth,
  isAfter,
  isBefore,
  isEqual,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";

export function formatDateYYYYMMDD(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return format(date, "yyyy-MM-dd"); // YYYY-MM-DD 형식으로 변환
}

// 선택된 기한에 따라 start, end 를 설정
export function setDateByPeriod(period, selectedDate) {
  let startDate = null;
  let endDate = null;
  if (period.name === "Other") {
    return { startDate, endDate };
  }
  switch (period.name) {
    case "Day":
      startDate = selectedDate;
      endDate = selectedDate;
      break;
    case "Week":
      startDate = startOfWeek(selectedDate, { weekStartsOn: 0 });
      endDate = endOfWeek(selectedDate, { weekStartsOn: 0 });
      break;
    case "Month":
      startDate = startOfMonth(selectedDate);
      endDate = endOfMonth(selectedDate);
      break;
    case "Year":
      startDate = startOfYear(selectedDate);
      endDate = endOfYear(selectedDate);
      break;
  }
  return {
    startDate: formatDateYYYYMMDD(startDate),
    endDate: formatDateYYYYMMDD(endDate),
  };
}

// 미루기 위한 startDate와 endDate를 설정
export function postponeDates(period, startDate) {
  let newStart = new Date(startDate);
  let newEnd = null;

  switch (period.name) {
    case "Day":
      newStart = addDays(newStart, 1);
      newEnd = newStart;
      break;
    case "Week":
      newStart = addWeeks(newStart, 1);
      newEnd = endOfWeek(newStart, { weekStartsOn: 0 });
      break;
    case "Month":
      newStart = addMonths(newStart, 1);
      newEnd = endOfMonth(newStart);
      break;
    case "Year":
      newStart = addYears(newStart, 1);
      newEnd = endOfYear(newStart);
      break;
  }

  return {
    newStartDate: formatDateYYYYMMDD(newStart),
    newEndDate: formatDateYYYYMMDD(newEnd),
  };
}

// 날짜에 지정된 일수를 더하는 함수
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// 날짜에 지정된 주수를 더하는 함수
function addWeeks(date, weeks) {
  return addDays(date, weeks * 7);
}

// 날짜에 지정된 월수를 더하는 함수
function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

// 날짜에 지정된 연수를 더하는 함수
function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

// 두 날짜 사이에 포함되는지 확인
export function isBetween(date, start, end) {
  return (
    (isAfter(date, start) || isEqual(date, start)) &&
    (isBefore(date, end) || isEqual(date, end))
  );
}

// 공휴일 포멧팅
export function formatHolidayDate(locdate) {
  const str = locdate.toString();
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  return `${year}-${month}-${day}`;
}

// 기한에 따른 날짜 포멧팅
export function formatDateByPeriod(date, periodName, isAccountBook) {
  switch (periodName) {
    case "Day":
      return format(date, "yyyy년 MM월 dd일");
    case "Week":
      return format(date, `yyyy년 MM월 ${getWeekOfMonth(date)}주차`);
    case "Month":
      return format(date, "yyyy년 MM월");
    case "Year":
      return format(date, "yyyy년");
    case "Other":
      return isAccountBook ? "전체" : "버킷 리스트";
    default:
      return format(date, "yyyy년 MM월 dd일");
  }
}
