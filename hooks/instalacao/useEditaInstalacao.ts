import { ServicoAgenda } from '@/services/api/agenda';
import { editarInstalacao } from '@/services/api/instalacao/instalacao.service';
import { Instalacao } from '@/types/instalacao';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';
import { instalacaoKeys } from './keys';

// Campos que só precisam atualizar cache de detail
const SIMPLE_FIELDS = [
  'obs', 
  'email', 
  'telefone', 
  'celular', 
  'endereco', 
  'numero', 
  'complemento', 
  'bairro', 
  'cidade', 
  'cep',
  'login',
  'equipamento',
  'ip',
  'mac',
  'coordenadas',
  'valor',
  'vencimento'
];

// Campos que afetam a agenda (precisam atualizar agenda + detail)
const AGENDA_AFFECTING_FIELDS = [
  'tecnico',
  'visita', 
  'plano'
];

// Campos que movem item entre caches
const STATUS_FIELDS = [
  'status'
];

/**
 * Hook para editar campos de uma instalação
 * OTIMIZADO: Updates programáticos por tipo de campo (zero invalidações desnecessárias)
 */
export const useEditaInstalacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, dados }: { uuid: string; dados: Partial<Instalacao> }) => {
      return editarInstalacao(uuid, dados);
    },
    
    onSuccess: (result, { uuid, dados }) => {
      const field = Object.keys(dados)[0];
      const isSimpleField = SIMPLE_FIELDS.includes(field);
      const isAgendaAffecting = AGENDA_AFFECTING_FIELDS.includes(field);
      const isStatusChange = STATUS_FIELDS.includes(field);

      console.log(`🚀 [useEditaInstalacao] Aplicando updates programáticos para campo '${field}' da instalação ${uuid}`);
      
      try {
        // 1. SEMPRE atualiza cache de DETALHES
        const detailKey = instalacaoKeys.detail(uuid);
        const currentDetail = queryClient.getQueryData<Instalacao>(detailKey);
        
        if (currentDetail) {
          console.log(`🔍 Atualizando cache de detalhes para campo '${field}'`);
          const updatedDetail = {
            ...currentDetail,
            ...dados,
          };
          queryClient.setQueryData<Instalacao>(detailKey, updatedDetail);
        }

        // 2. Se campo SIMPLES → DONE! (Zero invalidações)
        if (isSimpleField) {
          console.log(`✅ Campo simples '${field}' - ZERO invalidações necessárias`);
          return;
        }

        // 3. Se campo afeta AGENDA → atualiza agenda cache também
        if (isAgendaAffecting) {
          console.log(`📋 Campo '${field}' afeta agenda - atualizando cache da agenda`);
          const agendaData = queryClient.getQueryData(agendaKeys.all) as ServicoAgenda[] | undefined;
          
          if (agendaData) {
            const agendaAtualizada = agendaData.map((item: ServicoAgenda) => 
              'uuid_solic' in item && item.uuid_solic === uuid 
                ? { ...item, ...dados }
                : item
            );
            queryClient.setQueryData(agendaKeys.all, agendaAtualizada);
          }
        }

        // 4. Se mudança de STATUS → move entre caches
        if (isStatusChange) {
          console.log(`🔄 Mudança de status detectada - movendo item entre caches`);
          const newStatus = dados.status;
          
          if (newStatus === 'concluido' || newStatus === 'fechado') {
            // Move da AGENDA para HISTÓRICO
            moveFromAgendaToHistorico(queryClient, uuid, dados);
          } else if (newStatus === 'aberto') {
            // Move do HISTÓRICO para AGENDA  
            moveFromHistoricoToAgenda(queryClient, uuid, dados);
          }
        }

        console.log(`✅ [useEditaInstalacao] Updates programáticos concluídos - estratégia otimizada aplicada!`);
        
      } catch (error) {
        console.error(`❌ [useEditaInstalacao] Erro nos updates programáticos:`, error);
        
        // 🚨 FALLBACK: Se algo der errado, volta pro método antigo
        console.log(`🔄 Aplicando fallback - invalidação tradicional`);
        queryClient.invalidateQueries({ queryKey: agendaKeys.all });
        queryClient.invalidateQueries({ queryKey: instalacaoKeys.detail(uuid) });
      }
    },
    
    onError: (error, { uuid }) => {
      console.error(`❌ [useEditaInstalacao] Erro ao editar instalação ${uuid}:`, error);
    },
  });
};

/**
 * Move instalação da agenda para o histórico
 */
const moveFromAgendaToHistorico = (
  queryClient: ReturnType<typeof useQueryClient>, 
  uuid: string, 
  dados: Partial<Instalacao>
) => {
  const agendaData = queryClient.getQueryData(agendaKeys.all) as ServicoAgenda[] | undefined;
  if (!agendaData) return;

  const instalacao = agendaData.find((item: ServicoAgenda) => 
    'uuid_solic' in item && item.uuid_solic === uuid
  );

  if (instalacao) {
    // Remove da agenda
    const agendaAtualizada = agendaData.filter((item: ServicoAgenda) => 
      !('uuid_solic' in item && item.uuid_solic === uuid)
    );
    queryClient.setQueryData(agendaKeys.all, agendaAtualizada);

    // Adiciona no histórico
    const historicoData = (queryClient.getQueryData(historicoKeys.all) as ServicoAgenda[] | undefined) || [];
    const instalacaoFechada = { ...instalacao, ...dados };
    queryClient.setQueryData(historicoKeys.all, [instalacaoFechada, ...historicoData]);
    
    console.log(`📋→📚 Instalação ${uuid} movida da agenda para o histórico`);
  }
};

/**
 * Move instalação do histórico para a agenda  
 */
const moveFromHistoricoToAgenda = (
  queryClient: ReturnType<typeof useQueryClient>,
  uuid: string, 
  dados: Partial<Instalacao>
) => {
  const historicoData = queryClient.getQueryData(historicoKeys.all) as ServicoAgenda[] | undefined;
  if (!historicoData) return;

  const instalacao = historicoData.find((item: ServicoAgenda) => 
    'uuid_solic' in item && item.uuid_solic === uuid
  );

  if (instalacao) {
    // Remove do histórico
    const historicoAtualizado = historicoData.filter((item: ServicoAgenda) => 
      !('uuid_solic' in item && item.uuid_solic === uuid)
    );
    queryClient.setQueryData(historicoKeys.all, historicoAtualizado);

    // Adiciona na agenda
    const agendaData = (queryClient.getQueryData(agendaKeys.all) as ServicoAgenda[] | undefined) || [];
    const instalacaoReaberta = { ...instalacao, ...dados };
    queryClient.setQueryData(agendaKeys.all, [instalacaoReaberta, ...agendaData]);
    
    console.log(`📚→📋 Instalação ${uuid} movida do histórico para a agenda`);
  }
};
