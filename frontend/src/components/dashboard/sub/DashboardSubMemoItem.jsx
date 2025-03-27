import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import IconButton from "../../common/IconButton";

export default function DashboardSubMemiItem({ memo }) {
  return (
    <div className="flex items-center px-1 py-1 hover:bg-gray-50">
      <div className="flex justify-center w-1/20 ">
        <IconButton
          icon={memo.completed ? faSquareCheck : faSquare}
          onClick={() => onComplete(memo.id)}
        />
      </div>
      <div className="w-17/20">{memo.content}</div>
    </div>
  );
}
