import { format } from "date-fns";

export function formatDateYYYYMMDD(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return format(date, "yyyy-MM-dd"); // YYYY-MM-DD 형식으로 변환
}
