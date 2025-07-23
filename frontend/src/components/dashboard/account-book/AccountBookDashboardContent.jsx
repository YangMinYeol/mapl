import { faCirclePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { deleteAccountBookItem } from "../../../api/account-book";
import { useModal } from "../../../context/ModalContext";
import { UserContext } from "../../../context/UserContext";
import useAssetStore from "../../../stores/useAssetStore";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
} from "../../../util/accountBookUtil";
import {
  groupByMonth,
  groupByMonthWeek,
  groupByWeekday,
  groupByYear,
} from "../../../util/dateUtil";
import { LoginExpiredError } from "../../../util/error";
import { DEFAULT_COLOR } from "../../../util/util";
import AccountBookModal from "../../account-book/AccountBookModal";
import AccountBookDashboardItem from "./AccountBookDashboardItem";
import { AccountBookPieChart } from "./AccountBookPieChart";

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
  const [selectedItem, setselectedItem] = useState(null);
  const { openModal, openConfirm } = useModal();

  const asset = useAssetStore((state) => state.asset);
  const updateAsset = useAssetStore((state) => state.updateAsset);

  const filteredDatas =
    filterType === ACCOUNT_TYPE.ALL
      ? dashboardDatas
      : dashboardDatas.filter((data) => data.type === filterType);

  const accountSummary = calcIncomeExpense(filteredDatas);

  const sortedDatas = filteredDatas.sort((a, b) => {
    if (a.occurredAt < b.occurredAt) return -1;
    if (a.occurredAt > b.occurredAt) return 1;
  });

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

  // 모달 열기
  function openAccountBookModal() {
    setDashboardModalMode(ACCOUNTBOOK_MODAL_MODE.ADD);
    setIsDashboardModalOpen(true);
  }

  // 모달 닫기
  function closeAccountBookModal() {
    setIsDashboardModalOpen(false);
    setselectedItem(null);
  }

  // 가계부 항목 편집
  function handleAccountItemEdit(item) {
    setDashboardModalMode(ACCOUNTBOOK_MODAL_MODE.EDIT);
    setIsDashboardModalOpen(true);
    setselectedItem(item);
  }

  // 가계부 항목 삭제
  function handleAccountItemDelete(item) {
    try {
      openConfirm(
        "정말로 삭제하시겠습니까?",
        "삭제한 항목은 다시 되돌릴 수 없습니다.",
        async () => {
          await deleteAccountBookItem(item.id);
          await updateAsset(user.id);
          await loadDashboardDatas();
          await loadCalendarDatas();
        }
      );
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("가계부 항목 삭제 오류:", error);
        openModal(error.message);
      }
    }
  }

  return (
    <div className="h-[600px] border-b border-mapl-slate">
      <div className="flex items-center text-center border-b border-mapl-slate h-2/18">
        <div className="w-1/3">
          <div>전체 ({accountSummary[ALL].count})</div>
          <div className="font-semibold">
            {Number(accountSummary[ALL].amount).toLocaleString()}원
          </div>
        </div>
        <div className="w-1/3">
          <div>수입 ({accountSummary[INCOME].count})</div>
          <div className="font-semibold text-blue-500">
            +{Number(accountSummary[INCOME].amount).toLocaleString()}원
          </div>
        </div>
        <div className="w-1/3">
          <div>지출 ({accountSummary[EXPENSE].count})</div>
          <div className="font-semibold text-red-500">
            -{Number(accountSummary[EXPENSE].amount).toLocaleString()}원
          </div>
        </div>
      </div>
      <div className="flex items-center font-semibold text-center border-b border-mapl-slate h-1/18">
        <div className="w-[125px] shrink-0">분류</div>
        <div className="w-8/20">내용</div>
        <div className="w-7/20"> 금액</div>
      </div>
      <div className="overflow-auto border-b h- dashboard-main-content h-14/18 border-mapl-slate">
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
                    <div className="px-4 py-2 font-semibold text-left bg-mapl-slate/20 text-mapl-dark">
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

      <div className="flex items-center justify-between px-2 h-1/18">
        <div>
          {`자산 ${Number(asset ? asset.balance : 0).toLocaleString()}원`}
        </div>
        <button
          className="cursor-pointer w-1/16"
          onClick={openAccountBookModal}
        >
          <FontAwesomeIcon
            color={DEFAULT_COLOR}
            icon={faCirclePlus}
            size="2xl"
          />
        </button>
      </div>

      <AccountBookPieChart dashboardDatas={dashboardDatas} />

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
