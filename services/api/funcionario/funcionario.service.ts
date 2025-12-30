import type { FuncionarioListResponse } from '@/types/funcionario';
import apiClient from '../core/apiClient';

/**
 * Fetches all funcionarios from the API
 * Handles the edge case where MK-Auth returns:
 * - Success: { funcionarios: [...] }
 * - No records: { status: 'erro', mensagem: 'Registros nao encontrados' } (still HTTP 200)
 */
export const fetchAllFuncionarios = async (): Promise<FuncionarioListResponse> => {
  const response = await apiClient.get('/api/funcionarios/listagem');
  
  // Check if API returned an error status in the body (even though HTTP is 200)
  if (response.data?.status === 'erro') {
    console.log('[FuncionarioService] No records found:', response.data.mensagem);
    return { funcionarios: [] };
  }
  
  // Return the funcionarios array or empty array if not present
  return {
    funcionarios: response.data?.funcionarios || []
  };
};
