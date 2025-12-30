import { fetchAllPlanos } from '@/services/api/plano/plano.service';
import { useQuery } from '@tanstack/react-query';
import { planoKeys } from './keys';

/**
 * Hook para buscar lista de planos
 * Cache de 1 hora (planos não mudam frequentemente)
 */
export const usePlanos = () => {
  return useQuery({
    queryKey: planoKeys.list(),
    queryFn: fetchAllPlanos,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 2, // 2 horas (anteriormente cacheTime)
  });
};
