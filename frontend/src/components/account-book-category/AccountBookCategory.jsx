import { closestCenter, DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { createPortal } from "react-dom";
import {
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useContext, useEffect, useRef, useState } from "react";
import { fetchDashboardAccountBooks } from "../../api/account-book";
import { UserContext } from "../../context/UserContext";
import { setDateByPeriod } from "../../util/dateUtil";
import { reorderAccountBookCategory } from "../../api/account-book-category";
import { useAccountBookCategory } from "../../hooks/useAccountBookCategory";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
  ACCOUNT_TYPE_FILTER,
} from "../../util/accountBookUtil";
import CategoryReport from "./CategoryReport";
import Loading from "../common/Loading";
import useCategoryStore from "../../stores/useCategoryStore";

import "../../styles/category-report.css";
import AccountBookCategoryModal from "./AccountBookCategoryModal";
import { useErrorHandler } from "../../hooks/useErrorHandler";

const tabOptions = ACCOUNT_TYPE_FILTER.filter(
  (item) => item.value !== ACCOUNT_TYPE.ALL
);

export default function AccountBookCategory() {
  const { user } = useContext(UserContext);
  const [monthlyTotals, setMonthlyTotals] = useState(null);
  const [monthlyError, setMonthlyError] = useState(false);
  const [monthlyRetry, setMonthlyRetry] = useState(0);
  const [selectedTab, setSelectedTab] = useState(ACCOUNT_TYPE.EXPENSE);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState(ACCOUNTBOOK_MODAL_MODE.ADD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categories, loaded, status, limit, disabled, reload } = useAccountBookCategory(selectedTab);
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const reorderPending = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleError = useErrorHandler();
  const orderedCategories = categoryItems.map(id => categories.find(category => category.id === id)).filter(Boolean);
  const visibleCategories = orderedCategories.length === categories.length ? orderedCategories : categories;

  useEffect(() => {
    if (!user?.id || !categories.length) return;
    let active = true;
    const { startDate, endDate } = setDateByPeriod({ name: "Month" }, new Date());
    setMonthlyError(false);
    setMonthlyTotals(null);
    fetchDashboardAccountBooks(user.id, startDate, endDate).then((records) => {
      const totals = new Map();
      for (const { categoryId, amount } of records) {
        totals.set(categoryId, (totals.get(categoryId) ?? 0) + Number(amount));
      }
      if (active) setMonthlyTotals(totals);
    }).catch(() => {
      if (active) setMonthlyError(true);
    });
    return () => { active = false; };
  }, [user?.id, categories, monthlyRetry]);

  useEffect(() => {
    setCategoryItems(categories.map((c) => c.id));
  }, [categories]);


  const openCategoryModal = () => {
    setMode(ACCOUNTBOOK_MODAL_MODE.ADD);
    setIsModalOpen(true);
  };

  const closeCategoryModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDragEnd = async (event) => {
    setDraggedCategory(null);
    const { active, over } = event;

    if (reorderPending.current || !over || active.id === over.id) return;
    const oldIndex = categoryItems.indexOf(active.id);
    const newIndex = categoryItems.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const previousItems = categoryItems;
    const newItems = arrayMove(previousItems, oldIndex, newIndex);
    reorderPending.current = true;
    setCategoryItems(newItems);
    try {
      await reorderAccountBookCategory(
        newItems.map((id, index) => ({ id, sortOrder: index + 1 }))
      );
      const key = selectedTab === ACCOUNT_TYPE.EXPENSE ? "expenseCategories" : "incomeCategories";
      useCategoryStore.setState(state => state.ownerId !== user.id ? state : {
        [key]: [...state[key]].sort((a, b) => newItems.indexOf(a.id) - newItems.indexOf(b.id)),
      });
    } catch (error) {
      setCategoryItems((items) => items === newItems ? previousItems : items);
      handleError(error);
    } finally {
      reorderPending.current = false;
    }
  };

  return (
    <main className="category-report account-surface"><div className="category-report-page">
      <header className="category-report-heading">
        <div className="category-heading-copy">
          <h1>카테고리</h1>
          <p>한 달 동안의 수입과 지출을 카테고리별 비중으로 살펴보세요.</p>
        </div>
        <button className="category-primary" disabled={disabled} onClick={openCategoryModal}><span aria-hidden="true">＋</span>카테고리 추가</button>
      </header>
      <div className="category-report-toolbar">
      <div className="category-tabs" role="group" aria-label="거래 유형">
        {tabOptions.map(({ label, value }) => (
          <button key={value} aria-pressed={selectedTab === value} onClick={() => setSelectedTab(value)}>{label}</button>
        ))}
      </div>
      {loaded && <small>{categories.length} / {limit}개</small>}
      </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          autoScroll={{ canScroll: element => element.classList.contains("report-ranking") }}
          onDragStart={({ active }) => setDraggedCategory(categories.find(category => category.id === active.id))}
          onDragCancel={() => setDraggedCategory(null)}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={visibleCategories.map(category => category.id)}
            strategy={verticalListSortingStrategy}
          >
          {!loaded && <div className="category-report-state">
            {status === "error" ? <div role="status">
              <p>카테고리를 불러오지 못했어요.</p>
              <button className="category-button" type="button" onClick={() => reload().catch(() => {})}>다시 시도</button>
            </div> : <Loading placement="surface" label="카테고리 조회 중" />}
          </div>}
          {loaded && <CategoryReport categories={visibleCategories} totals={monthlyTotals} type={selectedTab}
            monthlyError={monthlyError} onRetry={() => setMonthlyRetry(count => count + 1)}
            onEdit={category => {
              setSelectedItem(category);
              setMode(ACCOUNTBOOK_MODAL_MODE.EDIT);
              setIsModalOpen(true);
            }}
          />}
          </SortableContext>
          {createPortal(
            <DragOverlay dropAnimation={null}>
              {draggedCategory && <div className="category-drag-overlay">{draggedCategory.name}</div>}
            </DragOverlay>,
            document.body
          )}
        </DndContext>

      <AccountBookCategoryModal
        title={`${selectedTab === ACCOUNT_TYPE.EXPENSE ? "지출" : "수입"} 카테고리 ${mode === ACCOUNTBOOK_MODAL_MODE.EDIT ? "편집" : "추가"}`}
        mode={mode}
        selectedItem={selectedItem}
        type={selectedTab}
        isOpen={isModalOpen}
        onClose={closeCategoryModal}
        onSuccess={reload}
      />
    </div></main>
  );
}
