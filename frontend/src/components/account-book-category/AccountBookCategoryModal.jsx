import { useContext, useEffect, useId, useState } from "react";
import {
  addAccountBookCategory,
  updateAccountBookCategory,
} from "../../api/account-book-category";
import { UserContext } from "../../context/UserContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { ACCOUNTBOOK_MODAL_MODE } from "../../util/accountBookUtil";
import { DEFAULT_COLOR_ID } from "../../util/util";
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
  const nameId = useId();
  const { user } = useContext(UserContext);
  const [selectedColorId, setSelectedColorId] = useState(DEFAULT_COLOR_ID);
  const [categoryName, setCategoryName] = useState("");
  const [isCategoryNameError, setIsCategoryNameError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = mode === ACCOUNTBOOK_MODAL_MODE.EDIT;
  const handleError = useErrorHandler(closeModal);

  useEffect(() => {
    if (isOpen && isEdit && selectedItem) {
      setCategoryName(selectedItem.name);
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

  // 폼 초기화
  const resetForm = () => {
    setCategoryName("");
    setSelectedColorId(DEFAULT_COLOR_ID);
    setIsCategoryNameError(false);
  };

  // 모달 닫기
  function closeModal() {
    resetForm();
    onClose();
  }

  const content = (
    <div className="record-fields">
      <div className="record-field">
        <label htmlFor={nameId}>카테고리명</label>
        <input
          id={nameId}
          value={categoryName}
          onChange={(event) => {
            setCategoryName(event.target.value);
            setIsCategoryNameError(false);
          }}
          maxLength={20}
          aria-invalid={isCategoryNameError || undefined}
          aria-describedby={isCategoryNameError ? `${nameId}-error` : undefined}
        />
        {isCategoryNameError && <p className="record-error" id={`${nameId}-error`} role="alert">카테고리명을 입력해 주세요.</p>}
      </div>
      <fieldset className="record-field">
        <legend>색상</legend>
        <Palette selectedColorId={selectedColorId} setSelectedColorId={setSelectedColorId} />
      </fieldset>
    </div>
  );

  const footer = (
    <div className="record-actions">
      <button type="button" className="record-cancel" onClick={closeModal}>닫기</button>
      <button type="button" className="mapl-button" disabled={isLoading} onClick={isEdit ? updateCategory : addNewCategory}>
        {isEdit ? "수정" : "추가"}
      </button>
    </div>
  );

  return (
    <ModalLayout
      title={title}
      isOpen={isOpen}
      onClose={closeModal}
      content={content}
      footer={footer}
      isLoading={isLoading}
    />
  );
}
