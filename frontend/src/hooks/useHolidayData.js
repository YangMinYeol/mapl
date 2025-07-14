import { useEffect, useState } from "react";
import { fetchMultipleMonthsHolidays } from "../api/holiday";

// 공휴일 데이터 불러오기
export default function useHolidayData(currentDate) {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await fetchMultipleMonthsHolidays(year, month);
      setHolidays(data);
      setIsLoading(false);
    };
    load();
  }, [currentDate]);

  return { holidays, isLoading };
}
