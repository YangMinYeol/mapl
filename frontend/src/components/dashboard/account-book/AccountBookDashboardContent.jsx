import { useContext, useState } from "react";
import { deleteAccountBookItem } from "../../../api/account-book";
import { useModal } from "../../../context/ModalContext";
import { UserContext } from "../../../context/UserContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import useAssetStore from "../../../stores/useAssetStore";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
} from "../../../util/accountBookUtil";
import {
  getAccountBookDate,
  groupByMonth,
  groupByMonthWeek,
  groupByWeekday,
  groupByYear,
} from "../../../util/dateUtil";
import AccountBookModal from "../../account-book/AccountBookModal";
import AccountBookDashboardItem from "./AccountBookDashboardItem";
import { useNavigate } from "react-router-dom";

const { INCOME, EXPENSE, ALL } = ACCOUNT_TYPE;

// 전체, 수입, 지출 각각 개수와 합계 계산
function calcIncomeExpense(datas) {
  return datas.reduce(
    (acc, data) => {
      const { type, amount } = data;
      if (type === INCOME) {
        acc[INCOME].amount += amount;
        acc[INCOME].count += 1;
        acc[ALL].amount += amount;
        acc[ALL].count += 1;
      } else if (type === EXPENSE) {
        acc[EXPENSE].amount += amount;
        acc[EXPENSE].count += 1;
        acc[ALL].amount -= amount;
        acc[ALL].count += 1;
      }
      return acc;
    },
    {
      [INCOME]: { amount: 0, count: 0 },
      [EXPENSE]: { amount: 0, count: 0 },
      [ALL]: { amount: 0, count: 0 },
    }
  );
}

export default function AccountBookDashboardContent({
  dashboardDatas,
  selectedDate,
  loadDashboardDatas,
  loadCalendarDatas,
  selectedPeriod,
  filterType,
}) {
  const { user } = useContext(UserContext);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [dashboardModalMode, setDashboardModalMode] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const { openConfirm } = useModal();
  const handleError = useErrorHandler();
  const navigate = useNavigate();

  const asset = useAssetStore((state) => state.asset);
  const updateAsset = useAssetStore((state) => state.updateAsset);

  const filteredDatas =
    filterType === ACCOUNT_TYPE.ALL
      ? dashboardDatas
      : dashboardDatas.filter((data) => data.type === filterType);

  const accountSummary = calcIncomeExpense(filteredDatas);
  const emptyMessage = {
    [ALL]: "선택한 기간에 거래 내역이 없어요.",
    [INCOME]: "선택한 기간에 수입 내역이 없어요.",
    [EXPENSE]: "선택한 기간에 지출 내역이 없어요.",
  }[filterType];

  const sortedDatas = [...filteredDatas].sort((a, b) => getAccountBookDate(a) - getAccountBookDate(b));

  let groupedDatas = {};

  if (selectedPeriod.name === "Week") {
    groupedDatas = groupByWeekday(sortedDatas);
  } else if (selectedPeriod.name === "Month") {
    groupedDatas = groupByMonthWeek(sortedDatas);
  } else if (selectedPeriod.name === "Year") {
    groupedDatas = groupByMonth(sortedDatas);
  } else if (selectedPeriod.name === "Other") {
    groupedDatas = groupByYear(sortedDatas);
  }

  const handleAddAccountBook = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    openAccountBookModal();
  };

  // 모달 열기
  function openAccountBookModal() {
    setDashboardModalMode(ACCOUNTBOOK_MODAL_MODE.ADD);
    setIsDashboardModalOpen(true);
  }

  // 모달 닫기
  function closeAccountBookModal() {
    setIsDashboardModalOpen(false);
    setSelectedItem(null);
  }

  // 가계부 항목 편집
  function handleAccountItemEdit(item) {
    setDashboardModalMode(ACCOUNTBOOK_MODAL_MODE.EDIT);
    setIsDashboardModalOpen(true);
    setSelectedItem(item);
  }

  // 가계부 항목 삭제
  function handleAccountItemDelete(item) {
    try {
      openConfirm(
        "정말로 삭제하시겠습니까?",
        "삭제한 항목은 다시 되돌릴 수 없습니다.",
        async () => {
          await deleteAccountBookItem(item.id);
          await Promise.all([updateAsset(user.id), loadDashboardDatas(), loadCalendarDatas()]);
        }
      );
    } catch (error) {
      handleError(error);
    }
  }

  return (
    <div className="ledger-content">
      <dl className="ledger-summary">
        {[[ALL, "차액", ""], [INCOME, "수입", "+"], [EXPENSE, "지출", "−"]].map(([type, label, sign]) => (
          <div key={type} data-type={type}>
            <dt>{label} <span>{accountSummary[type].count}건</span></dt>
            <dd>{sign}{Number(accountSummary[type].amount).toLocaleString()}원</dd>
          </div>
        ))}
      </dl>
      <div className="ledger-columns">
        <span>분류</span><span>내용</span><span>금액</span>
      </div>
      <div className="dashboard-main-content ledger-list">
        {sortedDatas.length === 0 && <p className="ledger-empty">{emptyMessage}</p>}
        {selectedPeriod.name === "Day"
          ? sortedDatas.map((item) => (
              <AccountBookDashboardItem
                key={item.id}
                item={item}
                onEdit={handleAccountItemEdit}
                onDelete={handleAccountItemDelete}
              />
            ))
          : Object.entries(groupedDatas).map(
              ([groupTitle, items]) =>
                items.length > 0 && (
                  <div key={groupTitle}>
                    <div className="ledger-group">
                      {groupTitle}
                    </div>
                    {items.map((item) => (
                      <AccountBookDashboardItem
                        key={item.id}
                        item={item}
                        onEdit={handleAccountItemEdit}
                        onDelete={handleAccountItemDelete}
                      />
                    ))}
                  </div>
                )
            )}
      </div>

      <div className="ledger-footer">
        <div>
          {`자산 ${Number(asset ? asset.balance : 0).toLocaleString()}원`}
        </div>
        <button
          type="button"
          aria-label="가계부 내역 추가"
          className="planner-action"
          onClick={handleAddAccountBook}
        >
          내역 추가
        </button>
      </div>

      <AccountBookModal
        isOpen={isDashboardModalOpen}
        onClose={closeAccountBookModal}
        mode={dashboardModalMode}
        selectedDate={selectedDate}
        loadDashboardDatas={loadDashboardDatas}
        loadCalendarDatas={loadCalendarDatas}
        item={selectedItem}
      />
    </div>
  );
}
