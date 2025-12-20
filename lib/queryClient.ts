import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

/**
 * Custom AsyncStorage persister for React Query
 * Implements the Persister interface for AsyncStorage
 */
export const asyncStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    try {
      await AsyncStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
    } catch (error) {
      console.error('Failed to persist query client:', error);
    }
  },
  restoreClient: async () => {
    try {
      const cached = await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
      return cached ? JSON.parse(cached) : undefined;
    } catch (error) {
      console.error('Failed to restore query client:', error);
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
    } catch (error) {
      console.error('Failed to remove query client:', error);
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
