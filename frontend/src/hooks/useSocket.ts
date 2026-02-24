import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTerminalStore } from '../store/useTerminalStore';

export const useSocket = () => {
  const setConnected = useTerminalStore((state) => state.setConnected);
  const updateMarketData = useTerminalStore((state) => state.updateMarketData);

  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('market-tick', (data) => {
      // Safety Check: Ensure data and symbol exist
      if (data && data.symbol) {
        console.log('📈 UI Tick for:', data.symbol);
        updateMarketData(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [setConnected, updateMarketData]);
};