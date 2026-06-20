import { QueryClient } from '@tanstack/react-query';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { createMMKV } from 'react-native-mmkv';

/**
 * MMKV storage instance for React Query persistence
 * Isolated with unique ID to avoid conflicts with other MMKV usages
 */
const mmkvStorage = createMMKV({
  id: 'react-query-cache',
});

/**
 * MMKV persister for React Query
 * Benefits over AsyncStorage:
 * - No size limits (can store GB of data vs 6MB limit)
 * - 100x faster (native C++ vs JavaScript bridge)
 * - Synchronous operations (better performance)
 * - Used in production by WeChat (billions of users)
 */
export const mmkvPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      mmkvStorage.set('REACT_QUERY_CACHE', JSON.stringify(client));
      console.log('💾 [MMKV Persister] Cache persistido com sucesso');
    } catch (error) {
      console.error('❌ [MMKV Persister] Erro ao persistir cache:', error);
    }
  },
  restoreClient: async () => {
    try {
      const cached = mmkvStorage.getString('REACT_QUERY_CACHE');
      if (cached) {
        console.log('♻️ [MMKV Persister] Cache restaurado do storage');
        return JSON.parse(cached);
      }
      console.log('ℹ️ [MMKV Persister] Nenhum cache encontrado');
      return undefined;
    } catch (error) {
      console.error('❌ [MMKV Persister] Erro ao restaurar cache:', error);
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      mmkvStorage.remove('REACT_QUERY_CACHE');
      console.log('🗑️ [MMKV Persister] Cache removido');
    } catch (error) {
      console.error('❌ [MMKV Persister] Erro ao remover cache:', error);
    }
  },
};

/**
 * QueryClient configured with persistence and optimized settings
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 30, // 30 minutes - data stays fresh longer
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - cache persists for a week
      refetchOnWindowFocus: false, // Avoid refetch on app focus
      refetchOnReconnect: true, // Refetch when internet reconnects
    },
  },
});
