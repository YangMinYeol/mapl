import { useContext, useEffect, useState } from "react";
import Calendar from "../components/calendar/Calendar";
import Loading from "../components/common/Loading";
import Dashboard from "../components/dashboard/Dashboard";
import { TABS } from "../constants/tab";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { useAccountBookDataManager } from "../hooks/useAccountBookDataManager";
import { useMemoDataManager } from "../hooks/useMemoDataManager";
import { formatDateYYYYMMDD } from "../util/dateUtil";

const API_URL = import.meta.env.VITE_API_URL;

function getTabData(activeTab, managers) {
  return activeTab === TABS.MEMO ? managers.memo : managers.accountBook;
}

export default function MainPage() {
  const today = new Date();

  const [activeTab, setActiveTab] = useState(TABS.MEMO);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({});
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(formatDateYYYYMMDD(today));

  const { openModal } = useModal();
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
  } = getTabData(activeTab, { memo, accountBook });

  const isLoading = memo.isLoading || accountBook.isLoading || periods.length === 0;

  const handleSetSelectedDate = (date) => {
    setSelectedDate(formatDateYYYYMMDD(date));
  };

  useEffect(() => {
    fetchPeriodType();
  }, []);

  async function fetchPeriodType() {
    try {
      const response = await fetch(`${API_URL}/api/period`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPeriods(data);
      setSelectedPeriod(data[0]);
    } catch (error) {
      console.error("기한 목록 오류:", error);
      openModal(error.message);
    }
  }

  return (
    <div>
      <div className="flex flex-nowrap h-[900px]">
        {isLoading ? (
          <Loading />
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
