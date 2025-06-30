import { useContext } from "react";
import { addAccountItem } from "../../api/account-book";
import { fetchAsset } from "../../api/asset";
import { useModal } from "../../context/ModalContext";
import { UserContext } from "../../context/UserContext";
import { useAccountBookModalForm } from "../../hooks/useAccountBookModalForm";
import useAssetStore from "../../stores/useAssetStore";
import {
  ACCOUNTBOOK_MODAL_MODE,
  FILTER_TYPE,
  FILTER_TYPE_VALUE,
} from "../../util/accountBookUtil";
import { combineDateAndTime } from "../../util/dateUtil";
import { LoginExpiredError } from "../../util/error";
import Tab from "../common/Tab";
import ModalLayout from "../common/modal/ModalLayout";
import DateTimeInput from "../memo/DateTimeInput";

const modalSize = {
  width: "w-[400px]",
  height: "h-[430px]",
  contentHeight: "h-[325px]",
};

function renderSection(title, content) {
  return (
    <div className="pb-3">
      <div className="py-2">
        <span>{title}</span>
      </div>
      {content}
    </div>
  );
}

export default function AccountBookModal({
  isOpen,
  onClose,
  mode,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
}) {
  const {
    type,
    setType,
    date,
    setDate,
    time,
    setTime,
    category,
    setCategory,
    content,
    setContent,
    amount,
    setAmount,
    isAmountError,
    setIsAmountError,
    showDateSelect,
    setShowDateSelect,
    showTimeSelect,
    setShowTimeSelect,
    categories,
    isLoading,
    setIsLoading,
  } = useAccountBookModalForm({ mode, selectedDate, isOpen });

  const { openModal } = useModal();
  const { user } = useContext(UserContext);

  const asset = useAssetStore((state) => state.asset);
  const updateAsset = useAssetStore((state) => state.updateAsset);

  // 메모 목록 최신화 및 모달 닫기
  async function reloadAndClose() {
    await loadDashboardDatas();
    await loadCalendarDatas();
    onClose();
  }

  const handleCategoryChange = (e) => {
    const id = Number(e.target.value);
    const selected = categories.find((c) => c.id === id);
    if (selected) setCategory(selected);
  };

  const handleAmountChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    setAmount(cleaned ? Number(cleaned) : 0);
    setIsAmountError(false);
  };

  function handleModalClick() {
    if (showDateSelect) setShowDateSelect(false);
    if (showTimeSelect) setShowTimeSelect(false);
  }

  // 가계부 항목 추가
  async function addAccountBook() {
    setIsLoading(true);
    const userId = user.id;
    try {
      await addAccountItem({
        userId: userId,
        assetId: asset.id,
        type,
        occurredAt: combineDateAndTime(date, time),
        categoryId: category.id,
        content,
        amount,
      });
      // 가계부 추가 후 서버에서 최신 자산 정보 받아오기
      const latestAsset = await fetchAsset(userId);
      updateAsset(latestAsset);
      reloadAndClose();
    } catch (error) {
      handleAccountBookError(error, "add");
    } finally {
      setIsLoading(false);
    }
  }

  function editAccountBook() {}

  // 가계부 항목 에러 처리
  function handleAccountBookError(error, context) {
    if (error instanceof LoginExpiredError) {
      onClose();
      handleLoginExpired(error.message);
    } else {
      console.error(
        `가계부 항목 ${context === "add" ? "추가" : "편집"} 오류:`,
        error
      );
      onClose();
      openModal(error.message);
    }
  }

  /** 화면 */
  // 날짜
  const occurredSection = (
    <>
      <DateTimeInput
        showDateSelect={showDateSelect}
        setShowDateSelect={setShowDateSelect}
        date={date}
        setDate={setDate}
        showTimeSelect={showTimeSelect}
        setShowTimeSelect={setShowTimeSelect}
        time={time}
        setTime={setTime}
        allDay={false}
      />
    </>
  );

  // 카테고리
  const categorySection = (
    <div className="flex items-center justify-between">
      <select
        className="w-11/12 border rounded outline-none border-mapl-black"
        value={category?.id ?? ""}
        onChange={handleCategoryChange}
      >
        {!categories ? (
          <option disabled>카테고리가 없습니다</option>
        ) : (
          categories.map((categoryItem) => (
            <option key={categoryItem.id} value={categoryItem.id}>
              {categoryItem.name}
            </option>
          ))
        )}
      </select>
      <div
        className="w-5 h-5 border rounded"
        style={{
          backgroundColor: category?.colorHex ?? "transparent",
          borderColor: category?.colorHex ?? "#ccc",
        }}
      ></div>
    </div>
  );

  // 내용
  const contentSection = (
    <>
      <div>
        <input
          className="w-full px-1 border rounded outline-none border-mapl-black"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="지출/수입 내용"
          maxLength={100}
        />
      </div>
    </>
  );

  // 금액
  const amountSection = (
    <>
      <div>
        <input
          type="text"
          inputMode="numeric"
          className={`w-full px-1 border rounded outline-none ${
            isAmountError ? "border-red-500" : "border-mapl-black"
          }`}
          value={amount ? Number(amount).toLocaleString() : ""}
          onChange={handleAmountChange}
          placeholder="금액 입력"
          maxLength={20}
        />
      </div>
      <div className="px-1 text-red-500">
        {isAmountError && <span>금액을 입력해주세요.</span>}
      </div>
    </>
  );

  // footer
  const footerButtonClass =
    "h-8 px-3 font-semibold border rounded cursor-pointer";

  const footer = (
    <div className="flex items-center w-full">
      <div className="flex-1">
        {mode === ACCOUNTBOOK_MODAL_MODE.EDIT && (
          <button className={`${footerButtonClass} bg-red-500 text-white`}>
            삭제
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className={`${footerButtonClass} bg-deep-green text-white`}
          onClick={
            mode === ACCOUNTBOOK_MODAL_MODE.CREATE
              ? addAccountBook
              : editAccountBook
          }
        >
          {mode === ACCOUNTBOOK_MODAL_MODE.CREATE ? "추가" : "수정"}
        </button>
        <button className={footerButtonClass} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );

  const modalContent = (
    <div>
      <div className="py-2">
        <Tab
          options={FILTER_TYPE.filter(
            (item) => item.value !== FILTER_TYPE_VALUE.ALL
          )}
          selected={type}
          onSelect={setType}
        />
      </div>
      {renderSection("날짜", occurredSection)}
      {renderSection("카테고리", categorySection)}
      {renderSection("내용", contentSection)}
      {renderSection("금액", amountSection)}
    </div>
  );

  return (
    <ModalLayout
      title={"가계부"}
      isOpen={isOpen}
      onClose={onClose}
      modalSize={modalSize}
      content={modalContent}
      footer={footer}
      handleModalClick={handleModalClick}
      isLoading={isLoading}
    />
  );
}
