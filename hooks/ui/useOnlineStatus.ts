import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

/**
 * Hook para LER o status de conectividade
 * NÃO configura listeners - apenas lê o estado do onlineManager
 * 
 * Use este hook em componentes que precisam reagir a mudanças de conectividade.
 * O listener global é configurado apenas no app/_layout.tsx via useNetworkStatus.
 * 
 * @returns isOnline - true se conectado, false se offline
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    // subscribe: registra callback para mudanças
    (callback) => {
      return onlineManager.subscribe(callback);
    },
    // getSnapshot: retorna estado atual
    () => onlineManager.isOnline(),
    // getServerSnapshot: para SSR (sempre online no servidor)
    () => true
  );
}
