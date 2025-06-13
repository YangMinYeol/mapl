import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function BoardTabs({ onTabClick, boardTabs, activeBoard }) {
  return (
    <div className="min-w-[200px]">
      <div className="pb-7 min-h-16">
        <span className="text-3xl">고객센터</span>
      </div>
      <div className="w-full border divide-y border-mapl-slate divide-mapl-slate">
        {boardTabs.map((tab) => {
          const isSelected = activeBoard.key === tab.key;
          return (
            <div
              key={tab.key}
              onClick={() => onTabClick(tab)}
              className={`h-12 flex items-center justify-between px-4 cursor-pointer
                  font-medium
                  ${
                    isSelected
                      ? "bg-gray-50 text-green-900"
                      : "text-[#666] hover:bg-gray-50 hover:text-green-900"
                  }
                `}
            >
              <span>{tab.title}</span>
              <FontAwesomeIcon icon={faAngleRight} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
