import { fetchAllUsuarios } from '@/services/api/usuario';
import { Usuario } from '@/types/usuario';
import { useQuery } from '@tanstack/react-query';
import { usuarioKeys } from './keys';

export function useUsuarios() {
  return useQuery<Usuario[], Error>({
    queryKey: usuarioKeys.all,
    queryFn: fetchAllUsuarios,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
  });
}
