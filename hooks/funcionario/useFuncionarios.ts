import { fetchAllFuncionarios } from '@/services/api/funcionario/funcionario.service';
import { useQuery } from '@tanstack/react-query';
import { funcionarioKeys } from './keys';

/**
 * Hook para buscar lista de funcionários
 * Cache de 1 hora (funcionários não mudam frequentemente)
 */
export const useFuncionarios = () => {
  return useQuery({
    queryKey: funcionarioKeys.list(),
    queryFn: fetchAllFuncionarios,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 2, // 2 horas
    select: (data) => data.funcionarios, // Extrai apenas o array de funcionarios
  });
};
