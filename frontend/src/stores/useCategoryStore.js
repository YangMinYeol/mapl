import { create } from "zustand";
import { fetchAccountBookCategories } from "../api/account-book-category";

let requestId = 0;
const useCategoryStore = create((set, get) => ({
  incomeCategories: [],
  expenseCategories: [],
  loaded: false,
  ownerId: null,

  async fetchCategories(userId) {
    if (get().loaded && get().ownerId === userId) return;
    const request = ++requestId;
    const { income, expense } = await fetchAccountBookCategories(userId);
    if (request !== requestId) return;
    set({
      ownerId: userId,
      incomeCategories: income,
      expenseCategories: expense,
      loaded: true,
    });
  },

  resetCategories() {
    requestId++;
    set({
      ownerId: null,
      incomeCategories: [],
      expenseCategories: [],
      loaded: false,
    });
  },
}));

export default useCategoryStore;
