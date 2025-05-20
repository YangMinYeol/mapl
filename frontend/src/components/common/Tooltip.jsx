import { formatDateYYYYMMDD } from "../../util/dateUtil";
import { formatTimeTo12Hour } from "../../util/timeUtil";
import { useState } from "react";

export default function Tooltip({ memo, children }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => setVisible(true);
  const handleMouseLeave = () => setVisible(false);
  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      {visible && (
        <div
          className="fixed z-50 max-w-xs px-2 py-1 text-white break-words whitespace-pre-wrap bg-black rounded shadow-md"
          style={{
            top: position.y + 12, // 마우스 아래쪽에 띄움
            left: position.x + 12, // 마우스 오른쪽에 띄움
          }}
        >
          <div className="mb-1 font-semibold">{memo.content}</div>
          <div className="text-xs">
            <span className="inline-block w-10">From:</span>
            {`${formatDateYYYYMMDD(memo.startDate)} ${formatTimeTo12Hour(
              memo.startTime
            )}`}
          </div>
          <div className="text-xs">
            <span className="inline-block w-10">To:</span>
            {`${formatDateYYYYMMDD(memo.endDate)} ${formatTimeTo12Hour(
              memo.endTime
            )}`}
          </div>
        </div>
      )}
    </div>
  );
}
