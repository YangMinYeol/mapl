import { useContext } from "react";
import {
  addAccountBookItem,
  deleteAccountBookItem,
  editAccountBookItem,
} from "../../api/account-book";
import { UserContext } from "../../context/UserContext";
import { useAccountBookModalForm } from "../../hooks/useAccountBookModalForm";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import useAssetStore from "../../stores/useAssetStore";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
  ACCOUNT_TYPE_FILTER,
} from "../../util/accountBookUtil";
import { combineDateAndTime, formatDateYYYYMMDD } from "../../util/dateUtil";
import RecordActions from "../common/modal/RecordActions";
import Dropdown from "../common/Dropdown";
import ModalLayout from "../common/modal/ModalLayout";
import DateTimeInput from "../memo/DateTimeInput";

const MAX_AMOUNT = 100000000;


export default function AccountBookModal({
  isOpen,
  onClose,
  mode,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
  item,
}) {
  const {
    type,
    setType,
    date,
    setDate,
    time,
    setTime,
    hasTime,
    setHasTime,
    category,
    setCategoryId,
    content,
    setContent,
    amount,
    setAmount,
    isAmountError,
    setIsAmountError,
    showDateSelect,
    setShowDateSelect,
    categories,
    isLoading,
    setIsLoading,
  } = useAccountBookModalForm({ mode, selectedDate, isOpen, item });

  const { user } = useContext(UserContext);

  const asset = useAssetStore((state) => state.asset);
  const updateAsset = useAssetStore((state) => state.updateAsset);
  const handleError = useErrorHandler(onClose);

  // 저장된 거래와 자산을 함께 갱신한다.
  async function reloadAndClose() {
    onClose();
    await Promise.all([updateAsset(user.id), loadDashboardDatas(), loadCalendarDatas()]);
  }

  const handleCategoryChange = (e) => {
    setCategoryId(Number(e.target.value));
  };

  const handleAmountChange = (e) => {
    const inputValue = e.target.value;
    const onlyNumbers = inputValue.replace(/\D/g, "");
    const amountNumber = onlyNumbers ? Number(onlyNumbers) : 0;

    setAmount(amountNumber);
    setIsAmountError(amountNumber > MAX_AMOUNT);
  };

  // 가계부 항목 추가
  async function addAccountBook() {
    if (isAmountError || (hasTime && !time)) return;

    setIsLoading(true);
    try {
      await addAccountBookItem({
        userId: user.id,
        assetId: asset.id,
        type,
        occurredAt: hasTime ? combineDateAndTime(date, time) : formatDateYYYYMMDD(date),
        hasTime,
        categoryId: category.id,
        content,
        amount,
      });
      await reloadAndClose();
    } catch (error) {
      handleError(error, { closeCurrentModal: true });
    } finally {
      setIsLoading(false);
    }
  }

  // 가계부 항목 수정
  async function editAccountBook() {
    if (isAmountError || (hasTime && !time)) return;

    setIsLoading(true);
    try {
      await editAccountBookItem({
        itemId: item.id,
        type,
        occurredAt: hasTime ? combineDateAndTime(date, time) : formatDateYYYYMMDD(date),
        hasTime,
        categoryId: category.id,
        content,
        amount,
      });
      await reloadAndClose();
    } catch (error) {
      handleError(error, { closeCurrentModal: true });
    } finally {
      setIsLoading(false);
    }
  }

  // 가계부 항목 삭제
  async function deleteAccountBook() {
    setIsLoading(true);
    try {
      await deleteAccountBookItem(item.id);
      await reloadAndClose();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }

  const isEdit = mode === ACCOUNTBOOK_MODAL_MODE.EDIT;
  const isExpense = type === ACCOUNT_TYPE.EXPENSE;

  return (
    <ModalLayout
      record
      title="가계부"
      isOpen={isOpen}
      onClose={onClose}
      isLoading={isLoading}
      content={
        <div className="record-fields">
          <section className="record-schedule" aria-label="거래 일시">
            <div className="record-field-heading">
              <h3>거래 일시</h3>
              <label className="record-switch">
                시간 미지정
                <input type="checkbox" checked={!hasTime} onChange={(event) => setHasTime(!event.target.checked)} />
              </label>
            </div>
            <DateTimeInput
              label="거래"
              hideLabel
              showDateSelect={showDateSelect}
              setShowDateSelect={setShowDateSelect}
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
              allDay={!hasTime}
            />
          </section>
          <div className="record-amount-panel" data-type={type}>
            <div className="record-field-heading">
              <label htmlFor="ledger-amount">거래 금액</label>
              <div className="ledger-filters" role="group" aria-label="거래 구분">
                {ACCOUNT_TYPE_FILTER.filter((option) => option.value !== ACCOUNT_TYPE.ALL).map((option) => (
                  <button key={option.value} aria-pressed={type === option.value}
                    onClick={() => {
                      if (type !== option.value) {
                        setType(option.value);
                        setCategoryId(null);
                      }
                    }}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="record-amount">
              <span aria-hidden="true">{isExpense ? "−" : "+"}</span>
              <input
                id="ledger-amount"
                inputMode="numeric"
                value={amount ? Number(amount).toLocaleString() : ""}
                onChange={handleAmountChange}
                placeholder="0"
                maxLength={11}
                aria-invalid={isAmountError}
                aria-describedby={isAmountError ? "ledger-amount-error" : undefined}
              />
              <span>원</span>
            </div>
            {isAmountError && <p className="record-error" id="ledger-amount-error" role="alert">1억 원 이하의 금액을 입력해 주세요.</p>}
          </div>
          <div className="record-field">
            <label htmlFor="ledger-content">거래 내용</label>
            <input id="ledger-content" value={content} maxLength={50}
              placeholder={isExpense ? "지출 내용 입력" : "수입 내용 입력"}
              onChange={(event) => setContent(event.target.value)} />
          </div>
          <div className="record-field">
            <label htmlFor="ledger-category">카테고리</label>
            <div className="record-category">
              <i aria-hidden="true" style={{ backgroundColor: category?.colorHex }} />
              <Dropdown className="mapl-dropdown--form" id="ledger-category" value={category?.id ?? ""} disabled={!categories.length} onChange={handleCategoryChange}>
                {!categories.length && <option value="">카테고리가 없습니다</option>}
                {categories.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
              </Dropdown>
            </div>
          </div>
        </div>
      }
      footer={
        <RecordActions onDelete={isEdit ? deleteAccountBook : undefined} onClose={onClose}
          onSave={isEdit ? editAccountBook : addAccountBook} disabled={isLoading || (!isEdit && !asset?.id) || isAmountError || !category || (hasTime && !time)} />
      }
    />
  );
}
