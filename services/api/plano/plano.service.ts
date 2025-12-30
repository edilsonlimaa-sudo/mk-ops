import { PlanoListResponse } from '@/types/plano';
import apiClient from '../core/apiClient';

/**
 * Fetches all planos from the API
 * @returns Array of all planos
 * 
 * Note: MK-Auth API can return HTTP 200 with error in body:
 * { status: 'erro', mensagem: 'Registros nao encontrados' }
 * We handle this by checking the status field and returning empty array.
 */
export const fetchAllPlanos = async () => {
  console.log('🔍 [PlanoService] Buscando lista de planos...');
  
  try {
    const response = await apiClient.get<PlanoListResponse>('/api/plano/listagem');
    
    // MK-Auth returns HTTP 200 with { status: 'erro' } when no records found
    if (response.data?.status === 'erro') {
      console.log('⚠️ [PlanoService] API retornou erro:', response.data.mensagem);
      return [];
    }
    
    const planos = response.data?.planos || [];
    console.log(`✅ [PlanoService] ${planos.length} planos carregados`);
    return planos;
  } catch (error) {
    console.error('❌ [PlanoService] Erro ao buscar planos:', error);
    throw error;
  }
};
