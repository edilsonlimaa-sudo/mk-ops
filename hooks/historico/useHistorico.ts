import { fetchRecentHistorico, ServicoAgenda } from '@/services/api/agenda.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { historicoKeys } from './keys';

/**
 * Hook to fetch and cache recent historical records with reverse pagination optimization
 * (closed chamados + completed instalações)
 * 
 * Uses reverse pagination strategy:
 * - Fetches page 1 of each type (for metadata)
 * - Fetches LAST page of each type (most recent records)
 * - Returns max ~100 combined records
 * - Only 4 API requests total
 * 
 * Features:
 * - Automatic caching in memory
 * - 10min stale time (same as useChamadosFechados for consistency)
 * - Manual refetch available via refetch()
 * - Loading and error states
 * - Returns chamados fechados and instalacoes concluidas sorted by closing date
 * 
 * @returns React Query result with unified historico data
 */
export const useHistorico = () => {
  return useQuery<ServicoAgenda[], Error>({
    queryKey: historicoKeys.all,
    queryFn: () => fetchRecentHistorico(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (memory only)
    persister: undefined, // Disable persistence
  });
};

/**
 * Hook to manually invalidate and refetch historico
 * Useful for pull-to-refresh or after completing a chamado/instalacao
 */
export const useInvalidateHistorico = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: historicoKeys.all }),
    refetch: () =>
      queryClient.refetchQueries({ queryKey: historicoKeys.all }),
    clear: () =>
      queryClient.removeQueries({ queryKey: historicoKeys.all }),
  };
};
