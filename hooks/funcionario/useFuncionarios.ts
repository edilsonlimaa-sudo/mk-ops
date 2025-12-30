import { fetchAllFuncionarios } from '@/services/api/funcionario/funcionario.service';
import type { Funcionario } from '@/types/funcionario';
import { useQuery } from '@tanstack/react-query';

export const useFuncionarios = () => {
  return useQuery<Funcionario[]>({
    queryKey: ['funcionarios', 'listagem'],
    queryFn: async () => {
      const response = await fetchAllFuncionarios();
      return response.funcionarios;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 2, // 2 horas (era cacheTime)
  });
};
