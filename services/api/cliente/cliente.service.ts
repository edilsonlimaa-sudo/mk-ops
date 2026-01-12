import { Client, UpdateClientPayload } from '@/types/client';
import apiClient from '../core/apiClient';

/**
 * Fetches ALL clients using the bulk endpoint (single request)
 * @returns Array of all clients (empty array if no data)
 */
export const fetchAllClients = async (): Promise<Client[]> => {
  console.log('🔍 [ClientService] Iniciando busca de clientes...');
  
  try {
    const response = await apiClient.get('/api/cliente/listagem');
    
    // Handle "Registros nao encontrados" response
    if (response.data?.mensagem?.includes('Registros nao encontrados')) {
      console.log('ℹ️ [ClientService] Nenhum cliente encontrado');
      return [];
    }

    // Response can be direct array or nested in object
    const clientes = Array.isArray(response.data) 
      ? response.data 
      : response.data.clientes || [];

    console.log(`✅ [ClientService] Total de clientes carregados: ${clientes.length}`);
    return clientes;
  } catch (error) {
    console.error('❌ [ClientService] Erro ao buscar clientes:', error);
    throw error;
  }
};

/**
 * Fetches a single client by UUID
 * @param uuid - Client UUID (uuid_cliente field)
 * @returns Single client object
 * @throws Error if client not found or invalid UUID
 */
export const fetchClientById = async (uuid: string): Promise<Client> => {
  console.log(`🔍 [ClientService] Buscando cliente por UUID: ${uuid}`);
  
  try {
    const response = await apiClient.get(`/api/cliente/show/${uuid}`);
    
    // API inconsistency: returns 200 with empty array when client not found
    if (Array.isArray(response.data) && response.data.length === 0) {
      console.warn(`⚠️ [ClientService] Cliente não encontrado: ${uuid}`);
      throw new Error('Cliente não encontrado');
    }
    
    // Validate that we got a client object
    if (!response.data || typeof response.data !== 'object' || !response.data.uuid_cliente) {
      console.warn(`⚠️ [ClientService] Resposta inválida para UUID: ${uuid}`, response.data);
      throw new Error('Resposta inválida da API');
    }
    
    console.log(`✅ [ClientService] Cliente encontrado: ${response.data.nome}`);
    return response.data;
  } catch (error) {
    console.error(`❌ [ClientService] Erro ao buscar cliente ${uuid}:`, error);
    throw error;
  }
};

/**
 * Updates a client's information
 * @param payload - Object containing uuid (required) and fields to update
 * @returns Updated client confirmation
 * @throws Error if update fails or client not found
 * 
 * @example
 * ```ts
 * await updateClient({
 *   uuid: '01HXX...',
 *   nome: 'Novo Nome',
 *   email: 'novoemail@example.com',
 *   observacao: 'Cliente VIP'
 * });
 * ```
 */
export const updateClient = async (payload: UpdateClientPayload): Promise<{
  status: string;
  mensagem: string;
  dados: UpdateClientPayload;
}> => {
  console.log(`📝 [ClientService] Atualizando cliente: ${payload.uuid}`);
  
  // Validate required field
  if (!payload.uuid) {
    throw new Error('UUID do cliente é obrigatório para atualização');
  }
  
  // Log fields being updated (excluding uuid)
  const fieldsToUpdate = Object.keys(payload).filter(key => key !== 'uuid');
  console.log(`🔄 [ClientService] Campos a atualizar: ${fieldsToUpdate.join(', ')}`);
  
  try {
    const response = await apiClient.put('/api/cliente/editar', payload);
    
    // Validate response
    if (response.data?.status === 'erro') {
      console.warn(`⚠️ [ClientService] Erro na atualização: ${response.data.mensagem}`);
      throw new Error(response.data.mensagem || 'Erro ao atualizar cliente');
    }
    
    console.log(`✅ [ClientService] Cliente atualizado com sucesso: ${payload.uuid}`);
    return response.data;
  } catch (error) {
    console.error(`❌ [ClientService] Erro ao atualizar cliente ${payload.uuid}:`, error);
    throw error;
  }
};
