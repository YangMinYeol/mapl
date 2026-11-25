import { useContext, useEffect, useId, useState } from "react";
import {
  addAccountBookCategory,
  deleteAccountBookCategory,
  updateAccountBookCategory,
} from "../../api/account-book-category";
import { UserContext } from "../../context/UserContext";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { ACCOUNTBOOK_MODAL_MODE } from "../../util/accountBookUtil";
import { DEFAULT_COLOR_ID } from "../../util/util";
import Palette from "../common/Palette";
import { useColors } from "../../context/ColorContext";
import ModalLayout from "../common/modal/ModalLayout";
import RecordActions from "../common/modal/RecordActions";
import { useModal } from "../../context/ModalContext";

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
  const { openConfirm } = useModal();
  const colors = useColors();
  const [selectedColorId, setSelectedColorId] = useState(DEFAULT_COLOR_ID);
  const selectedColor = colors.find(color => color.id === selectedColorId)?.hex;
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

  async function saveCategory() {
    if (categoryName.trim() === "") {
      setIsCategoryNameError(true);
      return;
    }

    const fields = { name: categoryName, colorId: selectedColorId };
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateAccountBookCategory({ id: selectedItem.id, ...fields });
      } else {
        await addAccountBookCategory({ userId: user.id, type, ...fields });
      }
      await onSuccess();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  function closeModal() {
    setCategoryName("");
    setSelectedColorId(DEFAULT_COLOR_ID);
    setIsCategoryNameError(false);
    onClose();
  }

  const content = (
    <div className="record-fields">
      <div className="record-field">
        <label htmlFor={nameId}>이름</label>
        <input
          id={nameId}
          placeholder="카테고리 이름"
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
        <legend>표시 색상</legend>
        <Palette selectedColorId={selectedColorId} setSelectedColorId={setSelectedColorId} />
      </fieldset>
      <div className="category-tag-preview">
        <small>달력 태그 미리보기</small>
        <span style={{ backgroundColor: selectedColor }}>{categoryName.trim() || "카테고리"}</span>
      </div>
    </div>
  );

  const footer = (
    <RecordActions
      onDelete={isEdit && selectedItem && !selectedItem.isDefault ? () => {
          openConfirm("카테고리를 삭제할까요?", "이 분류의 거래는 같은 유형의 기본 카테고리로 이동합니다.", async () => {
            try {
              await deleteAccountBookCategory(user.id, type, selectedItem.id);
              closeModal();
              await onSuccess();
            } catch (error) {
              handleError(error);
            }
          });
      } : undefined}
      onClose={closeModal}
      onSave={saveCategory}
      disabled={isLoading}
      saveLabel={isEdit ? "저장" : "추가"}
    />
  );

  return (
    <ModalLayout
      className="category-editor"
      title={title}
      isOpen={isOpen}
      onClose={closeModal}
      content={content}
      footer={footer}
      isLoading={isLoading}
    />
  );
}
