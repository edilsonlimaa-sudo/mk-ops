import { fecharChamado } from '@/services/api/chamado';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';

// 🎭 MOCK MODE - Ative para testar sem chamar API
const MOCK_MODE = true;

/**
 * Hook para fechar um chamado aberto
 * Invalida cache da agenda e histórico após sucesso
 */
export const useFechaChamado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ numeroChamado, motivo }: { numeroChamado: string; motivo: string }) => {
      if (MOCK_MODE) {
        // 🎭 Mock: simula fechamento sem chamar API
        console.log(`🎭 [MOCK] Simulando fechamento do chamado ${numeroChamado}`);
        console.log(`🎭 [MOCK] Motivo: ${motivo}`);
        
        // Simula latência de rede (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`✅ [MOCK] Chamado ${numeroChamado} fechado com sucesso (simulado)`);
        return;
      }
      
      // Modo real: chama API
      return fecharChamado(numeroChamado, motivo);
    },
    onSuccess: () => {
      console.log('♻️ [useFechaChamado] Invalidando cache da agenda e histórico...');

      // Invalida agenda (chamado sai da lista de abertos)
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });

      // Invalida histórico (chamado aparece nos fechados)
      queryClient.invalidateQueries({ queryKey: historicoKeys.all });

      console.log('✅ [useFechaChamado] Cache invalidado com sucesso');
    },
    onError: (error) => {
      console.error('❌ [useFechaChamado] Erro ao fechar chamado:', error);
    },
  });
};
