import { useState } from "react";
import { generateAccountBookTagMap } from "../../util/accountBookTagUtil";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
} from "../../util/accountBookUtil";
import {
  getWeekDates,
  handleDateClick,
} from "../../util/calendarUtil";
import AccountBookModal from "../account-book/AccountBookModal";
import AccountBookTag from "./AccountBookTag";
import CalendarDate from "./CalendarDate";

export default function AccountBookCalendarDate({
  holidays,
  currentDate,
  selectedDate,
  setSelectedDate,
  calendarDatas,
  loadDashboardDatas,
  loadCalendarDatas,
  periods,
  tagMaxCount,
  onTagCapacityChange,
  setSelectedPeriod,
}) {
  const weeks = getWeekDates(currentDate);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tagMap = generateAccountBookTagMap(
    weeks,
    calendarDatas,
    holidays,
    tagMaxCount
  );

  function handleTagClick(tag) {
    const type = tag.type;
    if (type !== ACCOUNT_TYPE.EXPENSE && type !== ACCOUNT_TYPE.INCOME) return;
    setSelectedItem(tag);
    setIsModalOpen(true);
  }

  return (
    <CalendarDate
      weeks={weeks}
      selectedDate={selectedDate}
      currentDate={currentDate}
      holidays={holidays}
      tagMap={tagMap}
      tagMaxCount={tagMaxCount}
      onTagCapacityChange={onTagCapacityChange}
      onDateClick={(date) =>
        handleDateClick(date, setSelectedDate, setSelectedPeriod, periods)
      }
      onTagClick={handleTagClick}
      TagComponent={AccountBookTag}
      ModalComponent={AccountBookModal}
      modalProps={{
        selectedDate,
        item: selectedItem,
        mode: ACCOUNTBOOK_MODAL_MODE.EDIT,
        loadDashboardDatas,
        loadCalendarDatas,
      }}
      isModalOpen={isModalOpen}
      closeModal={() => {
        setSelectedItem(null);
        setIsModalOpen(false);
      }}
    />
  );
}
