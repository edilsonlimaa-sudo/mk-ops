import { fetchClientById } from '@/services/api/cliente';
import { Client } from '@/types/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { clienteKeys } from './keys';

/**
 * Hook to fetch a single client by UUID
 * Uses initialData from the clients list cache for instant rendering
 * Falls back to API call if client is not in cache (deep links, cross-navigation)
 * 
 * @param uuid - Client UUID (uuid_cliente field)
 * @returns Query result with client data
 */
export function useClientDetail(uuid: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: clienteKeys.detail(uuid),
    queryFn: () => fetchClientById(uuid),
    
    // Try to get data from the clients list cache first (instant rendering)
    initialData: () => {
      const clients = queryClient.getQueryData<Client[]>(clienteKeys.list());
      return clients?.find(c => c.uuid_cliente === uuid);
    },
    
    // Client details should be fresher than the list
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (keep in memory)
  });
}

/**
 * Hook to invalidate a specific client's cache
 */
export function useInvalidateClientDetail() {
  const queryClient = useQueryClient();

  return {
    invalidate: (uuid: string) => {
      console.log(`🔄 [useClientDetail] Invalidando cache do cliente: ${uuid}`);
      return queryClient.invalidateQueries({ queryKey: clienteKeys.detail(uuid) });
    },
  };
}
