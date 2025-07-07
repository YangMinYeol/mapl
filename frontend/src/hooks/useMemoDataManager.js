import { useEffect, useState } from "react";
import { fetchCalendarMemos, fetchDashboardMemos } from "../api/memo";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import { useErrorHandler } from "./useErrorHandler";

export function useMemoDataManager(user, selectedDate, currentDate) {
  const [dashboardDatas, setDashboardDatas] = useState([]);
  const [calendarDatas, setCalendarDatas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleError = useErrorHandler();

  // 대시보드 데이터 로드
  useEffect(() => {
    if (!user || !selectedDate) return;
    loadDashboardDatas();
  }, [user, selectedDate]);

  // 달력 데이터 로드
  useEffect(() => {
    if (!user || !currentDate) return;
    loadCalendarDatas();
  }, [user, currentDate]);

  async function loadDashboardDatas() {
    setIsLoading(true);
    try {
      const data = await fetchDashboardMemos(user.id, selectedDate);
      setDashboardDatas(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadCalendarDatas() {
    setIsLoading(true);
    try {
      const data = await fetchCalendarMemos(
        user.id,
        formatDateYYYYMMDD(currentDate)
      );
      setCalendarDatas(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    dashboardDatas,
    calendarDatas,
    loadDashboardDatas,
    loadCalendarDatas,
    isLoading,
  };
}
