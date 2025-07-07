import { useEffect, useState } from "react";
import { useErrorHandler } from "./useErrorHandler";
import { fetchDashboardAccountBooks } from "../api/account-book";
import { setDateByPeriod } from "../util/dateUtil";

export function useAccountBookDataManager(
  user,
  selectedDate,
  currentDate,
  selectedPeriod
) {
  const [dashboardDatas, setDashboardDatas] = useState([]);
  const [calendarDatas, setCalendarDatas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleError = useErrorHandler();

  // 대시보드 데이터 로드
  useEffect(() => {
    if (!user || !selectedDate || !selectedPeriod) return;
    loadDashboardDatas();
  }, [user, selectedDate, selectedPeriod]);

  // 달력 데이터 로드
  useEffect(() => {
    if (!user || !currentDate) return;
    loadCalendarDatas();
  }, [user, currentDate]);

  async function loadDashboardDatas() {
    setIsLoading(true);
    try {
      const { startDate, endDate } = setDateByPeriod(
        selectedPeriod,
        selectedDate
      );
      const data = await fetchDashboardAccountBooks(
        user.id,
        startDate,
        endDate
      );
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
