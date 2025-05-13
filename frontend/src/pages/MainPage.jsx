import { fetchCalendarMemos, fetchMemos } from "../api/memo";
import Calendar from "../components/calendar/Calendar";
import Dashboard from "../components/dashboard/Dashboard";
import { convertArraySnakeToCamel } from "../util/caseConverter";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import { useContext, useEffect, useState } from "react";
import { LoginExpiredError } from "../util/error";
import { useModal } from "../context/ModalContext";
import { UserContext } from "../context/UserContext";
import { useLoginExpiredHandler } from "../hooks/useLoginExpiredHandler";

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
    loadDashboardMemos();
  }, [user, selectedDate]);

  // 달력 메모 목록 불러오기
  useEffect(() => {
    loadCalendarMemos();
  }, [user, currentDate]);

  // 기한 목록 불러오기
  useEffect(() => {
    fetchPeriodType();
  }, []);

  // 대시보드 목록 불러오기
  async function loadDashboardMemos() {
    try {
      const memoData = await fetchMemos(user.id, selectedDate);
      const convertedMemos = convertArraySnakeToCamel(memoData);

      setDashboardMemos(convertedMemos);
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
      setCalendarMemos(convertArraySnakeToCamel(memoData));
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
      <div className="flex flex-wrap h-[900px]">
        <div className="w-full h-full calendar-container md:w-[70%]">
          <Calendar
            calendarMemos={calendarMemos}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            selectedDate={selectedDate}
            setSelectedDate={handleSetSelectedDate}
            loadDashboardMemos={loadDashboardMemos}
            loadCalendarMemos={loadCalendarMemos}
          />
        </div>
        <div className="w-full h-full detail-container md:w-[30%]">
          <Dashboard
            dashboardMemos={dashboardMemos}
            loadDashboardMemos={loadDashboardMemos}
            loadCalendarMemos={loadCalendarMemos}
            selectedDate={selectedDate}
            periods={periods}
            selectedPeriod={selectedPeriod}
            handleSelectedPeriod={handleSelectedPeriod}
          />
        </div>
      </div>
    </div>
  );
}
