import { editarInstalacao } from '@/services/api/instalacao/instalacao.service';
import { Instalacao } from '@/types/instalacao';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { instalacaoKeys } from './keys';

/**
 * Hook para editar campos de uma instalação
 * Invalida cache da agenda e detalhes da instalação após sucesso
 */
export const useEditaInstalacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, dados }: { uuid: string; dados: Partial<Instalacao> }) => {
      return editarInstalacao(uuid, dados);
    },
    
    onSuccess: (_, { uuid }) => {
      console.log(`🔄 [useEditaInstalacao] Invalidando cache após edição da instalação ${uuid}`);
      
      // Invalida agenda (instalação pode ter mudado de técnico ou data)
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
      
      // Invalida detalhes da instalação (garante que mostra dados atualizados)
      queryClient.invalidateQueries({ queryKey: instalacaoKeys.detail(uuid) });
      queryClient.invalidateQueries({ queryKey: instalacaoKeys.all });
    },
    
    onError: (error, { uuid }) => {
      console.error(`❌ [useEditaInstalacao] Erro ao editar instalação ${uuid}:`, error);
    },
  });
};
