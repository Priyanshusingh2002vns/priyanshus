import { create } from "zustand";
import { persist } from "zustand/middleware";

// Zustand store with persistence
export const useDealStore = create(
  persist(
    (set) => ({
      selectedDeal: null,
      setSelectedDeal: (deal) => set({ selectedDeal: deal }),
      clearDeal: () => set({ selectedDeal: null }),

      // fetched deal details (do not persist)
      dealDetails: null,
      setDealDataDetails: (details) => set({ dealDetails: details }),
      clearDealDataDetails: () => set({ dealDetails: null }),

      // Filter states
      appliedFilters: null,
      setAppliedFilters: (filters) =>
        set((state) => ({
          appliedFilters: typeof filters === "function" ? filters(state.appliedFilters) : filters,
        })),
      selectedDealType: "All",
      setSelectedDealType: (type) =>
        set((state) => ({
          selectedDealType: typeof type === "function" ? type(state.selectedDealType) : type,
        })),
      clearAllFilters: () => set({ appliedFilters: null, selectedDealType: "All" }),
    }),
    {
      name: "deal-storage", // name for localStorage key
      getStorage: () => localStorage, // use localStorage
      // Do not persist volatile deal details to avoid stale data between deals
      partialize: (state) => ({
        // If you still want to persist something, add it here. Leaving empty persists nothing.
      }),
    }
  )
);
