import { useEffect, useState } from "react";
import { fetchAccountBooks } from "../api/account-book";
import { fetchCalendarMemos, fetchMemos } from "../api/memo";
import { TABS } from "../constants/tab";
import { formatDateYYYYMMDD, setDateByPeriod } from "../util/dateUtil";
import { useErrorHandler } from "./useErrorHandler";

export function usePlannerDataManager(
  user,
  activeTab,
  selectedDate,
  currentDate,
  selectedPeriod
) {
  const [dashboardDatas, setDashboardDatas] = useState([]);
  const [calendarDatas, setCalendarDatas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleError = useErrorHandler();

  // MEMO
  useEffect(() => {
    if (!user || activeTab !== TABS.MEMO || !selectedDate) return;
    loadDashboardDatas();
  }, [user, selectedDate, activeTab]);

  // ACCOUNTBOOK
  useEffect(() => {
    if (
      !user ||
      activeTab !== TABS.ACCOUNTBOOK ||
      !selectedDate ||
      !selectedPeriod
    )
      return;
    loadDashboardDatas();
  }, [user, selectedDate, selectedPeriod, activeTab]);

  // 대시보드 목록 로드
  async function loadDashboardDatas() {
    setIsLoading(true);
    try {
      let data = [];
      const userId = user.id;
      if (activeTab === TABS.MEMO) {
        data = await fetchMemos(userId, selectedDate);
      } else if (activeTab === TABS.ACCOUNTBOOK) {
        const { startDate, endDate } = setDateByPeriod(
          selectedPeriod,
          selectedDate
        );
        data = await fetchAccountBooks(userId, startDate, endDate);
      }
      setDashboardDatas(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  // 보고있는 날짜에 대한 달력 데이터 불러오기
  useEffect(() => {
    if (user) {
      loadCalendarDatas();
    }
  }, [user, currentDate]);

  // 달력 목록 로드
  async function loadCalendarDatas() {
    setIsLoading(true);
    try {
      let data = [];
      if (activeTab === TABS.MEMO) {
        data = await fetchCalendarMemos(
          user.id,
          formatDateYYYYMMDD(currentDate)
        );
      } else if (activeTab === TABS.ACCOUNTBOOK) {
      }
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
