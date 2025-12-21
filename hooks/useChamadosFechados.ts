import { fetchRecentChamadosFechados } from '@/services/api/chamadoFechado.service';
import { Chamado } from '@/types/chamado';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Query key factory for chamados fechados
 */
export const chamadosFechadosQueryKeys = {
  all: ['chamados', 'fechados'] as const,
};

/**
 * Hook to fetch and cache recent closed chamados
 * 
 * Features:
 * - Automatic caching in memory
 * - 10min stale time (closed chamados change less frequently)
 * - Manual refetch available via refetch()
 * - Loading and error states
 * - Returns max 50 most recent closed chamados
 * 
 * Strategy:
 * - Uses reverse pagination (fetches last page only)
 * - Optimized for performance (only 2 API requests)
 * 
 * @returns React Query result with recent closed chamados data
 */
export const useChamadosFechados = () => {
  return useQuery<Chamado[], Error>({
    queryKey: chamadosFechadosQueryKeys.all,
    queryFn: () => fetchRecentChamadosFechados(),
    staleTime: 1000 * 60 * 10, // 10 minutes (closed data changes less)
    gcTime: 1000 * 60 * 30, // 30 minutes (memory only)
    persister: undefined, // Disable persistence
  });
};

/**
 * Hook to manually invalidate and refetch chamados fechados
 * Useful for pull-to-refresh or after closing a chamado
 */
export const useInvalidateChamadosFechados = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: chamadosFechadosQueryKeys.all }),
    refetch: () =>
      queryClient.refetchQueries({ queryKey: chamadosFechadosQueryKeys.all }),
    clear: () =>
      queryClient.removeQueries({ queryKey: chamadosFechadosQueryKeys.all }),
  };
};
