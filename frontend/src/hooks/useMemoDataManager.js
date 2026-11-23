import { useCallback } from "react";
import { fetchCalendarMemos, fetchDashboardMemos } from "../api/memo";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import { usePlannerList } from "./usePlannerList";

export function useMemoDataManager(user, selectedDate, currentDate) {
  const userId = user?.id;
  const month = formatDateYYYYMMDD(currentDate);
  const dashboardQuery = useCallback(() => fetchDashboardMemos(userId, selectedDate), [userId, selectedDate]);
  const calendarQuery = useCallback(() => fetchCalendarMemos(userId, month), [userId, month]);
  const [dashboardDatas, loadDashboardDatas, dashboardPending] = usePlannerList(userId ? dashboardQuery : null);
  const [calendarDatas, loadCalendarDatas, calendarPending] = usePlannerList(userId ? calendarQuery : null);

  return { dashboardDatas, calendarDatas, loadDashboardDatas, loadCalendarDatas, dashboardPending, calendarPending };
}
