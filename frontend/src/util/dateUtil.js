import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isAfter,
  isBefore,
  isEqual,
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
  if (period.name === "Bucket List") {
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
  return { startDate: formatDateYYYYMMDD(startDate), endDate };
}

// 두 날짜 사이에 포함되는지 확인
export function isBetween(date, start, end) {
  return (
    (isAfter(date, start) || isEqual(date, start)) &&
    (isBefore(date, end) || isEqual(date, end))
  );
}
