import { useContext, useEffect, useState } from "react";
import Calendar from "../components/calendar/Calendar";
import Loading from "../components/common/Loading";
import Dashboard from "../components/dashboard/Dashboard";
import { TABS } from "../constants/tab";
import { UserContext } from "../context/UserContext";
import { useAccountBookDataManager } from "../hooks/useAccountBookDataManager";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { useMemoDataManager } from "../hooks/useMemoDataManager";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import "../styles/planner.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function MainPage() {
  const today = new Date();

  const [activeTab, setActiveTab] = useState(TABS.MEMO);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(formatDateYYYYMMDD(today));

  const { user } = useContext(UserContext);
  const handleError = useErrorHandler();

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
  } = activeTab === TABS.MEMO ? memo : accountBook;

  const isLoading = periods.length === 0;

  const handleSetSelectedDate = (date) => {
    setSelectedDate(formatDateYYYYMMDD(date));
  };

  useEffect(() => {
    const controller = new AbortController();
    async function loadPeriods() {
      try {
        const response = await fetch(`${API_URL}/api/period`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setPeriods(data);
        setSelectedPeriod(data.find((period) => period.name === "Day") ?? data[0]);
      } catch (error) {
        if (!controller.signal.aborted) handleError(error);
      }
    }
    loadPeriods();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <div className="planner-workspace">
        {isLoading ? (
          <Loading />
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
    </div>
  );
}
