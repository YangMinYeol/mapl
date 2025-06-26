import { create } from "zustand";
import { fetchAccountBookCategories } from "../api/account-book-category";

const useCategoryStore = create((set, get) => ({
  incomeCategories: [],
  expenseCategories: [],
  loaded: false,

  async fetchCategories(userId) {
    if (get().loaded) return;
    const { income, expense } = await fetchAccountBookCategories(userId);
    set({
      incomeCategories: income,
      expenseCategories: expense,
      loaded: true,
    });
  },

  resetCategories() {
    set({
      incomeCategories: [],
      expenseCategories: [],
      loaded: false,
    });
  },
}));

export default useCategoryStore;
