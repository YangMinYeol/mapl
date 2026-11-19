import { faCalendar, faClock } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MiniCalendar from "../calendar/mini/MiniCalendar";
import Dropdown from "../common/Dropdown";
import { formatTimeTo12Hour } from "../../util/timeUtil";

const padTime = (value) => String(value).padStart(2, "0");
const hours = Array.from({ length: 12 }, (_, index) => index + 1);
const minutes = Array.from({ length: 12 }, (_, index) => index * 5);

export default function DateTimeInput({
  label, date, setDate, time, setTime, allDay, selectedPeriod,
  showDateSelect, setShowDateSelect, hideLabel = false,
}) {
  const trigger = useRef(null);
  const timeTrigger = useRef(null);
  const popupId = useId();
  const timePopupId = useId();
  const [dialog, setDialog] = useState(null);
  const [timeOpen, setTimeOpen] = useState(false);
  const canSelectDate = !selectedPeriod || selectedPeriod.name === "Day";
  const dateDisplay = (
    <>
      <FontAwesomeIcon icon={faCalendar} />
      {date && format(date, "yyyy.MM.dd")}
    </>
  );

  return (
    <div className="record-field record-date-field">
      {!hideLabel && <span className="record-date-label">{label}</span>}
      <div className="record-date-controls">
        {canSelectDate ? (
          <button type="button" className="record-date-value" aria-label={`${label} 날짜 선택`}
            ref={trigger} aria-expanded={showDateSelect} aria-haspopup="dialog"
            aria-controls={showDateSelect ? popupId : undefined}
            onClick={(event) => {
              setDialog(event.currentTarget.closest(".planner-record-dialog"));
              setShowDateSelect(!showDateSelect);
            }}>
            {dateDisplay}
          </button>
        ) : <span className="record-date-value">{dateDisplay}</span>}
        {!allDay && (
          <button
            type="button"
            className="record-date-value"
            ref={timeTrigger}
            aria-label={`${label} 시간 선택 ${formatTimeTo12Hour(time)}`}
            aria-expanded={timeOpen}
            aria-haspopup="dialog"
            aria-controls={timeOpen ? timePopupId : undefined}
            onClick={(event) => {
              setDialog(event.currentTarget.closest(".planner-record-dialog"));
              setTimeOpen(!timeOpen);
            }}
          >
            <FontAwesomeIcon icon={faClock} />
            {formatTimeTo12Hour(time) || "시간 선택"}
          </button>
        )}
      </div>
      {canSelectDate && showDateSelect && dialog && createPortal(
        <PickerPopup id={popupId} label={`${label} 달력`} trigger={trigger}
          onClose={() => {
            setShowDateSelect(false);
            trigger.current?.focus({ preventScroll: true });
          }}
          onDismiss={setShowDateSelect}
        >
          <MiniCalendar date={date} setDate={(nextDate) => {
            setDate(nextDate);
            setShowDateSelect(false);
            trigger.current?.focus({ preventScroll: true });
          }} />
        </PickerPopup>,
        dialog
      )}
      {!allDay && timeOpen && dialog && createPortal(
        <PickerPopup id={timePopupId} label={`${label} 시간`} trigger={timeTrigger}
          onClose={() => {
            setTimeOpen(false);
            timeTrigger.current?.focus({ preventScroll: true });
          }}
          onDismiss={setTimeOpen}
        >
          <TimeFields time={time} setTime={setTime} onDone={() => {
            setTimeOpen(false);
            timeTrigger.current?.focus({ preventScroll: true });
          }} />
        </PickerPopup>,
        dialog
      )}
    </div>
  );
}

function TimeFields({ time, setTime, onDone }) {
  const [hour24, minute] = (time || "12:00").split(":").map(Number);
  const hour = hour24 % 12 || 12;
  const afternoon = hour24 >= 12;
  const minuteOptions = minutes.includes(minute) ? minutes : [...minutes, minute].sort((a, b) => a - b);

  function update(nextHour, nextMinute, nextAfternoon) {
    setTime(`${padTime(nextHour % 12 + (nextAfternoon ? 12 : 0))}:${padTime(nextMinute)}`);
  }

  return (
    <div className="record-time-picker">
      <div className="record-time-parts">
        <Dropdown className="mapl-dropdown--form" aria-label="오전 또는 오후"
          value={afternoon ? "pm" : "am"} onChange={(event) => update(hour, minute, event.target.value === "pm")}>
          <option value="am">오전</option>
          <option value="pm">오후</option>
        </Dropdown>
        <Dropdown className="mapl-dropdown--form" aria-label="시"
          value={hour} onChange={(event) => update(Number(event.target.value), minute, afternoon)}>
          {hours.map((value) => <option key={value} value={value}>{value}시</option>)}
        </Dropdown>
        <Dropdown className="mapl-dropdown--form" aria-label="분"
          value={minute} onChange={(event) => update(hour, Number(event.target.value), afternoon)}>
          {minuteOptions.map((value) => <option key={value} value={value}>{padTime(value)}분</option>)}
        </Dropdown>
      </div>
      <button type="button" className="record-time-done" onClick={onDone}>완료</button>
    </div>
  );
}

function PickerPopup({ id, label, trigger, children, onClose, onDismiss }) {
  const popup = useRef(null);

  useLayoutEffect(() => {
    const element = popup.current;
    function position() {
      if (!trigger.current) return;
      const anchor = trigger.current.getBoundingClientRect();
      const { width, height } = element.getBoundingClientRect();
      const { clientWidth, clientHeight } = document.documentElement;
      const gap = 6;
      const margin = 8;
      const below = anchor.bottom + gap;
      const above = anchor.top - height - gap;
      const top = below + height <= clientHeight - margin || above < margin ? below : above;
      element.style.left = `${Math.max(margin, Math.min(anchor.left, clientWidth - width - margin))}px`;
      element.style.top = `${Math.max(margin, Math.min(top, clientHeight - height - margin))}px`;
    }

    position();
    (element.querySelector('[aria-pressed="true"], select') ?? element).focus({ preventScroll: true });
    const observer = new ResizeObserver(position);
    observer.observe(element);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [trigger]);

  useEffect(() => {
    function dismissOutside(event) {
      if (!popup.current?.contains(event.target) && !trigger.current?.contains(event.target)) {
        onDismiss(false);
      }
    }

    document.addEventListener("pointerdown", dismissOutside);
    document.addEventListener("focusin", dismissOutside);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside);
      document.removeEventListener("focusin", dismissOutside);
    };
  }, [onDismiss, trigger]);

  return (
    <div id={id} ref={popup} className="record-date-popup" role="dialog" tabIndex={-1}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}>
      {children}
    </div>
  );
}
