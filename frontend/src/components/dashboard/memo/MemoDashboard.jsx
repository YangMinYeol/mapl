import { useState } from "react";
import LinkModal from "../../link/LinkModal";
import MemoModal from "../../memo/MemoModal";
import { LINKED_MEMO } from "../../../constants/messages";
import { useModal } from "../../../context/ModalContext";
import { MEMO_MODAL_MODE } from "../../../util/memoUtil";
import PeriodSelector from "./../PeriodSelector";
import MainMemo from "./../memo/main/MainMemo";
import SubMemo from "./../memo/sub/SubMemo";

export default function MemoDashboard({
  dashboardDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  selectedDate,
  periods,
  selectedPeriod,
  setSelectedPeriod,
}) {
  const periodMemos = dashboardDatas.filter((memo) => memo.periodId === selectedPeriod.id);
  const totalMemos = periodMemos.length;
  const completedMemos = periodMemos.filter((memo) => memo.completed).length;

  // 링크 메모
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedLinkMemo, setSelectedLinkMemo] = useState(null);
  const [editingMemo, setEditingMemo] = useState(null);
  const { openConfirm } = useModal();

  function openEditMemo(memo) {
    if (memo.isLinked) {
      openConfirm(LINKED_MEMO.TITLE, LINKED_MEMO.EDIT_CONFIRM, () => setEditingMemo(memo));
    } else {
      setEditingMemo(memo);
    }
  }

  function openLinkModal(memo) {
    setSelectedLinkMemo(memo);
    setIsLinkModalOpen(true);
  }

  function closeLinkModal() {
    setIsLinkModalOpen(false);
  }
  return (
    <>
      <PeriodSelector
        periods={periods}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />
      <MainMemo
        dashboardDatas={dashboardDatas}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        totalMemos={totalMemos}
        completedMemos={completedMemos}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        openLinkModal={openLinkModal}
        onEdit={openEditMemo}
      />
      <SubMemo
        dashboardDatas={dashboardDatas}
        periods={periods}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        openLinkModal={openLinkModal}
        onEdit={openEditMemo}
      />
      {editingMemo && (
        <MemoModal
          isOpen
          onClose={() => setEditingMemo(null)}
          selectedDate={selectedDate}
          mode={MEMO_MODAL_MODE.EDIT}
          memo={editingMemo}
          selectedPeriod={periods.find((period) => period.id === editingMemo.periodId) ?? selectedPeriod}
          loadDashboardDatas={loadDashboardDatas}
          loadCalendarDatas={loadCalendarDatas}
        />
      )}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={closeLinkModal}
        selectedLinkMemo={selectedLinkMemo}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
      />
    </>
  );
}
