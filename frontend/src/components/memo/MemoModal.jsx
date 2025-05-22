import Modal from "react-modal";
import Palette from "../common/Palette";
import DateTimeInput from "./DateTimeInput";
import { useContext, useEffect, useState } from "react";
import { baseModalStyle } from "../../styles/modalStyle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faSquare, faSquareCheck } from "@fortawesome/free-regular-svg-icons";
import { formatDateYYYYMMDD } from "../../util/dateUtil";
import { LoginExpiredError } from "../../util/error";
import { useLoginExpiredHandler } from "../../hooks/useLoginExpiredHandler";
import { useMemoModalForm } from "../../hooks/useMemoModalForm";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { addMemo, deleteLinkedMemos, updateMemo } from "../../api/memo";
import Loading from "../common/Loading";
import { MEMO_MODE } from "../../constants/memoMode";

const footerButtonClass =
  "h-8 px-3 font-semibold border rounded cursor-pointer";

export default function MemoModal({
  isOpen,
  onClose,
  selectedDate,
  mode,
  loadDashboardMemos,
  loadCalendarMemos,
  memo,
  selectedPeriod,
}) {
  const {
    allDay,
    setAllDay,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showStartDateSelect,
    setShowStartDateSelect,
    showEndDateSelect,
    setShowEndDateSelect,
    startTime,
    setStartTime,
    showStartTimeSelect,
    setShowStartTimeSelect,
    showEndTimeSelect,
    setShowEndTimeSelect,
    endTime,
    setEndTime,
    content,
    setContent,
    contentError,
    setContentError,
    dateTimeError,
    setDateTimeError,
    isPaletteOpen,
    setIsPaletteOpen,
    selectedColorId,
    setSelectedColorId,
    selectedColor,
    setSelectedColor,
  } = useMemoModalForm({ mode, memo, selectedDate, isOpen, selectedPeriod });

  const handleLoginExpired = useLoginExpiredHandler();
  const { openModal } = useModal();
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  // AllDay
  function handleAllDay() {
    if (!allDay) {
      setStartTime("00:00");
      setEndTime("00:30");
    }
    setAllDay(!allDay);
  }

  // 메모 추가
  async function addDetailMemo() {
    try {
      if (!validateAndCheckContent()) return;

      setIsLoading(true);

      await addMemo([
        {
          userId: user.id,
          content,
          startDate:
            selectedPeriod.name === "Bucket List"
              ? null
              : formatDateYYYYMMDD(startDate),
          endDate:
            selectedPeriod.name === "Bucket List"
              ? null
              : formatDateYYYYMMDD(endDate),
          startTime: allDay ? null : startTime,
          endTime: allDay ? null : endTime,
          allDay,
          periodId: selectedPeriod.id,
          isLinked: false,
          colorId: selectedColorId,
        },
      ]);
      await reloadAndClose();
    } catch (error) {
      handleMemoError(error, "add");
    } finally {
      setIsLoading(false);
    }
  }

  // 메모 수정
  async function editMemo() {
    try {
      if (!validateAndCheckContent()) return;

      setIsLoading(true);

      await updateMemo({
        id: memo.id,
        content,
        startDate:
          selectedPeriod.name === "Bucket List"
            ? null
            : formatDateYYYYMMDD(startDate),
        endDate:
          selectedPeriod.name === "Bucket List"
            ? null
            : formatDateYYYYMMDD(endDate),
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
        allDay,
        isLinked: memo.isLinked,
        link: memo.link,
        colorId: selectedColorId,
      });
      await reloadAndClose();
    } catch (error) {
      handleMemoError(error, "edit");
    } finally {
      setIsLoading(false);
    }
  }

  // 메모 삭제
  async function deleteMemo() {
    try {
      await deleteLinkedMemos(memo.link);
      await reloadAndClose();
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("메모 삭제 오류:", error);
        openModal(error.message);
      }
    }
  }

  // 날짜,시간 과 내용 유효성 검사
  function validateAndCheckContent() {
    const isDateTimeError = validateDateTime();
    const isContentBlank = content.trim() === "";

    setDateTimeError(!isDateTimeError);
    setContentError(isContentBlank);

    return isDateTimeError && !isContentBlank;
  }

  // 메모 목록 최신화 및 모달 닫기
  async function reloadAndClose() {
    await loadDashboardMemos();
    await loadCalendarMemos();
    closeModal();
  }

  // 메모 에러 처리
  function handleMemoError(error, context) {
    if (error instanceof LoginExpiredError) {
      closeModal();
      handleLoginExpired(error.message);
    } else {
      console.error(`메모 ${context === "add" ? "추가" : "편집"} 오류:`, error);
      closeModal();
      openModal(error.message);
    }
  }

  // 시작,끝 날짜 시간 유효성 검사
  function validateDateTime() {
    let start = new Date(startDate);
    let end = new Date(endDate);

    if (!allDay) {
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      start.setHours(startHour, startMin, 0, 0);
      end.setHours(endHour, endMin, 0, 0);
    }

    return start <= end;
  }

  // 모달 영역 클릭
  function handleModalClick() {
    if (isPaletteOpen) setIsPaletteOpen(false);
    if (showStartDateSelect) setShowStartDateSelect(false);
    if (showEndDateSelect) setShowEndDateSelect(false);
    if (showStartTimeSelect) setShowStartTimeSelect(false);
    if (showEndTimeSelect) setShowEndTimeSelect(false);
  }

  // 모달 닫기
  function closeModal() {
    setStartDate(selectedDate);
    setEndDate(selectedDate);
    setStartTime("00:00");
    setEndTime("00:30");
    setDateTimeError(false);
    setAllDay(true);
    setContent("");
    setContentError(false);
    onClose();
  }

  // 높이 설정
  const showDateInputs = selectedPeriod.name !== "Bucket List";
  const showAllDay = selectedPeriod.name === "Day";
  const showColor = selectedPeriod.name === "Day";
  let modalHeight = "h-[345px]";
  let contentHeight = "h-[250px]";
  if (!showDateInputs) {
    modalHeight = "h-[190px]";
    contentHeight = "h-[95px]";
  } else if (!showAllDay && !showColor) {
    modalHeight = "h-[270px]";
    contentHeight = "h-[175px]";
  }

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      style={baseModalStyle}
    >
      <div className={`w-[550px] ${modalHeight}`} onClick={handleModalClick}>
        {/* Header */}
        <div className="h-[46px] border-b modal-header border-mapl-slate flex justify-between items-center px-3">
          <div className="text-base">
            <span>메모</span>
          </div>
          <div>
            <button
              className="w-7 h-7 hover:cursor-pointer group"
              onClick={closeModal}
            >
              <FontAwesomeIcon
                icon={faXmark}
                size="lg"
                className="group-hover:text-green-900"
              />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${contentHeight} modal-content flex-col px-3`}>
          {/* 날짜/시간 */}
          {selectedPeriod.name !== "Bucket List" && (
            <div className="flex justify-between pb-3">
              <div className="w-[49%]">
                <div className="py-2">
                  <span>시작</span>
                </div>
                <DateTimeInput
                  showDateSelect={showStartDateSelect}
                  setShowDateSelect={setShowStartDateSelect}
                  date={startDate}
                  setDate={setStartDate}
                  showTimeSelect={showStartTimeSelect}
                  setShowTimeSelect={setShowStartTimeSelect}
                  time={startTime}
                  setTime={setStartTime}
                  allDay={allDay}
                  selectedPeriod={selectedPeriod}
                />
                <div className="px-1 text-red-500">
                  {dateTimeError && (
                    <span>날짜 또는 시간을 다시 확인해 주세요.</span>
                  )}
                </div>
              </div>
              <div className="w-[49%]">
                <div className="py-2">
                  <span>종료</span>
                </div>
                <DateTimeInput
                  showDateSelect={showEndDateSelect}
                  setShowDateSelect={setShowEndDateSelect}
                  date={endDate}
                  setDate={setEndDate}
                  showTimeSelect={showEndTimeSelect}
                  setShowTimeSelect={setShowEndTimeSelect}
                  time={endTime}
                  setTime={setEndTime}
                  allDay={allDay}
                  selectedPeriod={selectedPeriod}
                />
              </div>
            </div>
          )}

          {/* 하루종일 */}
          {selectedPeriod.name === "Day" && (
            <div className="flex items-center h-8 pb-3">
              <button
                className="w-[18px] h-[18px] hover:bg-mapl-slate flex items-center justify-center cursor-pointer rounded"
                onClick={handleAllDay}
              >
                <FontAwesomeIcon icon={allDay ? faSquareCheck : faSquare} />
              </button>
              <span>하루종일</span>
            </div>
          )}

          {/* 내용 */}
          <div className="pb-3">
            <div className="py-2">
              <span>내용</span>
            </div>
            <div>
              <input
                className="w-full px-1 border rounded outline-none border-mapl-black"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="px-1 text-red-500">
              {contentError && <span>메모 내용을 입력해주세요.</span>}
            </div>
          </div>

          {/* 색상 */}
          {selectedPeriod.name === "Day" && (
            <div className="flex items-center h-8 pb-3">
              <span>색상</span>
              <div className="flex items-center h-full ml-1 w-96">
                <div
                  className="w-4 h-4 mr-1 border rounded cursor-pointer"
                  style={{
                    backgroundColor: selectedColor,
                    borderColor: selectedColor,
                  }}
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                ></div>
                {isPaletteOpen && (
                  <Palette
                    setSelectedColorId={setSelectedColorId}
                    setSelectedColor={setSelectedColor}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-[46px] modal-footer border-mapl-slate px-3 flex items-center">
          <div className="flex-1">
            {mode === MEMO_MODE.EDIT && (
              <button
                className={`${footerButtonClass} bg-red-500 text-white`}
                onClick={deleteMemo}
              >
                삭제
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`${footerButtonClass} bg-deep-green text-white`}
              onClick={mode === MEMO_MODE.CREATE ? addDetailMemo : editMemo}
            >
              {mode === MEMO_MODE.CREATE ? "추가" : "수정"}
            </button>
            <button className={footerButtonClass} onClick={closeModal}>
              닫기
            </button>
          </div>
        </div>
      </div>
      {isLoading && <Loading />}
    </Modal>
  );
}
