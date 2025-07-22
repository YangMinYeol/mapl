import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { reorderAccountBookCategory } from "../../api/account-book-category";
import { useModal } from "../../context/ModalContext";
import { useAccountBookCategory } from "../../hooks/useAccountBookCategory";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
  ACCOUNT_TYPE_FILTER,
} from "../../util/accountBookUtil";
import { LoginExpiredError } from "../../util/error";
import Tab from "../common/Tab";
import { AccountBookCategoryItem } from "./AccountBookCategoryItem";
import AccountBookCategoryModal from "./AccountBookCategoryModal";

const tabOptions = ACCOUNT_TYPE_FILTER.filter(
  (item) => item.value !== ACCOUNT_TYPE.ALL
);

export default function AccountBookCategory() {
  const [selectedTab, setSelectedTab] = useState(ACCOUNT_TYPE.EXPENSE);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState(ACCOUNTBOOK_MODAL_MODE.ADD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categories, disabled, reload } = useAccountBookCategory(selectedTab);
  const [categoryItems, setCategoryItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const { openModal } = useModal();

  useEffect(() => {
    setCategoryItems(categories.map((c) => c.id));
  }, [categories]);

  useEffect(() => {
    reload();
  }, [selectedTab]);

  const openCategoryModal = () => {
    setMode(ACCOUNTBOOK_MODAL_MODE.ADD);
    setIsModalOpen(true);
  };

  const closeCategoryModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    try {
      if (over && active.id !== over.id) {
        const oldIndex = categoryItems.indexOf(active.id);
        const newIndex = categoryItems.indexOf(over.id);

        const newItems = arrayMove(categoryItems, oldIndex, newIndex);
        setCategoryItems(newItems);

        await reorderAccountBookCategory(
          newItems.map((id, index) => ({ id, sortOrder: index + 1 }))
        );
      }
      setActiveId(null);
    } catch (error) {
      if (error instanceof LoginExpiredError) {
        handleLoginExpired(error.message);
      } else {
        console.error("가계부 카테고리 정렬 오류:", error);
        openModal(error.message);
      }
    }
  };

  return (
    <div>
      <Tab
        options={tabOptions}
        selected={selectedTab}
        onSelect={setSelectedTab}
        size="lg"
      />
      <div className="py-5 space-y-2">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext
            items={categoryItems}
            strategy={verticalListSortingStrategy}
          >
            {categoryItems.map((id) => {
              const category = categories.find((c) => c.id === id);
              if (!category) return null;
              return (
                <AccountBookCategoryItem
                  key={category.id}
                  category={category}
                  reload={reload}
                  setIsModalOpen={setIsModalOpen}
                  setMode={setMode}
                  setSelectedItem={setSelectedItem}
                />
              );
            })}
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <AccountBookCategoryItem
                category={categories.find((c) => c.id === activeId)}
                dragOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div>
        <button
          className={`w-full h-12 text-base font-medium border rounded border-mapl-slate  ${
            disabled ? "text-gray-400" : "hover:cursor-pointer"
          }`}
          onClick={openCategoryModal}
          disabled={disabled}
        >
          카테고리 추가
        </button>
      </div>

      <AccountBookCategoryModal
        title="가계부 카테고리"
        mode={mode}
        selectedItem={selectedItem}
        type={selectedTab}
        isOpen={isModalOpen}
        onClose={closeCategoryModal}
        onSuccess={reload}
      />
    </div>
  );
}
