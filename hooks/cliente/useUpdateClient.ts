import { updateClient } from '@/services/api/cliente/cliente.service';
import { Client, UpdateClientPayload } from '@/types/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteKeys } from './keys';

// 🎭 MOCK MODE para operações sensíveis (ex: reset de MAC)
// Ative para testar sem modificar dados reais
const MOCK_RESET_MAC = true;

/**
 * Hook para atualizar dados de um cliente
 * 
 * ESTRATÉGIA DE CACHE (API-first):
 * - Aguarda confirmação da API (onSuccess)
 * - Atualiza programaticamente TODOS os caches que contêm o cliente
 * - ZERO invalidações (performance otimizada)
 * 
 * Caches afetados:
 * 1. Detail cache: clienteKeys.detail(uuid)
 * 2. List cache: clienteKeys.list()
 * 
 * @example
 * ```tsx
 * const { mutate: update } = useUpdateClient();
 * 
 * update({ 
 *   uuid: cliente.uuid_cliente,
 *   nome: 'Novo Nome',
 *   email: 'novoemail@example.com'
 * });
 * ```
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateClientPayload) => {
      // 🎭 MOCK MODE: Intercepta reset de MAC para não modificar dados reais
      if (MOCK_RESET_MAC && 'mac' in payload && payload.mac === null) {
        console.log(`🎭 [MOCK] Simulando reset de MAC para cliente ${payload.uuid}`);
        console.log(`🎭 [MOCK] API NÃO será chamada - dados não serão alterados`);
        
        // Simula latência de rede (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`✅ [MOCK] Reset de MAC simulado com sucesso`);
        return {
          status: 'sucesso',
          mensagem: 'MAC resetado com sucesso (simulado)',
          dados: payload,
        };
      }
      
      // Modo real: chama API
      return updateClient(payload);
    },
    
    onSuccess: (result, payload) => {
      const { uuid, ...updatedFields } = payload;
      
      console.log(`🚀 [useUpdateClient] Aplicando updates programáticos para cliente ${uuid}`);
      console.log(`📝 Campos atualizados:`, Object.keys(updatedFields).join(', '));
      
      try {
        // 1️⃣ Atualiza DETAIL CACHE
        const detailKey = clienteKeys.detail(uuid);
        const currentDetail = queryClient.getQueryData<Client>(detailKey);
        
        if (currentDetail) {
          console.log(`🔍 Atualizando cache de detalhes`);
          const updatedDetail: Client = {
            ...currentDetail,
            ...updatedFields,
          };
          queryClient.setQueryData<Client>(detailKey, updatedDetail);
        }

        // 2️⃣ Atualiza LIST CACHE
        const listKey = clienteKeys.list();
        const currentList = queryClient.getQueryData<Client[]>(listKey);
        
        if (currentList) {
          console.log(`📋 Atualizando cache da listagem`);
          const updatedList = currentList.map((cliente) =>
            cliente.uuid_cliente === uuid || cliente.uuid === uuid
              ? { ...cliente, ...updatedFields }
              : cliente
          );
          queryClient.setQueryData<Client[]>(listKey, updatedList);
        }

        console.log(`✅ [useUpdateClient] Todos os caches atualizados - ZERO invalidações`);
        
      } catch (error) {
        console.error(`❌ [useUpdateClient] Erro nos updates programáticos:`, error);
        
        // 🚨 FALLBACK: Se algo der errado, invalida os caches
        console.log(`🔄 Aplicando fallback - invalidação tradicional`);
        queryClient.invalidateQueries({ queryKey: clienteKeys.detail(uuid) });
        queryClient.invalidateQueries({ queryKey: clienteKeys.list() });
      }
    },
    
    onError: (error, payload) => {
      console.error(`❌ [useUpdateClient] Erro ao atualizar cliente ${payload.uuid}:`, error);
    },
  });
};
