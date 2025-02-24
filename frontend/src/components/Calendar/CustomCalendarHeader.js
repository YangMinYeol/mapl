import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { useState } from "react";

export default function CustomCalendarHeader({
  currentDate,
  handleMonth,
  goToToday,
}) {
  const TABS = { MEMO: "Memo", TODO: "Todo", WALLET: "Wallet" };
  const tabs = [
    { id: TABS.MEMO, label: "Memo" },
    { id: TABS.TODO, label: "Todo" },
    { id: TABS.WALLET, label: "Wallet" },
  ];
  const [activeTab, setActiveTab] = useState(TABS.MEMO);
  const month = format(currentDate, "yyyy년 MM월");

  function handleTab(tabId) {
    setActiveTab(tabId);
  }

  return (
    <div className="flex items-center justify-between h-10 py-2 border-y-2">
      <div className=" calendar-header-left">
        <div className="flex pl-1 space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-1 border rounded-md ${
                activeTab === tab.id ? "bg-deep-green text-white" : "bg-white"
              } hover:bg-deep-green hover:text-white`}
              onClick={() => handleTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center calendar-header-center">
        <button
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-mapl-slate"
          onClick={() => handleMonth(-1)}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
        <span className="px-3 font-semibold">{month}</span>
        <button
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-mapl-slate"
          onClick={() => handleMonth(+1)}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
      </div>
      <div className="pr-2">
        <button className="group" onClick={() => goToToday()}>
          <FontAwesomeIcon
            icon={faCalendar}
            className="group-hover:text-green-900"
          />
        </button>
      </div>
    </div>
  );
}
