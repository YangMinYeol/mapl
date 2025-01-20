import CustomCalendar from "../components/Calendar/CustomCalendar";
import MemoAndTodoList from "../components/MemoAndTodoList/MemoAndTodoList";

export default function MainPage() {
  return (
    <div>
      <div className="flex flex-wrap h-[900px]">
        <div className="w-full h-full calendar-container md:w-[70%]">
          <CustomCalendar />
        </div>
        <div className="w-full h-full detail-container md:w-[30%]">
          <MemoAndTodoList />
        </div>
      </div>
    </div>
  );
}
