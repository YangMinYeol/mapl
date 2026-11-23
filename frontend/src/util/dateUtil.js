import {
  differenceInCalendarWeeks,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  getDay,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { ko } from "date-fns/locale";

const PLANNING_WEEK = { weekStartsOn: 1 };

export function formatDateYYYYMMDD(date) {
  if (!(date instanceof Date)) {
    date = typeof date === "string" ? parseISO(date) : new Date(date);
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
      startDate = startOfWeek(selectedDate, PLANNING_WEEK);
      endDate = endOfWeek(selectedDate, PLANNING_WEEK);
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
      newEnd = endOfWeek(newStart, PLANNING_WEEK);
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
    case "Week": {
      const { startDate, endDate } = setDateByPeriod({ name: "Week" }, date);
      const pattern = startDate.slice(0, 4) === endDate.slice(0, 4) ? "MM.dd(EEE)" : "yyyy.MM.dd(EEE)";
      return `${format(startDate, pattern, { locale: ko })} ~ ${format(endDate, pattern, { locale: ko })}`;
    }
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

/**
 * date: "2025-06-27"
 * time: "12:00"
 * return: Date 객체 (ex: new Date("2025-06-27T12:00:00"))
 */
export function combineDateAndTime(date, time) {
  const formatDate = formatDateYYYYMMDD(date);
  return new Date(`${formatDate}T${time}:00`);
}

// Date 객체에서 date, time 문자열 추출하는 함수
export function extractDateAndTime(dateInput) {
  let dateObj;
  if (dateInput instanceof Date) {
    dateObj = dateInput;
  } else {
    dateObj = new Date(dateInput);
  }

  // 날짜 부분 (YYYY-MM-DD)
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;

  // 시간 부분 (HH:mm)
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const time = `${hours}:${minutes}`;

  return { date, time };
}

// Week: 요일별
export function getAccountBookDate(item) {
  return parseISO(item.occurredDate ?? item.occurredAt);
}

export function groupByWeekday(dataList) {
  const weekdayNames = [
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
    "일요일",
  ];

  const grouped = weekdayNames.reduce((acc, day) => {
    acc[day] = [];
    return acc;
  }, {});

  dataList.forEach((item) => {
    const date = getAccountBookDate(item);
    const day = getDay(date); // 0(일) ~ 6(토)

    const weekdayIndex = (day + 6) % 7; // 월요일 시작 기준 인덱스 맞추기
    const weekdayName = weekdayNames[weekdayIndex];

    grouped[weekdayName].push(item);
  });

  return grouped;
}

// Month: 주차별 (달력 기준)
export function groupByMonthWeek(datas) {
  const grouped = {};

  datas.forEach((item) => {
    const date = getAccountBookDate(item);
    const start = startOfMonth(date);
    const weekDiff = differenceInCalendarWeeks(date, start, PLANNING_WEEK);
    const weekLabel = `${weekDiff + 1}주차`;

    if (!grouped[weekLabel]) grouped[weekLabel] = [];
    grouped[weekLabel].push(item);
  });

  return grouped;
}

// Year: 월별
export function groupByMonth(datas) {
  const grouped = {};

  datas.forEach((item) => {
    const date = getAccountBookDate(item);
    const month = getMonth(date); // 0~11
    const label = `${month + 1}월`;

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return grouped;
}

// Other: 연도별
export function groupByYear(datas) {
  const grouped = {};

  datas.forEach((item) => {
    const date = getAccountBookDate(item);
    const year = getYear(date);
    const label = `${year}년`;

    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(item);
  });

  return grouped;
}
