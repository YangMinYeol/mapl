import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { ACCOUNTBOOK_MODAL_MODE } from "../../../util/accountBookUtil";
import AccountBookModal from "../../account-book/AccountBookModal";
import AccountBookDashboardItem from "./AccountBookDashboardItem";
import useAssetStore from "../../../stores/useAssetStore";

export default function AccountBookDashboardContent({
  dashboardDatas,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
}) {
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [dashboardModalMode, setDashboardModalMode] = useState("");

  const asset = useAssetStore((state) => state.asset);

  // 모달 열기
  function openAccountBookModal() {
    setDashboardModalMode(ACCOUNTBOOK_MODAL_MODE.CREATE);
    setIsDashboardModalOpen(true);
  }

  // 모달 닫기
  function closeAccountBookModal() {
    setIsDashboardModalOpen(false);
  }

  return (
    <div className="h-[600px] border-b border-mapl-slate">
      <div className="p-1 font-medium h-1/24 text-deep-green">{`자산 ${Number(
        asset ? asset.balance : 0
      ).toLocaleString()}`}</div>
      <div className="h-10/12">
        {dashboardDatas.map((item) => (
          <AccountBookDashboardItem key={item.id} item={item} />
        ))}
      </div>
      <div className="flex items-center text-base h-1/24">
        <div className="w-1/2 p-1">전체 내역 n건</div>
        <div className="w-1/2 p-1">합계</div>
      </div>
      <div className="flex items-center p-2 h-1/12">
        <input
          className="px-1 border rounded outline-none border-mapl-black w-15/16"
          maxLength={100}
        />
        <button
          className="cursor-pointer w-1/16"
          onClick={openAccountBookModal}
        >
          <FontAwesomeIcon color="#173836" icon={faCirclePlus} size="xl" />
        </button>
      </div>
      <AccountBookModal
        isOpen={isDashboardModalOpen}
        onClose={closeAccountBookModal}
        mode={dashboardModalMode}
        selectedDate={selectedDate}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
      />
    </div>
  );
}
