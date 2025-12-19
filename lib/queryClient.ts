import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/react-query-persist-client';

/**
 * AsyncStorage persister for React Query
 * Stores query cache in device storage
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'REACT_QUERY_OFFLINE_CACHE',
});

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
