import { useContext, useEffect, useState } from "react";
import {
  addAccountBookCategory,
  updateAccountBookCategory,
} from "../../api/account-book-category";
import { useColors } from "../../context/ColorContext";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { ACCOUNTBOOK_MODAL_MODE } from "../../util/accountBookUtil";
import { DEFAULT_COLOR, DEFAULT_COLOR_ID } from "../../util/util";
import Palette from "../common/Palette";
import ModalLayout from "../common/modal/ModalLayout";

export default function AccountBookCategoryModal({
  title,
  isOpen,
  onClose,
  mode,
  type,
  onSuccess,
  selectedItem,
}) {
  const colors = useColors();
  const { user } = useContext(UserContext);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState(DEFAULT_COLOR_ID);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [categoryName, setCategoryName] = useState("");
  const [isCategoryNameError, setIsCategoryNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = mode === ACCOUNTBOOK_MODAL_MODE.EDIT;
  const handleError = useErrorHandler(closeModal);

  useEffect(() => {
    if (isOpen && isEdit && selectedItem) {
      setCategoryName(selectedItem.name);
      setSelectedColor(selectedItem.colorHex);
      setSelectedColorId(selectedItem.colorId);
    }
  }, [isOpen, isEdit, selectedItem]);

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
      await onSuccess();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  // 가계부 카테고리 항목 수정
  async function updateCategory() {
    try {
      if (categoryName.trim() === "") {
        setIsCategoryNameError(true);
        return;
      }
      setIsLoading(true);
      await updateAccountBookCategory({
        id: selectedItem.id,
        name: categoryName,
        colorId: selectedColorId,
      });
      await onSuccess();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
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
    setSelectedColorId(DEFAULT_COLOR_ID);
    setIsCategoryNameError(false);
  };

  // 모달 닫기
  function closeModal() {
    resetForm();
    onClose();
  }

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
        <div className="flex items-center py-2">
          <span className="whitespace-nowrap">색상</span>
          <div className="flex flex-wrap items-center gap-1 ml-1 min-w-0">
            <div
              className="w-4 h-4 mr-1 border rounded cursor-pointer"
              style={{
                backgroundColor: colors.find(({ id }) => id === selectedColorId)?.hex ?? selectedColor,
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
          onClick={isEdit ? updateCategory : addNewCategory}
        >
          {isEdit ? "수정" : "추가"}
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
      handleModalClick={handleModalClick}
      content={content}
      footer={footer}
      isLoading={isLoading}
    />
  );
}
