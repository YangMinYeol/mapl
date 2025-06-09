import {
  faAngleRight,
  faAnglesRight,
  faAngleLeft,
  faAnglesLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Paging({ currentPage, totalPages, onPageChange }) {
  if (totalPages === 0) return null;

  const MAX_PAGES = 5;
  const startPage = Math.max(1, currentPage - Math.floor(MAX_PAGES / 2));
  const endPage = Math.min(totalPages, startPage + MAX_PAGES - 1);
  const pageNumbers = [];

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const totalButtons = pageNumbers.length + 4;
  const buttonWidth = 32;
  const totalWidth = buttonWidth * totalButtons;

  return (
    <div
      className="flex h-8 border divide-x border-mapl-slate divide-mapl-slate"
      style={{ width: `${totalWidth}px` }}
    >
      {/* 처음 페이지 */}
      <PageButton
        icon={faAnglesLeft}
        disabled={currentPage === 1}
        onClick={() => onPageChange(1)}
      />
      {/* 이전 페이지 */}
      <PageButton
        icon={faAngleLeft}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`flex items-center justify-center w-8 hover:bg-gray-100 hover:cursor-pointer
          ${currentPage === num && "bg-gray-100"}`}
        >
          {num}
        </button>
      ))}
      {/* 다음 페이지 */}
      <PageButton
        icon={faAngleRight}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
      {/* 마지막 페이지 */}
      <PageButton
        icon={faAnglesRight}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(totalPages)}
      />
    </div>
  );
}

function PageButton({ icon, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-8 hover:bg-gray-100 hover:cursor-pointer"
    >
      <FontAwesomeIcon icon={icon} size="xs" />
    </button>
  );
}
