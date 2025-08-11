import { useContext, useEffect, useMemo, useState } from "react";
import { addMemo } from "../../../../api/memo";
import { useModal } from "../../../../context/ModalContext";
import { UserContext } from "../../../../context/UserContext";
import { useErrorHandler } from "../../../../hooks/useErrorHandler";
import { setDateByPeriod } from "../../../../util/dateUtil";
import SubMemoContent from "./SubMemoContent";
import SubMemoHeader from "./SubMemoHeader";
import { useNavigate } from "react-router-dom";

export default function SubMemo({
  dashboardDatas,
  periods,
  selectedPeriod,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
  openLinkModal,
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
      "선택한 메모를 링크를 연결하여 추가하시겠습니까?",
      "링크는 서로 동기화되어 수정, 삭제, 완료 동작이 함께 적용됩니다.",
      addLinkedSubMemoToMain,
      addSubMemoToMain
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
    <div className="h-[340px]">
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
      />
    </div>
  );
}
