import { reabrirChamado } from '@/services/api/chamado/chamado.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';
import { chamadoKeys } from './keys';

/**
 * Hook para reabrir um chamado fechado
 * Usa React Query mutation com invalidação de cache
 */
export const useReabrirChamado = () => {
  const queryClient = useQueryClient();
  
  // 🎭 Mock mode - desabilite para usar a API real
  const MOCK_MODE = false;

  return useMutation({
    mutationFn: async (numeroChamado: string) => {
      if (MOCK_MODE) {
        console.log(`🎭 [MOCK] Simulando reabertura do chamado ${numeroChamado}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`✅ [MOCK] Chamado ${numeroChamado} reaberto com sucesso`);
        return;
      }

      return reabrirChamado(numeroChamado);
    },
    
    onSuccess: (_, numeroChamado) => {
      console.log(`🔄 [useReabrirChamado] Invalidando cache após reabertura do chamado ${numeroChamado}`);
      
      // Invalida histórico (de onde o chamado sai)
      queryClient.invalidateQueries({ queryKey: historicoKeys.all });
      
      // Invalida agenda (para onde o chamado vai)
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });

      // Invalida detalhes do chamado (garante que ao abrir detalhes, busca versão atualizada)
      queryClient.invalidateQueries({ queryKey: chamadoKeys.all });
    },
    
    onError: (error, numeroChamado) => {
      console.error(`❌ [useReabrirChamado] Erro ao reabrir chamado ${numeroChamado}:`, error);
    },
  });
};
