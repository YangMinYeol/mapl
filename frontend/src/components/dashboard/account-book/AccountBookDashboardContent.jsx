import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { deleteAccountBookItem } from "../../../api/account-book";
import { useModal } from "../../../context/ModalContext";
import { UserContext } from "../../../context/UserContext";
import useAssetStore from "../../../stores/useAssetStore";
import { ACCOUNTBOOK_MODAL_MODE } from "../../../util/accountBookUtil";
import AccountBookModal from "../../account-book/AccountBookModal";
import AccountBookDashboardItem from "./AccountBookDashboardItem";

export default function AccountBookDashboardContent({
  dashboardDatas,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
}) {
  const { user } = useContext(UserContext);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [dashboardModalMode, setDashboardModalMode] = useState("");
  const [selectedItem, setselectedItem] = useState(null);
  const { openModal, openConfirm } = useModal();

  const asset = useAssetStore((state) => state.asset);
  const updateAsset = useAssetStore((state) => state.updateAsset);

  // 모달 열기
  function openAccountBookModal() {
    setDashboardModalMode(ACCOUNTBOOK_MODAL_MODE.ADD);
    setIsDashboardModalOpen(true);
  }

  // 모달 닫기
  function closeAccountBookModal() {
    setIsDashboardModalOpen(false);
  }

  // 가계부 항목 편집
  function handleAccountItemEdit(item) {
    setDashboardModalMode(ACCOUNTBOOK_MODAL_MODE.EDIT);
    setIsDashboardModalOpen(true);
    setselectedItem(item);
  }

  // 가계부 항목 삭제
  function handleAccountItemDelete(item) {
    try {
      openConfirm(
        "정말로 삭제하시겠습니까?",
        "삭제한 항목은 다시 되돌릴 수 없습니다.",
        async () => {
          await deleteAccountBookItem(item.id);
          await updateAsset(user.id);
          await loadDashboardDatas();
          await loadCalendarDatas();
        }
      );
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("가계부 항목 삭제 오류:", error);
        openModal(error.message);
      }
    }
  }

  return (
    <div className="h-[600px] border-b border-mapl-slate">
      <div className="p-1 font-medium h-1/24 text-deep-green">{`자산 ${Number(
        asset ? asset.balance : 0
      ).toLocaleString()}`}</div>
      <div className="h-10/12">
        {dashboardDatas.map((item) => (
          <AccountBookDashboardItem
            key={item.id}
            item={item}
            onEdit={handleAccountItemEdit}
            onDelete={handleAccountItemDelete}
          />
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
        item={selectedItem}
      />
    </div>
  );
}
