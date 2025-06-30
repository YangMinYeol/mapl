import { useContext, useEffect, useState } from "react";
import Calendar from "../components/calendar/Calendar";
import Dashboard from "../components/dashboard/Dashboard";
import { TABS } from "../constants/tab";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import { usePlannerDataManager } from "../hooks/usePlannerDataManager";

const API_URL = import.meta.env.VITE_API_URL;

export default function MainPage() {
  const date = new Date();

  const [activeTab, setActiveTab] = useState(TABS.ACCOUNTBOOK);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({});

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(formatDateYYYYMMDD(date));

  const { openModal } = useModal();
  const { user } = useContext(UserContext);

  const {
    dashboardDatas,
    calendarDatas,
    loadDashboardDatas,
    loadCalendarDatas,
  } = usePlannerDataManager(user, activeTab, selectedDate, currentDate, selectedPeriod);

  // 날짜 선택
  function handleSetSelectedDate(date) {
    setSelectedDate(formatDateYYYYMMDD(date));
  }

  // 기한 목록 불러오기
  useEffect(() => {
    fetchPeriodType();
  }, []);

  // 기한 목록 불러오기
  async function fetchPeriodType() {
    try {
      const response = await fetch(`${API_URL}/api/period`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }
      setPeriods(data);
      setSelectedPeriod(data[0]);
    } catch (error) {
      console.error("기한 목록 불러오기 오류:", error);
      openModal(error.message);
    }
  }

  return (
    <div>
      <div className="flex flex-nowwrap h-[900px]">
        <div className="w-[70%] h-full min-w-[600px] calendar-container">
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
        <div className="w-[30%] h-full min-w-[300px] dashboard-container">
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
      </div>
    </div>
  );
}
