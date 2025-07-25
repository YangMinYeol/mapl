import { useEffect, useState } from "react";
import {
  fetchCalendarAccountBooks,
  fetchDashboardAccountBooks,
} from "../api/account-book";
import { formatDateYYYYMMDD, setDateByPeriod } from "../util/dateUtil";
import { useErrorHandler } from "./useErrorHandler";

export function useAccountBookDataManager(
  user,
  selectedDate,
  currentDate,
  selectedPeriod
) {
  const [dashboardDatas, setDashboardDatas] = useState([]);
  const [calendarDatas, setCalendarDatas] = useState([]);
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
    }
  }

  async function loadCalendarDatas() {
    try {
      const data = await fetchCalendarAccountBooks(
        user.id,
        formatDateYYYYMMDD(currentDate)
      );
      setCalendarDatas(data);
    } catch (error) {
      handleError(error);
    }
  }

  return {
    dashboardDatas,
    calendarDatas,
    loadDashboardDatas,
    loadCalendarDatas,
  };
}
