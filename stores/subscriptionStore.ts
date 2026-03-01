import { create } from 'zustand';

interface SubStore {
  isPro: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
}

export const useSubscriptionStore = create<SubStore>((set) => ({
  isPro: false,
  isLoading: false,

  initialize: async () => {
    // Placeholder for RevenueCat integration
    // For now, everyone gets free tier
    set({ isPro: false });
  },
}));
