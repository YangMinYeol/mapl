import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function CategoryOrderRow({ category, amount, share, color, onEdit }) {
  const roundedShare = Math.round(share);
  const shareLabel = share > 0 && roundedShare === 0 ? "<1%" : `${roundedShare}%`;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });
  return (
    <li ref={setNodeRef} className="category-order-row" data-dragging={isDragging} style={{ transform: isDragging ? undefined : CSS.Transform.toString(transform), transition }}>
      <button type="button" className="category-grip" ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`${category.name} 끌어서 이동`}>
        <span className="category-grip-dots" aria-hidden="true" />
      </button>
      <button type="button" className="report-edit" onClick={onEdit} aria-label={`${category.name} 편집`}>
        <i className="report-chip" style={{ backgroundColor: color }} aria-hidden="true" />
        <b className="report-label">{category.name}</b>
        {amount === null ? <small className="report-values">—</small> : (
          <span className="report-values">
            <strong>{amount.toLocaleString("ko-KR")}원</strong>
            <small>({shareLabel})</small>
          </span>
        )}
        <span className="report-bar" aria-hidden="true"><i style={{ width: `${share}%`, backgroundColor: color }} /></span>
      </button>
    </li>
  );
}
