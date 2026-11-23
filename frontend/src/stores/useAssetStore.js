import { create } from "zustand";
import { fetchAsset } from "../api/asset";

let requestId = 0;
const useAssetStore = create((set) => ({
  asset: null,
  updateAsset: async (userId) => {
    const request = ++requestId;
    const latestAsset = await fetchAsset(userId);
    if (request === requestId) set({ asset: latestAsset });
  },
  resetAsset() {
    requestId++;
    set({ asset: null });
  },
}));

export default useAssetStore;
