import { create } from 'zustand';

interface TerminalState {
  isConnected: boolean;
  marketData: Record<string, any>;
  setConnected: (status: boolean) => void;
  updateMarketData: (tick: any) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isConnected: false,
  marketData: {},
  setConnected: (status) => set({ isConnected: status }),
  
  // FIX: Merge new tick into existing data to prevent UI flashing and crashes
  updateMarketData: (tick) => set((state) => ({
    marketData: {
      ...state.marketData,
      [tick.symbol]: tick
    }
  })),
}));