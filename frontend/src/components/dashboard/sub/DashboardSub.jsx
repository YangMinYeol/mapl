import DashboardSubHeader from "./DashboardSubHeader";
import DashboardSubContent from "./DashboardSubContent";
import { useEffect, useState, useMemo, useContext } from "react";
import { useModal } from "../../../context/ModalContext";
import { LoginExpiredError } from "../../../util/error";
import { useLoginExpiredHandler } from "../../../hooks/useLoginExpiredHandler";
import { setDateByPeriod } from "../../../util/dateUtil";
import { UserContext } from "../../../context/UserContext";
import { addMemo } from "../../../api/memo";

export default function DashboardSub({
  memos,
  periods,
  selectedPeriod,
  selectedDate,
  refreshMemoList,
}) {
  const { openConfirm, openModal } = useModal();
  const [checkedIds, setCheckedIds] = useState([]);
  const handleLoginExpired = useLoginExpiredHandler();
  const { user } = useContext(UserContext);

  const periodFilterMap = {
    Day: ["Week", "Month", "Year", "Bucket List"],
    Week: ["Month", "Year", "Bucket List"],
    Month: ["Year", "Bucket List"],
    Year: ["Bucket List"],
    "Bucket List": ["Bucket List"],
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
      await refreshMemoList();
      setCheckedIds([]);
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 추가 오류:", error);
        openModal(error.message);
      }
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
      await refreshMemoList();
      setCheckedIds([]);
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 추가 오류:", error);
        openModal(error.message);
      }
    }
  }

  // 체크된 메모만 필터링
  function filterCheckedMemos() {
    return memos.filter((memo) => checkedIds.includes(memo.id));
  }

  return (
    <div className="h-[340px]">
      <DashboardSubHeader
        filterPeriods={filterPeriods}
        selectedValue={selectedValue}
        handleChange={(e) => setSelectedValue(e.target.value)}
        handleAddMemo={handleAddMemo}
      />
      <DashboardSubContent
        memos={memos}
        selectedValue={selectedValue}
        selectedPeriod={selectedPeriod}
        selectedDate={selectedDate}
        checkedIds={checkedIds}
        handleToggle={handleToggle}
      />
    </div>
  );
}
