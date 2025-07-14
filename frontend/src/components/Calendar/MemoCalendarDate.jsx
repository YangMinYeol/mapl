import { useState } from "react";
import { LINKED_MEMO } from "../../constants/messages";
import { TAG_TYPE } from "../../constants/tag";
import { useModal } from "../../context/ModalContext";
import useHolidayData from "../../hooks/useHolidayData";
import {
  getTagMaxCount,
  getWeekDates,
  handleDateClick,
} from "../../util/calendarUtil";
import { buildMemoLevelMap } from "../../util/memoTagUtil";
import { MEMO_MODAL_MODE } from "../../util/memoUtil";
import Loading from "../common/Loading";
import MemoModal from "../memo/MemoModal";
import CalendarDate from "./CalendarDate";
import MemoTag from "./MemoTag";

export default function MemoCalendarDate({
  currentDate,
  selectedDate,
  setSelectedDate,
  calendarDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  periods,
  setSelectedPeriod,
}) {
  const weeks = getWeekDates(currentDate);
  const tagMaxCount = getTagMaxCount(weeks);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { openConfirm } = useModal();

  const { holidays, isLoading } = useHolidayData(currentDate);
  const tagMap = buildMemoLevelMap(weeks, calendarDatas, tagMaxCount, holidays);

  function handleTagClick(memo) {
    if (memo.type === TAG_TYPE.MORE || memo.type === TAG_TYPE.HOLIDAY) return;

    if (memo.isLinked) {
      openConfirm(LINKED_MEMO.TITLE, LINKED_MEMO.EDIT_CONFIRM, () => {
        setSelectedItem(memo);
        setIsModalOpen(true);
      });
    } else {
      setSelectedItem(memo);
      setIsModalOpen(true);
    }
  }

  if (isLoading) return <Loading />;

  return (
    <CalendarDate
      weeks={weeks}
      selectedDate={selectedDate}
      currentDate={currentDate}
      holidays={holidays}
      tagMap={tagMap}
      tagMaxCount={tagMaxCount}
      onDateClick={(date) =>
        handleDateClick(date, setSelectedDate, setSelectedPeriod, periods)
      }
      onTagClick={handleTagClick}
      TagComponent={MemoTag}
      ModalComponent={MemoModal}
      modalProps={{
        selectedDate,
        memo: selectedItem,
        mode: MEMO_MODAL_MODE.EDIT,
        loadDashboardDatas,
        loadCalendarDatas,
        selectedPeriod: periods[0],
      }}
      isModalOpen={isModalOpen}
      closeModal={() => {
        setSelectedItem(null);
        setIsModalOpen(false);
      }}
    />
  );
}
