import { create } from "zustand";
import { fetchAsset } from "../api/asset";

const useAssetStore = create((set, get) => ({
  asset: null,
  updateAsset: async (userId) => {
    const latestAsset = await fetchAsset(userId);
    set({ asset: latestAsset });
  },
  resetAsset: () => set({ asset: null }),
}));

export default useAssetStore;
