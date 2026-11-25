import { create } from "zustand";
import { fetchAccountBookCategories } from "../api/account-book-category";

let requestId = 0;
let pending;
const useCategoryStore = create((set, get) => ({
  incomeCategories: [],
  expenseCategories: [],
  loaded: false,
  ownerId: null,
  status: "idle",

  async fetchCategories(userId, { refresh = false } = {}) {
    const sameOwner = get().ownerId === userId;
    if (!refresh && sameOwner && pending) return pending;
    if (!refresh && sameOwner && get().status === "ready") return;
    const request = ++requestId;
    set(sameOwner ? { status: "loading" } : {
      ownerId: userId, status: "loading", loaded: false, incomeCategories: [], expenseCategories: [],
    });
    pending = fetchAccountBookCategories(userId).then(({ income, expense }) => {
      if (request === requestId) set({ incomeCategories: income, expenseCategories: expense, loaded: true, status: "ready" });
    }).catch(error => {
      if (request !== requestId) return;
      set({ status: "error" });
      throw error;
    }).finally(() => {
      if (request === requestId) pending = null;
    });
    return pending;
  },

  resetCategories() {
    requestId++;
    pending = null;
    set({
      ownerId: null,
      incomeCategories: [],
      expenseCategories: [],
      loaded: false,
      status: "idle",
    });
  },
}));

export default useCategoryStore;
