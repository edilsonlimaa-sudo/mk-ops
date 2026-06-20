import { fetchAllClients } from '@/services/api/cliente';
import { Client } from '@/types/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteKeys } from './keys';

/**
 * Hook to fetch and cache all clients with MMKV persistence
 * 
 * Features:
 * - Persistent cache with MMKV (survives app restarts)
 * - 30min stale time (won't refetch unless data is old)
 * - Manual refetch available via refetch()
 * - Loading and error states
 * - Handles large datasets efficiently (~3000+ records)
 * 
 * Note: Now uses MMKV which has no size limits (unlike AsyncStorage's 6MB limit)
 * 
 * @returns React Query result with clients data
 */
export const useClients = () => {
  return useQuery<Client[], Error>({
    queryKey: clienteKeys.list(),
    queryFn: fetchAllClients,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - persisted cache
  });
};

/**
 * Hook to manually invalidate and refetch clients
 * Useful for pull-to-refresh or after mutations
 */
export const useInvalidateClients = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey: clienteKeys.list() }),
    refetch: () => queryClient.refetchQueries({ queryKey: clienteKeys.list() }),
    clear: () => queryClient.removeQueries({ queryKey: clienteKeys.list() }),
  };
};
