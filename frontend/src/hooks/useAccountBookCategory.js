import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import useCategoryStore from "../stores/useCategoryStore";
import { ACCOUNT_TYPE } from "../util/accountBookUtil";

export function useAccountBookCategory(tab) {
  const { user } = useContext(UserContext);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const categories = useCategoryStore((state) =>
    tab === ACCOUNT_TYPE.EXPENSE
      ? state.expenseCategories
      : state.incomeCategories
  );
  const limit = 20;
  const loaded = useCategoryStore(state => state.loaded && state.ownerId === user?.id);
  const status = useCategoryStore(state => state.ownerId === user?.id ? state.status : "idle");
  const disabled = !loaded || categories.length >= limit;

  return {
    categories,
    loaded,
    status,
    limit,
    disabled,
    reload: () => fetchCategories(user.id, { refresh: true }),
  };
}
