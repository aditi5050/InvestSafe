import { create } from 'zustand';

interface TerminalState {
  isConnected: boolean;
  marketData: Record<string, any>;
  newsAlerts: any[];
  anomalies: any[]; // NEW: Holds the math alerts
  setConnected: (status: boolean) => void;
  updateMarketData: (tick: any) => void;
  addNewsAlert: (news: any) => void;
  addAnomaly: (alert: any) => void; // NEW: Function to add alerts
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isConnected: false,
  marketData: {},
  newsAlerts: [],
  anomalies: [],
  setConnected: (status) => set({ isConnected: status }),
  
  updateMarketData: (tick) => set((state) => ({
    marketData: { ...state.marketData, [tick.symbol]: tick }
  })),

  addNewsAlert: (news) => set((state) => ({
    newsAlerts: [news, ...state.newsAlerts].slice(0, 10)
  })),

  // Keep the 3 most recent anomalies so the screen doesn't get cluttered
  addAnomaly: (alert) => set((state) => ({
    anomalies: [{ ...alert, id: Date.now() }, ...state.anomalies].slice(0, 3)
  })),
}));