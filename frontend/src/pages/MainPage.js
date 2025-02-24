import CustomCalendar from "../components/calendar/CustomCalendar";
import Dashboard from "../components/dashboard/Dashboard";

export default function MainPage() {
  return (
    <div>
      <div className="flex flex-wrap h-[900px]">
        <div className="w-full h-full calendar-container md:w-[70%]">
          <CustomCalendar />
        </div>
        <div className="w-full h-full detail-container md:w-[30%]">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
