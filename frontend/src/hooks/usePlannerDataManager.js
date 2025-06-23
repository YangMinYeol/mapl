import { useEffect, useState } from "react";
import { fetchCalendarMemos, fetchMemos } from "../api/memo";
import { TABS } from "../constants/tab";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import { useErrorHandler } from "./useErrorHandler";

export function usePlannerDataManager(
  user,
  activeTab,
  selectedDate,
  currentDate
) {
  const [dashboardDatas, setDashboardDatas] = useState([]);
  const [calendarDatas, setCalendarDatas] = useState([]);
  const handleError = useErrorHandler();

  // 선택된 날짜에 대한 대시보드 데이터 불러오기
  useEffect(() => {
    if (user) {
      loadDashboardDatas();
    }
  }, [user, selectedDate]);

  // 대시보드 목록 로드
  async function loadDashboardDatas() {
    try {
      let data = [];
      if (activeTab === TABS.MEMO) {
        data = await fetchMemos(user.id, selectedDate);
      } else if (activeTab === TABS.ACCOUNTBOOK) {
      }
      setDashboardDatas(data);
    } catch (error) {
      handleError(error);
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
    }
  }

  return {
    dashboardDatas,
    calendarDatas,
    loadDashboardDatas,
    loadCalendarDatas,
  };
}
