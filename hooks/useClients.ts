import { fetchAllClients } from '@/services/api/client.service';
import { Client } from '@/types/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query key for clients list
 */
export const CLIENTS_QUERY_KEY = ['clients', 'list'] as const;

/**
 * Hook to fetch and cache all clients (memory only - too large for persistence)
 * 
 * Features:
 * - Automatic caching in memory
 * - 30min stale time (won't refetch unless data is old)
 * - Manual refetch available via refetch()
 * - Loading and error states
 * 
 * Note: Persistence is disabled due to large dataset size (3000+ records)
 * 
 * @returns React Query result with clients data
 */
export const useClients = () => {
  return useQuery<Client[], Error>({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: fetchAllClients,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (memory only)
    persister: undefined, // Disable persistence - dataset too large
  });
};

/**
 * Hook to manually invalidate and refetch clients
 * Useful for pull-to-refresh or after mutations
 */
export const useInvalidateClients = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY }),
    refetch: () => queryClient.refetchQueries({ queryKey: CLIENTS_QUERY_KEY }),
    clear: () => queryClient.removeQueries({ queryKey: CLIENTS_QUERY_KEY }),
  };
};
