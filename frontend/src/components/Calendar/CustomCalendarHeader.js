import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";

export default function CustomCalendarHeader({ currentDate, handleMonth }) {
  const month = format(currentDate, "yyyy년 MM월");
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border">
      <button
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200"
        onClick={() => handleMonth(-1)}
      >
        <FontAwesomeIcon icon={faAngleLeft} className="text-gray-400" />
      </button>
      <span className="font-semibold">{month}</span>
      <button
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200"
        onClick={() => handleMonth(+1)}
      >
        <FontAwesomeIcon icon={faAngleRight} className="text-gray-400" />
      </button>
    </div>
  );
}
