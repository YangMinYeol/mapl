import { useContext, useState } from "react";
import { addMemo, deleteMemo, deleteLinkedMemos, updateMemo } from "../../api/memo";
import { UserContext } from "../../context/UserContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { useMemoModalForm } from "../../hooks/useMemoModalForm";
import ModalLayout from "../common/modal/ModalLayout";
import RecordActions from "../common/modal/RecordActions";
import { formatDateYYYYMMDD } from "../../util/dateUtil";
import { MEMO_MODAL_MODE } from "../../util/memoUtil";
import Palette from "../common/Palette";
import DateTimeInput from "./DateTimeInput";

export default function MemoModal({
  isOpen,
  onClose,
  selectedDate,
  mode,
  loadDashboardDatas,
  loadCalendarDatas,
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
    endTime,
    setEndTime,
    content,
    setContent,
    contentError,
    setContentError,
    dateTimeError,
    setDateTimeError,
    selectedColorId,
    setSelectedColorId,
  } = useMemoModalForm({ mode, memo, selectedDate, isOpen, selectedPeriod });

  const handleError = useErrorHandler(onClose);
  const { user } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);

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
            selectedPeriod.name === "Other"
              ? null
              : formatDateYYYYMMDD(startDate),
          endDate:
            selectedPeriod.name === "Other"
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
      handleError(error, { closeCurrentModal: true });
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
          selectedPeriod.name === "Other"
            ? null
            : formatDateYYYYMMDD(startDate),
        endDate:
          selectedPeriod.name === "Other" ? null : formatDateYYYYMMDD(endDate),
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
        allDay,
        isLinked: memo.isLinked,
        link: memo.link,
        colorId: selectedColorId,
      });
      await reloadAndClose();
    } catch (error) {
      handleError(error, { closeCurrentModal: true });
    } finally {
      setIsLoading(false);
    }
  }

  // 메모 삭제
  async function removeMemo() {
    try {
      setIsLoading(true);
      if (memo.isLinked) await deleteLinkedMemos(memo.link);
      else await deleteMemo(memo.id);
      await reloadAndClose();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
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
    await loadDashboardDatas();
    await loadCalendarDatas();
    onClose();
  }

  // 시작,끝 날짜 시간 유효성 검사
  function validateDateTime() {
    if (selectedPeriod.name === "Other") return true;
    const start = new Date(formatDateYYYYMMDD(startDate) + "T00:00");
    const end = new Date(formatDateYYYYMMDD(endDate) + "T00:00");

    if (!allDay) {
      if (!startTime || !endTime) return false;
      const [startHour, startMin] = startTime.split(":").map(Number);
      const [endHour, endMin] = endTime.split(":").map(Number);
      start.setHours(startHour, startMin, 0, 0);
      end.setHours(endHour, endMin, 0, 0);
    }

    return start <= end;
  }

  const isEdit = mode === MEMO_MODAL_MODE.EDIT;
  const isDay = selectedPeriod.name === "Day";

  return (
    <ModalLayout
      record
      title="메모"
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isLoading}
      content={
        <div className="record-fields">
          {selectedPeriod.name !== "Other" && (
            <section className="record-schedule" aria-label="일정">
              <div className="record-field-heading">
                <h3>일정</h3>
                {isDay && (
                  <label className="record-switch">
                    하루 종일
                    <input type="checkbox" checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />
                  </label>
                )}
              </div>
              <div className="record-date-pair">
                <DateTimeInput
                  label="시작일"
                  showDateSelect={showStartDateSelect}
                  setShowDateSelect={setShowStartDateSelect}
                  date={startDate}
                  setDate={setStartDate}
                  time={startTime}
                  setTime={setStartTime}
                  allDay={allDay}
                  selectedPeriod={selectedPeriod}
                />
                <DateTimeInput
                  label="종료일"
                  showDateSelect={showEndDateSelect}
                  setShowDateSelect={setShowEndDateSelect}
                  date={endDate}
                  setDate={setEndDate}
                  time={endTime}
                  setTime={setEndTime}
                  allDay={allDay}
                  selectedPeriod={selectedPeriod}
                />
              </div>
              {dateTimeError && <p className="record-error" role="alert">날짜 또는 시간을 다시 확인해 주세요.</p>}
            </section>
          )}
          <div className="record-field">
            <div className="record-field-heading">
              <label htmlFor="memo-content">메모 내용</label>
              <span className="record-counter">{content.length} / 100</span>
            </div>
            <textarea
              id="memo-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={100}
              placeholder="메모를 입력하세요"
              aria-invalid={contentError}
              aria-describedby={contentError ? "memo-content-error" : undefined}
            />
            {contentError && <p className="record-error" id="memo-content-error" role="alert">메모 내용을 입력해 주세요.</p>}
          </div>
          {isDay && (
            <fieldset className="record-field">
              <legend>달력 표시 색상</legend>
              <Palette selectedColorId={selectedColorId} setSelectedColorId={setSelectedColorId} />
            </fieldset>
          )}

        </div>
      }
      footer={
        <RecordActions
          onDelete={isEdit ? removeMemo : undefined}
          onClose={onClose}
          onSave={isEdit ? editMemo : addDetailMemo}
          disabled={isLoading}
        />
      }
    />
  );
}
