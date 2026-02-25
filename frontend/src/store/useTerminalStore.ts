import { create } from 'zustand';

interface TerminalState {
  isConnected: boolean;
  marketData: Record<string, any>;
  newsAlerts: any[];
  anomalies: any[];
  selectedAsset: string; // 🔴 NEW: Tracks the clicked asset
  setConnected: (status: boolean) => void;
  updateMarketData: (tick: any) => void;
  addNewsAlert: (news: any) => void;
  addAnomaly: (alert: any) => void;
  setSelectedAsset: (symbol: string) => void; // 🔴 NEW: Updates the chart
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isConnected: false,
  marketData: {},
  newsAlerts: [],
  anomalies: [],
  selectedAsset: "BTC", // Default starting chart
  setConnected: (status) => set({ isConnected: status }),
  
  updateMarketData: (tick) => set((state) => ({
    marketData: { ...state.marketData, [tick.symbol]: tick }
  })),

  addNewsAlert: (news) => set((state) => ({
    newsAlerts: [news, ...state.newsAlerts].slice(0, 10)
  })),

  addAnomaly: (alert) => set((state) => ({
    anomalies: [{ ...alert, id: Date.now() }, ...state.anomalies].slice(0, 3)
  })),

  // 🔴 NEW FUNCTION
  setSelectedAsset: (symbol) => set({ selectedAsset: symbol }),
}));