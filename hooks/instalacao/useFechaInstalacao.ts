import { fecharInstalacao } from '@/services/api/instalacao/instalacao.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';

/**
 * Hook para fechar uma instalação aberta
 * Usa React Query mutation com invalidação de cache
 */
export const useFechaInstalacao = () => {
  const queryClient = useQueryClient();
  
  // 🎭 Mock mode - desabilite para usar a API real
  const MOCK_MODE = true;

  return useMutation({
    mutationFn: async (uuid: string) => {
      if (MOCK_MODE) {
        console.log(`🎭 [MOCK] Simulando fechamento da instalação ${uuid}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log(`✅ [MOCK] Instalação ${uuid} fechada com sucesso`);
        return;
      }

      return fecharInstalacao(uuid);
    },
    
    onSuccess: (_, uuid) => {
      console.log(`🔄 [useFechaInstalacao] Invalidando cache após fechamento da instalação ${uuid}`);
      
      // Invalida agenda (de onde a instalação sai)
      queryClient.invalidateQueries({ queryKey: agendaKeys.all });
      
      // Invalida histórico (para onde a instalação vai)
      queryClient.invalidateQueries({ queryKey: historicoKeys.all });
    },
    
    onError: (error, uuid) => {
      console.error(`❌ [useFechaInstalacao] Erro ao fechar instalação ${uuid}:`, error);
    },
  });
};
