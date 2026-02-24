import { create } from 'zustand';

interface PriceTick {
  symbol: string;
  price: number;
  change: number;
}

interface TerminalState {
  marketData: Record<string, PriceTick>;
  newsEvents: any[];
  isConnected: boolean;
  setConnected: (status: boolean) => void;
  updatePrice: (tick: PriceTick) => void;
  addNews: (news: any) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  marketData: {},
  newsEvents: [],
  isConnected: false,
  setConnected: (status) => set({ isConnected: status }),
  updatePrice: (tick) => set((state) => ({
    marketData: { ...state.marketData, [tick.symbol]: tick }
  })),
  addNews: (news) => set((state) => ({
    newsEvents: [news, ...state.newsEvents].slice(0, 50) // Keep last 50 events
  })),
}));