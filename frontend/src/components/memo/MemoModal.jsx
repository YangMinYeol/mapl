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
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { addMemo, updateMemo } from "../../api/memo";
import Loading from "../common/Loading";
import { useColors } from "../../context/ColorContext";

export default function MemoModal({
  isOpen,
  onClose,
  selectedDate,
  mode,
  loadDashboardMemos,
  loadCalendarMemos,
  memo,
  periodId,
}) {
  const [allDay, setAllDay] = useState(true);
  const handleLoginExpired = useLoginExpiredHandler();
  const { openModal } = useModal();
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

  // 팔레트
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState(10);
  const [selectedColor, setSelectedColor] = useState("#173836");
  const colors = useColors();

  // 날짜
  const [showStartDateSelect, setShowStartDateSelect] = useState(false);
  const [showEndDateSelect, setShowEndDateSelect] = useState(false);
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);

  // 시간
  const [showStartTimeSelect, setShowStartTimeSelect] = useState(false);
  const [showEndTimeSelect, setShowEndTimeSelect] = useState(false);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:30");

  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState(false);
  const [dateTimeError, setDateTimeError] = useState(false);

  useEffect(() => {
    Modal.setAppElement("#root");
  }, []);

  useEffect(() => {
    if (mode === "create") {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
      setStartTime("00:00");
      setEndTime("00:30");
      setAllDay(true);
      setContent("");
      setSelectedColorId(10);
      setSelectedColor("#173836");
    } else if (mode === "edit" && memo) {
      setStartDate(memo.startDate);
      setEndDate(memo.endDate);
      setStartTime((memo.startTime || "00:00").substring(0, 5));
      setEndTime((memo.endTime || "00:30").substring(0, 5));
      setAllDay(memo.allday);
      setContent(memo.content);
      setSelectedColorId(memo.colorId);
      const selectedColor = colors.find((color) => color.id === memo.colorId);
      if (selectedColor) {
        setSelectedColor(selectedColor.hex);
      }
    }
  }, [mode, isOpen]);

  // Palette
  function handlePalette() {
    setIsPaletteOpen(!isPaletteOpen);
  }

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
      setIsLoading(true);

      const isDateTimeError = validateDateTime();
      const isContentBlank = content.trim() === "";

      setDateTimeError(!isDateTimeError);
      setContentError(isContentBlank);

      if (!isDateTimeError || isContentBlank) return;

      await addMemo([
        {
          userId: user.id,
          content,
          startDate: formatDateYYYYMMDD(startDate),
          endDate: formatDateYYYYMMDD(endDate),
          startTime,
          endTime,
          allDay,
          periodId,
          isLinked: false,
          colorId: selectedColorId,
        },
      ]);
      await loadDashboardMemos();
      await loadCalendarMemos();
      closeModal();
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        closeModal();
        handleLoginExpired(error.message);
      } else {
        console.error("메모 추가 오류:", error);
        closeModal();
        openModal(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // 메모 수정
  async function editMemo() {
    try {
      const isDateTimeError = validateDateTime();
      const isContentBlank = content.trim() === "";

      setDateTimeError(!isDateTimeError);
      setContentError(isContentBlank);

      if (!isDateTimeError || isContentBlank) return;
      setIsLoading(true);
      await updateMemo({
        id: memo.id,
        content,
        startDate: formatDateYYYYMMDD(startDate),
        endDate: formatDateYYYYMMDD(endDate),
        startTime,
        endTime,
        allDay,
        colorId: selectedColorId,
      });
      await loadDashboardMemos();
      await loadCalendarMemos();
      closeModal();
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        closeModal();
        handleLoginExpired(error.message);
      } else {
        console.error("메모 편집 오류:", error);
        closeModal();
        openModal(error.message);
      }
    } finally {
      setIsLoading(false);
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

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      style={baseModalStyle}
    >
      <div className="w-[550px] h-[345px]" onClick={handleModalClick}>
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
        <div className="h-[250px] modal-content flex-col px-3">
          {/* 날짜/시간 */}
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
              />
            </div>
          </div>

          {/* 하루종일 */}
          <div className="flex items-center h-8 pb-3">
            <button
              className="w-[18px] h-[18px] hover:bg-mapl-slate flex items-center justify-center cursor-pointer rounded"
              onClick={handleAllDay}
            >
              <FontAwesomeIcon icon={allDay ? faSquareCheck : faSquare} />
            </button>
            <span>하루종일</span>
          </div>

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
              />
            </div>
            <div className="px-1 text-red-500">
              {contentError && <span>메모 내용을 입력해주세요.</span>}
            </div>
          </div>

          {/* 색상 */}
          <div className="flex items-center h-8 pb-3">
            <span>색상</span>
            <div className="flex items-center h-full ml-1 w-96">
              <div
                className="w-4 h-4 mr-1 border rounded cursor-pointer"
                style={{
                  backgroundColor: selectedColor,
                  borderColor: selectedColor,
                }}
                onClick={handlePalette}
              ></div>
              {isPaletteOpen && (
                <Palette
                  setSelectedColorId={setSelectedColorId}
                  setSelectedColor={setSelectedColor}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[46px]  modal-footer border-mapl-slate px-3 flex items-center justify-end">
          <button
            className="h-8 px-3 font-semibold text-white border rounded cursor-pointer bg-deep-green"
            onClick={mode === "create" ? addDetailMemo : editMemo}
          >
            {mode === "create" ? "추가" : "수정"}
          </button>
          <button
            className="h-8 px-3 ml-2 font-semibold border rounded cursor-pointer"
            onClick={closeModal}
          >
            닫기
          </button>
        </div>
      </div>
      {isLoading && <Loading />}
    </Modal>
  );
}
