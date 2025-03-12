import Calendar from "../components/calendar/Calendar";
import Dashboard from "../components/dashboard/Dashboard";
import { formatDateYYYYMMDD } from "../util/dateUtil";
import { useState } from "react";

export default function MainPage() {
  const date = new Date();
  const [selectedDate, setSelectedDate] = useState(formatDateYYYYMMDD(date));
  function handleSetSelectedDate(date) {
    setSelectedDate(formatDateYYYYMMDD(date));
  }
  return (
    <div>
      <div className="flex flex-wrap h-[900px]">
        <div className="w-full h-full calendar-container md:w-[70%]">
          <Calendar
            selectedDate={selectedDate}
            setSelectedDate={handleSetSelectedDate}
          />
        </div>
        <div className="w-full h-full detail-container md:w-[30%]">
          <Dashboard selectedDate={selectedDate} />
        </div>
      </div>
    </div>
  );
}
