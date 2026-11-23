import { useContext, useEffect, useState } from "react";
import Calendar from "../components/calendar/Calendar";
import Loading from "../components/common/Loading";
import Dashboard from "../components/dashboard/Dashboard";
import { TABS } from "../constants/tab";
import { UserContext } from "../context/UserContext";
import { useAccountBookDataManager } from "../hooks/useAccountBookDataManager";
import { useMemoDataManager } from "../hooks/useMemoDataManager";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import "../styles/planner.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function MainPage() {
  const today = new Date();

  const [activeTab, setActiveTab] = useState(TABS.MEMO);
  const [periods, setPeriods] = useState([]);
  const [periodError, setPeriodError] = useState(false);
  const [periodAttempt, setPeriodAttempt] = useState(0);
  const [showRecordsLoading, setShowRecordsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(formatDateYYYYMMDD(today));

  const { user } = useContext(UserContext);

  // 각 탭별 데이터 매니저
  const memo = useMemoDataManager(user, selectedDate, currentDate);
  const accountBook = useAccountBookDataManager(
    user,
    selectedDate,
    currentDate,
    selectedPeriod
  );

  const {
    dashboardDatas,
    calendarDatas,
    loadDashboardDatas,
    loadCalendarDatas,
    dashboardPending,
    calendarPending,
  } = activeTab === TABS.MEMO ? memo : accountBook;

  const isLoading = periods.length === 0;
  const recordsPending = !isLoading && (calendarPending || dashboardPending);
  const blockForRecords = recordsPending && showRecordsLoading;

  useEffect(() => {
    if (!recordsPending) {
      setShowRecordsLoading(false);
      return;
    }
    const timer = window.setTimeout(() => setShowRecordsLoading(true), 800);
    return () => window.clearTimeout(timer);
  }, [recordsPending]);

  const handleSetSelectedDate = (date) => {
    setSelectedDate(formatDateYYYYMMDD(date));
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadPeriods() {
      try {
        const response = await fetch(`${API_URL}/api/period`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data) || data.length === 0) throw new Error("기간 정보를 불러오지 못했습니다.");
        setPeriods(data);
        setSelectedPeriod(data.find((period) => period.name === "Day") ?? data[0]);
      } catch (error) {
        if (!controller.signal.aborted) setPeriodError(true);
      }
    }
    loadPeriods();
    return () => controller.abort();
  }, [periodAttempt]);

  return (
    <div>
      <div className="planner-workspace" inert={blockForRecords ? "" : undefined} aria-busy={recordsPending || isLoading}>
        {periodError ? (
          <div className="grid min-h-24 justify-items-center content-center gap-2">
            <p role="alert">기간 정보를 불러오지 못했습니다.</p>
            <button type="button" className="mapl-button px-3 py-1.5" onClick={() => {
              setPeriodError(false);
              setPeriodAttempt((attempt) => attempt + 1);
            }}>다시 시도</button>
          </div>
        ) : isLoading ? (
          <Loading placement="inline" label="달력 준비 중" />
        ) : (
          <>
            <div className="calendar-container">
              <Calendar
                calendarDatas={calendarDatas}
                loadDashboardDatas={loadDashboardDatas}
                loadCalendarDatas={loadCalendarDatas}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                selectedDate={selectedDate}
                setSelectedDate={handleSetSelectedDate}
                periods={periods}
                setSelectedPeriod={setSelectedPeriod}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
            <div className="dashboard-container">
              <Dashboard
                activeTab={activeTab}
                dashboardDatas={dashboardDatas}
                loadDashboardDatas={loadDashboardDatas}
                loadCalendarDatas={loadCalendarDatas}
                selectedDate={selectedDate}
                periods={periods}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
              />
            </div>
          </>
        )}
      </div>
      {blockForRecords && <Loading />}
    </div>
  );
}
