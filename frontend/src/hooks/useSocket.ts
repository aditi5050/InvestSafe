import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTerminalStore } from '../store/useTerminalStore';

export const useSocket = () => {
  const { setConnected, updateMarketData, addNewsAlert, addAnomaly } = useTerminalStore();

  useEffect(() => {
    const socket = io('http://localhost:4000');

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('market-tick', (data) => {
      if (data && data.symbol) updateMarketData(data);
    });

    socket.on('news-alert', (data) => {
      if (data && data.headline) addNewsAlert(data);
    });

    // 🔴 NEW: Catch the volatility anomalies
    socket.on('anomaly-alert', (data) => {
      if (data && data.symbol) {
        console.log('⚠️ ANOMALY RECEIVED IN UI:', data);
        addAnomaly(data);
      }
    });

    return () => { socket.disconnect(); };
  }, [setConnected, updateMarketData, addNewsAlert, addAnomaly]);
};