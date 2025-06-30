import { create } from "zustand";
import { fetchAsset } from "../api/asset";

const useAssetStore = create((set, get) => ({
  asset: null,
  fetchAsset: async (userId) => {
    const result = await fetchAsset(userId);
    set({ asset: result });
  },
  updateAsset: (newAsset) => set({ asset: newAsset }),
  resetAsset: () => set({ asset: null }),
}));

export default useAssetStore;
