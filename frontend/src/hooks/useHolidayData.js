import { useEffect, useState } from "react";
import { fetchMultipleMonthsHolidays } from "../api/holiday";

// 공휴일 데이터 불러오기
export default function useHolidayData(currentDate) {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    let current = true;
    const load = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await fetchMultipleMonthsHolidays(year, month);
      if (!current) return;
      setHolidays(data);
    };
    load();
    return () => { current = false; };
  }, [currentDate]);

  return { holidays };
}
