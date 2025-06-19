import { useContext, useEffect, useState } from "react";
import { fetchCalendarMemos, fetchMemos } from "../api/memo";
import Calendar from "../components/calendar/Calendar";
import Dashboard from "../components/dashboard/Dashboard";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { useLoginExpiredHandler } from "../hooks/useLoginExpiredHandler";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import { LoginExpiredError } from "../util/error";

const API_URL = import.meta.env.VITE_API_URL;

export default function MainPage() {
  const date = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dashboardMemos, setDashboardMemos] = useState([]);
  const [calendarMemos, setCalendarMemos] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState({});
  const { openModal } = useModal();
  const { user } = useContext(UserContext);
  const handleLoginExpired = useLoginExpiredHandler();

  const [selectedDate, setSelectedDate] = useState(formatDateYYYYMMDD(date));
  function handleSetSelectedDate(date) {
    setSelectedDate(formatDateYYYYMMDD(date));
  }

  // 대시보드 메모 목록 불러오기
  useEffect(() => {
    if (user) {
      loadDashboardMemos();
    }
  }, [user, selectedDate]);

  // 달력 메모 목록 불러오기
  useEffect(() => {
    if (user) {
      loadCalendarMemos();
    }
  }, [user, currentDate]);

  // 기한 목록 불러오기
  useEffect(() => {
    fetchPeriodType();
  }, []);

  // 대시보드 목록 불러오기
  async function loadDashboardMemos() {
    try {
      const memoData = await fetchMemos(user.id, selectedDate);

      setDashboardMemos(memoData);
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 목록 불러오기 오류:", error);
        openModal(error.message);
      }
    }
  }

  // 달력 목록 불러오기
  async function loadCalendarMemos() {
    try {
      const memoData = await fetchCalendarMemos(
        user.id,
        formatDateYYYYMMDD(currentDate)
      );
      setCalendarMemos(memoData);
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("달력 불러오기 오류:", error);
        openModal(error.message);
      }
    }
  }

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

  // 기한 선택
  function handleSelectedPeriod(period) {
    setSelectedPeriod(period);
  }

  return (
    <div>
      <div className="flex flex-nowwrap h-[900px]">
        <div className="w-[70%] h-full min-w-[600px] calendar-container">
          <Calendar
            calendarMemos={calendarMemos}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={handleSetSelectedDate}
            loadDashboardMemos={loadDashboardMemos}
            loadCalendarMemos={loadCalendarMemos}
            periods={periods}
            setSelectedPeriod={handleSelectedPeriod}
          />
        </div>
        <div className="w-[30%] h-full min-w-[300px] dashboard-container">
          <Dashboard
            dashboardMemos={dashboardMemos}
            loadDashboardMemos={loadDashboardMemos}
            loadCalendarMemos={loadCalendarMemos}
            selectedDate={selectedDate}
            periods={periods}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={handleSelectedPeriod}
          />
        </div>
      </div>
    </div>
  );
}
