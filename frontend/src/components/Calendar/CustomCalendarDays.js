export default function CustomCalendarDays() {
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return (
    <div className="grid grid-cols-7 gap-[1px] text-center border-b bg-gray-200">
      {days.map((day, index) => (
        <div
          key={index}
          className={`py-2 bg-white ${
            index === 0
              ? "text-red-500"
              : index === 6
              ? "text-blue-500"
              : "text-black"
          }`}
        >
          <span className="cursor-default select-none">{day}</span>
        </div>
      ))}
    </div>
  );
}
