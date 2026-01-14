import { fetchAllUsuarios } from '@/services/api/usuario';
import { useAuthStore } from '@/stores/auth';
import { Usuario } from '@/types/usuario';
import { useQuery } from '@tanstack/react-query';
import { usuarioKeys } from './keys';

export function useUsuarios() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery<Usuario[], Error>({
    queryKey: usuarioKeys.all,
    queryFn: fetchAllUsuarios,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    enabled: isAuthenticated, // Só executa se autenticado
  });
}
