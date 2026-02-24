import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useTerminalStore } from '../store/useTerminalStore';

const SOCKET_URL = 'http://localhost:4000';

export const useSocket = () => {
  const { setConnected, updatePrice, addNews } = useTerminalStore();

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('📡 Connected to InvestSave Gateway');
      setConnected(true);
    });

    // Listen for market ticks from Kafka -> Node -> UI
    socket.on('market-tick', (data) => {
      updatePrice(data);
    });

    // Listen for AI analyzed news
    socket.on('news-alert', (data) => {
      addNews(data);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [setConnected, updatePrice, addNews]);
};