import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

/**
 * Hook para detectar status de conectividade
 * Integra com React Query para comportamento offline-first
 * 
 * @returns isOnline - true se conectado, false se offline
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Configura React Query para escutar mudanças de conectividade
    const unsubscribe = onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        const online = state.isConnected === true && state.isInternetReachable !== false;
        setOnline(online);
        setIsOnline(online);
      });
    });

    // Verifica estado inicial
    NetInfo.fetch().then((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);
      onlineManager.setOnline(online);
    });

    return () => {
      // Verifica se unsubscribe é uma função antes de chamar
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return isOnline;
}
