import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import useCategoryStore from "../stores/useCategoryStore";
import { ACCOUNT_TYPE } from "../util/accountBookUtil";

const MAX_CATEGORY_COUNT = 10;

export function useAccountBookCategory(tab) {
  const { user } = useContext(UserContext);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const resetCategories = useCategoryStore((state) => state.resetCategories);
  const categories = useCategoryStore((state) =>
    tab === ACCOUNT_TYPE.EXPENSE
      ? state.expenseCategories
      : state.incomeCategories
  );
  const disabled = categories.length >= MAX_CATEGORY_COUNT;

  async function reload() {
    resetCategories();
    await fetchCategories(user.id);
  }

  return {
    categories,
    disabled,
    reload,
  };
}
