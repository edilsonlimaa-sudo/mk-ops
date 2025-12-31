import { ServicoAgenda } from '@/services/api/agenda';
import { fecharInstalacao } from '@/services/api/instalacao/instalacao.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';
import { instalacaoKeys } from './keys';

/**
 * Hook para fechar uma instalação aberta
 * OTIMIZADO: Move item entre caches programaticamente (zero refetch)
 */
export const useFechaInstalacao = () => {
  const queryClient = useQueryClient();

  // 🎭 Mock mode - desabilite para usar a API real
  const MOCK_MODE = false;

  return useMutation({
    mutationFn: async (uuid: string) => {
      if (MOCK_MODE) {
        console.log(`🎭 [MOCK] Simulando fechamento da instalação ${uuid}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`✅ [MOCK] Instalação ${uuid} fechada com sucesso`);
        return { uuid_solic: uuid, status: 'concluido' }; // Mock return
      }

      return fecharInstalacao(uuid);
    },

    onSuccess: (result, uuid) => {
      console.log(`🚀 [useFechaInstalacao] Aplicando updates programáticos para instalação ${uuid}`);

      try {
        // 1. REMOVE da AGENDA cache
        const agendaData = queryClient.getQueryData<ServicoAgenda[]>(agendaKeys.all);
        if (agendaData) {
          const instalacaoParaFechar = agendaData.find(item =>
            'uuid_solic' in item && item.uuid_solic === uuid
          );

          if (instalacaoParaFechar) {
            console.log(`📋 Removendo instalação ${uuid} da agenda`);
            const agendaAtualizada = agendaData.filter(item =>
              !('uuid_solic' in item && item.uuid_solic === uuid)
            );
            queryClient.setQueryData<ServicoAgenda[]>(agendaKeys.all, agendaAtualizada);

            // 2. ADICIONA no HISTÓRICO cache
            console.log(`📚 Adicionando instalação ${uuid} no histórico`);
            const historicoData = queryClient.getQueryData<ServicoAgenda[]>(historicoKeys.all) || [];
            const instalacaoFechada = {
              ...instalacaoParaFechar,
              status: 'concluido',
              // Merge com dados retornados pela API se disponíveis
              ...(result && typeof result === 'object' ? result : {}),
            };

            const historicoAtualizado = [instalacaoFechada, ...historicoData];
            queryClient.setQueryData<ServicoAgenda[]>(historicoKeys.all, historicoAtualizado);

            // 3. ATUALIZA cache de DETALHES se existir
            const detailKey = instalacaoKeys.detail(uuid);
            const detailData = queryClient.getQueryData(detailKey);
            if (detailData) {
              console.log(`🔍 Atualizando cache de detalhes para instalação ${uuid}`);
              queryClient.setQueryData(detailKey, {
                ...detailData,
                status: 'concluido',
                ...(result && typeof result === 'object' ? result : {}),
              });
            }

            console.log(`✅ [useFechaInstalacao] Updates programáticos concluídos - ZERO refetch!`);
          } else {
            console.warn(`⚠️ Instalação ${uuid} não encontrada na agenda cache`);
          }
        } else {
          console.warn(`⚠️ Agenda cache vazio ou não disponível`);
        }
      } catch (error) {
        console.error(`❌ [useFechaInstalacao] Erro nos updates programáticos:`, error);

        // 🚨 FALLBACK: Se algo der errado, volta pro método antigo
        console.log(`🔄 Aplicando fallback - invalidação tradicional`);
        queryClient.invalidateQueries({ queryKey: agendaKeys.all });
        queryClient.invalidateQueries({ queryKey: historicoKeys.all });
      }
    },

    onError: (error, uuid) => {
      console.error(`❌ [useFechaInstalacao] Erro ao fechar instalação ${uuid}:`, error);
    },
  });
};
