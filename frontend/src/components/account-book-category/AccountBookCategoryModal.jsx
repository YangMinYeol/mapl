import { useContext, useState } from "react";
import { addAccountBookCategory } from "../../api/account-book-category";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { ACCOUNTBOOK_MODAL_MODE } from "../../util/accountBookUtil";
import { LoginExpiredError } from "../../util/error";
import Palette from "../common/Palette";
import ModalLayout from "../common/modal/ModalLayout";
import { DEFAULT_COLOR } from "../../util/util";

export default function AccountBookCategoryModal({
  title,
  isOpen,
  onClose,
  mode,
  type,
  onSuccess,
}) {
  const modalSize = { width: "w-[350px]", height: "h-[210px]" };
  const { user } = useContext(UserContext);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState(10);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [categoryName, setCategoryName] = useState("");
  const [isCategoryNameError, setIsCategoryNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useModal();

  // 가계부 카테고리 항목 추가
  async function addNewCategory() {
    try {
      if (categoryName.trim() === "") {
        setIsCategoryNameError(true);
        return;
      }
      setIsLoading(true);
      await addAccountBookCategory({
        userId: user.id,
        name: categoryName,
        type: type,
        colorId: selectedColorId,
      });
    } catch (error) {
      handleAccountBookCategoryError(error, ACCOUNTBOOK_MODAL_MODE.ADD);
    } finally {
      setIsLoading(false);
      onSuccess();
      closeModal();
    }
  }

  // 가계부 항목 에러 처리
  function handleAccountBookCategoryError(error, context) {
    if (error instanceof LoginExpiredError) {
      closeModal();
      handleLoginExpired(error.message);
    } else {
      console.error(
        `가계부 카테고리 ${
          context === ACCOUNTBOOK_MODAL_MODE.ADD ? "추가" : "수정"
        } 오류:`,
        error
      );
      closeModal();
      openModal(error.message);
    }
  }

  // 모달 클릭
  function handleModalClick() {
    if (isPaletteOpen) setIsPaletteOpen(false);
  }

  // 폼 초기화
  const resetForm = () => {
    setCategoryName("");
    setSelectedColor(DEFAULT_COLOR);
    setSelectedColorId(10);
    setIsCategoryNameError(false);
  };

  // 모달 닫기
  const closeModal = () => {
    resetForm();
    onClose();
  };

  const content = (
    <div>
      <div>
        <div className="py-2">
          <span>카테고리명</span>
        </div>
        <div>
          <input
            className="w-full px-1 border rounded outline-none border-mapl-black"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            maxLength={20}
          />
        </div>
        <div className="text-red-500">
          <span className={isCategoryNameError ? "visible" : "invisible"}>
            카테고리명을 입력해 주세요.
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center h-8 py-2">
          <span className="whitespace-nowrap">색상</span>
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
      </div>
    </div>
  );

  const footerButtonClass =
    "h-8 px-3 font-semibold border rounded cursor-pointer";

  const footer = (
    <div className="flex items-center w-full">
      <div className="flex-1"></div>

      <div className="flex items-center gap-2">
        <button
          className={`${footerButtonClass} bg-deep-green text-white`}
          onClick={addNewCategory}
        >
          {mode === ACCOUNTBOOK_MODAL_MODE.ADD ? "추가" : "수정"}
        </button>
        <button className={footerButtonClass} onClick={closeModal}>
          닫기
        </button>
      </div>
    </div>
  );

  return (
    <ModalLayout
      title={title}
      isOpen={isOpen}
      onClose={closeModal}
      modalSize={modalSize}
      handleModalClick={handleModalClick}
      content={content}
      footer={footer}
      isLoading={isLoading}
    />
  );
}
