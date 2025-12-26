import { fetchUsuarioDetail } from '@/services/api/usuario';
import { UsuarioDetalhado } from '@/types/usuario';
import { useQuery } from '@tanstack/react-query';
import { usuarioKeys } from './keys';

export function useUsuarioDetail(uuid: string | null) {
  return useQuery<UsuarioDetalhado, Error>({
    queryKey: usuarioKeys.detail(uuid || ''),
    queryFn: () => fetchUsuarioDetail(uuid!),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}
