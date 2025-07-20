import { useState } from "react";
import { useAccountBookCategory } from "../../hooks/useAccountBookCategory";
import {
  ACCOUNTBOOK_MODAL_MODE,
  ACCOUNT_TYPE,
  ACCOUNT_TYPE_FILTER,
} from "../../util/accountBookUtil";
import Tab from "../common/Tab";
import AccountBookCategoryModal from "./AccountBookCategoryModal";
import { AccountBookCategoryItem } from "./AccountBookCategoryItem";

const tabOptions = ACCOUNT_TYPE_FILTER.filter(
  (item) => item.value !== ACCOUNT_TYPE.ALL
);

export default function AccountBookCategory() {
  const [selectedTab, setSelectedTab] = useState(ACCOUNT_TYPE.EXPENSE);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mode, setMode] = useState(ACCOUNTBOOK_MODAL_MODE.ADD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categories, disabled, reload } = useAccountBookCategory(selectedTab);

  const openModal = () => {
    setMode(ACCOUNTBOOK_MODAL_MODE.ADD);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
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
        {categories.map((category) => (
          <AccountBookCategoryItem category={category} key={category.id} reload={reload}/>
        ))}
      </div>

      <div>
        <button
          className={`w-full h-12 text-base font-medium border rounded border-mapl-slate  ${
            disabled ? "text-gray-400" : "hover:cursor-pointer"
          }`}
          onClick={openModal}
          disabled={disabled}
        >
          카테고리 추가
        </button>
      </div>

      <AccountBookCategoryModal
        title="가계부 카테고리"
        mode={mode}
        item={selectedItem}
        type={selectedTab}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={reload}
      />
    </div>
  );
}
