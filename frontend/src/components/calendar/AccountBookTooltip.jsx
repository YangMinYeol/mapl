import { useState } from "react";
import { extractDateAndTime } from "../../util/dateUtil";

export default function AccountBookToolTip({ tag, amountPrefix, children }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = () => setVisible(true);
  const handleMouseLeave = () => setVisible(false);
  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };
  const { date, time } = extractDateAndTime(tag.occurredAt);
  const content = tag.content;

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
          <div className="flex flex-col mb-1 font-semibold">
            <div>
              {tag.categoryName} {content && `- ${content}`}
            </div>
          </div>
          <div className="text-xs">
            <span className="inline-block w-7">일시:</span>
            {date} {time}
          </div>
        </div>
      )}
    </div>
  );
}
