import { updateClient } from '@/services/api/cliente/cliente.service';
import { Client, UpdateClientPayload } from '@/types/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteKeys } from './keys';

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
