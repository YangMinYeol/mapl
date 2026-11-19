export default function RecordActions({ onDelete, onClose, onSave, disabled }) {
  return (
    <div className="record-actions">
      {onDelete && (
        <button className="record-delete" onClick={onDelete}>
          삭제
        </button>
      )}
      <button className="record-cancel" onClick={onClose}>취소</button>
      <button className="record-save" onClick={onSave} disabled={disabled}>
        저장
      </button>
    </div>
  );
}
