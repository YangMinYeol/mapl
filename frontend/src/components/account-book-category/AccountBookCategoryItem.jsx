import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteAccountBookCategory } from "../../api/account-book-category";
import { useModal } from "../../context/ModalContext";
import { ACCOUNTBOOK_MODAL_MODE } from "../../util/accountBookUtil";
import { LoginExpiredError } from "../../util/error";

export function AccountBookCategoryItem({
  category,
  reload,
  setIsModalOpen,
  setMode,
  setSelectedItem,
  dragOverlay = false,
}) {
  const { id, name, colorHex, isDefault } = category;
  const { openModal, openConfirm } = useModal();

  // 드래그 중 오버레이 아이템일 때는 useSortable 훅 사용하지 않음
  if (dragOverlay) {
    return (
      <div
        className="flex items-center justify-between flex-shrink-0 px-4 py-3 bg-white border rounded shadow-lg border-mapl-slate cursor-grabbing"
        style={{ userSelect: "none" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 rounded"
            style={{ backgroundColor: colorHex }}
          />
          <span className="text-base whitespace-nowrap">{name}</span>
        </div>
      </div>
    );
  }

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition: transition ?? undefined,
  };

  const deleteCategory = () => {
    openConfirm(
      "정말로 삭제하시겠습니까?",
      "삭제한 항목은 다시 되돌릴 수 없습니다.",
      async () => {
        try {
          await deleteAccountBookCategory(id);
          reload();
        } catch (error) {
          if (error instanceof LoginExpiredError) {
            handleLoginExpired(error.message);
          } else {
            console.error("가계부 카테고리 항목 삭제 오류:", error);
            openModal(error.message);
          }
        }
      }
    );
  };

  // 가계부 카테고리 수정
  const openEditModal = () => {
    setSelectedItem(category);
    setMode(ACCOUNTBOOK_MODAL_MODE.EDIT);
    setIsModalOpen(true);
  };

  return (
    <div
      className="flex items-center justify-between flex-shrink-0 px-3 py-3 transition border rounded border-mapl-slate hover:bg-gray-50"
      ref={setNodeRef}
      style={style}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-5 h-5 cursor-grab"
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </div>
      <div className="flex items-center w-full gap-3 ml-3">
        <div
          className="w-5 h-5 rounded"
          style={{ backgroundColor: colorHex }}
        />
        <span className="text-base whitespace-nowrap">{name}</span>
      </div>

      <div className="flex gap-3 text-sm text-gray-500 whitespace-nowrap">
        {!isDefault && (
          <>
            <button
              className="cursor-pointer hover:text-green-900"
              onClick={deleteCategory}
            >
              삭제
            </button>
            <span>|</span>
          </>
        )}
        <button
          className="cursor-pointer hover:text-green-900"
          onClick={openEditModal}
        >
          수정
        </button>
      </div>
    </div>
  );
}
