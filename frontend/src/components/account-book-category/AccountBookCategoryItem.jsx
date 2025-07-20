import { deleteAccountBookCategory } from "../../api/account-book-category";
import { useModal } from "../../context/ModalContext";
import { LoginExpiredError } from "../../util/error";

export function AccountBookCategoryItem({ category, reload }) {
  const { id, name, colorHex, isDefault } = category;
  const { openModal, openConfirm } = useModal();

  // 가계부 카테고리 삭제
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

  return (
    <div className="flex items-center justify-between flex-shrink-0 px-4 py-3 transition border rounded border-mapl-slate hover:bg-gray-50">
      <div className="flex items-center gap-3">
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
        <button className="cursor-pointer hover:text-green-900">수정</button>
      </div>
    </div>
  );
}
