import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { addMemo } from "../../../../api/memo";
import { useModal } from "../../../../context/ModalContext";
import { UserContext } from "../../../../context/UserContext";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import { setDateByPeriod } from "../../../../util/dateUtil";
import SubMemoContent from "./SubMemoContent";
import SubMemoHeader from "./SubMemoHeader";
import { useNavigate } from "react-router-dom";
import SecondaryPanel from "../../SecondaryPanel";

export default function SubMemo({
  quote,
  dashboardDatas,
  periods,
  selectedPeriod,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
  openLinkModal,
  onEdit,
}) {
  const navigate = useNavigate();
  const { openConfirm } = useModal();
  const [checkedIds, setCheckedIds] = useState([]);
  const importing = useRef(false);
  const [isImporting, setIsImporting] = useState(false);
  const handleError = useErrorHandler();
  const { user } = useContext(UserContext);
  const isBucketList = useMemo(
    () => selectedPeriod.name === "Other",
    [selectedPeriod]
  );

  const periodFilterMap = {
    Day: ["Week", "Month", "Year", "Other"],
    Week: ["Month", "Year", "Other"],
    Month: ["Year", "Other"],
    Year: ["Other"],
    Other: ["Other"],
  };

  const filterPeriods = useMemo(() => {
    return periods.filter((period) =>
      periodFilterMap[selectedPeriod.name]?.includes(period.name)
    );
  }, [selectedPeriod, periods]);

  const [selectedValue, setSelectedValue] = useState(filterPeriods[0]?.id);

  useEffect(() => {
    setCheckedIds([]);
  }, [selectedPeriod, selectedDate, selectedValue]);

  useEffect(() => {
    setSelectedValue(filterPeriods[0]?.id);
  }, [filterPeriods]);

  function handleToggle(id) {
    setCheckedIds((prev) =>
      prev.includes(id)
        ? prev.filter((checkedId) => checkedId !== id)
        : [...prev, id]
    );
  }

  // Sub메모 추가
  function handleAddMemo() {
    if (importing.current) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const selectedMemos = dashboardDatas.filter((memo) => checkedIds.includes(memo.id));
    if (selectedMemos.length === 0) return;

    openConfirm(
      "선택한 메모를 가져올까요?",
      "복사하면 원본과 별도로 관리돼요.\n연결하면 원본과 수정·완료·삭제가 함께 반영돼요.",
      () => importMemos(selectedMemos, true),
      () => importMemos(selectedMemos, false),
      { yes: "연결", no: "복사" }
    );
  }

  async function importMemos(selectedMemos, isLinked) {
    if (importing.current) return;
    importing.current = true;
    setIsImporting(true);
    try {
      const { startDate, endDate } = setDateByPeriod(
        selectedPeriod,
        selectedDate
      );
      await addMemo(selectedMemos.map((memo) => ({
        userId: user.id,
        content: memo.content,
        startDate,
        endDate,
        periodId: selectedPeriod.id,
        link: isLinked ? memo.link : undefined,
        isLinked,
      })));
      await Promise.all([loadDashboardDatas(), loadCalendarDatas()]);
      setCheckedIds((ids) => ids.filter((id) => !selectedMemos.some((memo) => memo.id === id)));
    } catch (error) {
      handleError(error);
    } finally {
      importing.current = false;
      setIsImporting(false);
    }
  }

  return (
    <SecondaryPanel label={isBucketList ? "버킷리스트 한마디" : "상위 기간 메모"}>
      <SubMemoHeader
        filterPeriods={filterPeriods}
        selectedValue={selectedValue}
        handleChange={(e) => setSelectedValue(e.target.value)}
        handleAddMemo={handleAddMemo}
        isImporting={isImporting}
        isBucketList={isBucketList}
      />
      <SubMemoContent
        quote={quote}
        dashboardDatas={dashboardDatas}
        selectedValue={selectedValue}
        selectedPeriodName={filterPeriods.find((period) => period.id === Number(selectedValue))?.name}
        selectedDate={selectedDate}
        checkedIds={checkedIds}
        handleToggle={handleToggle}
        isBucketList={isBucketList}
        openLinkModal={openLinkModal}
        onEdit={onEdit}
      />
    </SecondaryPanel>
  );
}
