import { useContext, useEffect, useMemo, useState } from "react";
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
    if (!user) {
      navigate("/login");
      return;
    }

    if (checkedIds.length === 0) {
      return;
    }
    openConfirm(
      "선택한 메모를 가져올까요?",
      "복사하면 원본과 별도로 관리돼요.\n연결하면 원본과 수정·완료·삭제가 함께 반영돼요.",
      addLinkedSubMemoToMain,
      addSubMemoToMain,
      { yes: "연결", no: "복사" }
    );
  }

  // Sub 메모를 Main에 추가 - default
  async function addSubMemoToMain() {
    try {
      const memoArray = [];
      const { startDate, endDate } = setDateByPeriod(
        selectedPeriod,
        selectedDate
      );
      const userId = user.id;
      const periodId = selectedPeriod.id;
      const filterMemos = filterCheckedMemos();
      for (const filterMemo of filterMemos) {
        memoArray.push({
          userId,
          content: filterMemo.content,
          startDate,
          endDate,
          periodId,
          isLinked: false,
        });
      }

      await addMemo(memoArray);
      await loadDashboardDatas();
      await loadCalendarDatas();
      setCheckedIds([]);
    } catch (error) {
      handleError(error);
    }
  }

  // Sub 메모를 Main에 추가 - link
  async function addLinkedSubMemoToMain() {
    try {
      const memoArray = [];
      const { startDate, endDate } = setDateByPeriod(
        selectedPeriod,
        selectedDate
      );
      const userId = user.id;
      const periodId = selectedPeriod.id;
      const filterMemos = filterCheckedMemos();
      for (const filterMemo of filterMemos) {
        memoArray.push({
          userId,
          content: filterMemo.content,
          startDate,
          endDate,
          periodId,
          link: filterMemo.link,
          isLinked: true,
        });
      }

      await addMemo(memoArray);
      await loadDashboardDatas();
      await loadCalendarDatas();
      setCheckedIds([]);
    } catch (error) {
      handleError(error);
    }
  }

  // 체크된 메모만 필터링
  function filterCheckedMemos() {
    return dashboardDatas.filter((memo) => checkedIds.includes(memo.id));
  }

  return (
    <SecondaryPanel label={isBucketList ? "버킷리스트 한마디" : "상위 기간 메모"}>
      <SubMemoHeader
        filterPeriods={filterPeriods}
        selectedValue={selectedValue}
        handleChange={(e) => setSelectedValue(e.target.value)}
        handleAddMemo={handleAddMemo}
        isBucketList={isBucketList}
      />
      <SubMemoContent
        dashboardDatas={dashboardDatas}
        selectedValue={selectedValue}
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
