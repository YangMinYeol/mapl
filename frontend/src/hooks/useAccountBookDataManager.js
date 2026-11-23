import { useCallback } from "react";
import { fetchCalendarAccountBooks, fetchDashboardAccountBooks } from "../api/account-book";
import { formatDateYYYYMMDD, setDateByPeriod } from "../util/dateUtil";
import { usePlannerList } from "./usePlannerList";

export function useAccountBookDataManager(user, selectedDate, currentDate, selectedPeriod) {
  const userId = user?.id;
  const month = formatDateYYYYMMDD(currentDate);
  const dashboardQuery = useCallback(() => {
    const { startDate, endDate } = setDateByPeriod(selectedPeriod, selectedDate);
    return fetchDashboardAccountBooks(userId, startDate, endDate);
  }, [userId, selectedDate, selectedPeriod]);
  const calendarQuery = useCallback(() => fetchCalendarAccountBooks(userId, month), [userId, month]);
  const [dashboardDatas, loadDashboardDatas] = usePlannerList(userId && selectedPeriod?.name ? dashboardQuery : null);
  const [calendarDatas, loadCalendarDatas] = usePlannerList(userId ? calendarQuery : null);

  return { dashboardDatas, calendarDatas, loadDashboardDatas, loadCalendarDatas };
}
