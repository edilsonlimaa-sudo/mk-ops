import apiClient from './apiClient';

// Constantes
export const CLIENTES_PAGE_SIZE = 500;

export interface Cliente {
  uuid: string;
  id: string;
  codigo: string | null;
  nome: string;
  nome_res: string;
  login: string;
  cpf_cnpj: string;
  tipo: string;
  coordenadas: string;
  senha: string;
  email: string;
  ip: string | null;
  mac: string | null;
  ramal: string;
  endereco: string;
  numero: string;
  bairro: string;
  complemento: string;
  cidade: string;
  estado: string;
  cep: string;
  bloqueado?: string; // "sim" | "nao"
  cli_ativado?: string; // "s" | "n"
}

export interface ListarClientesResponse {
  total_registros: number;
  consulta_atual: number;
  pagina_atual: number;
  total_paginas: number;
  clientes: Cliente[];
}

/**
 * Type guard para validar estrutura da resposta
 */
function isValidResponse(data: any): data is ListarClientesResponse {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.clientes) &&
    typeof data.total_paginas === 'number'
  );
}

/**
 * Busca lista de clientes com paginação
 * @param page Número da página (1-based)
 * @param limite Quantidade de registros por página (padrão: 200)
 */
export const listarClientes = async (
  page: number = 1,
  limite: number = 200
): Promise<ListarClientesResponse> => {
  const response = await apiClient.get<ListarClientesResponse>(
    `/api/cliente/listar/limite=${limite}&pagina=${page}`
  );
  
  console.log(`📡 GET /api/cliente/listar - Página ${page}/${response.data.total_paginas} - ${response.data.clientes.length} clientes`);
  
  return response.data;
};

/**
 * Busca TODOS os clientes, carregando todas as páginas em paralelo
 * @param limite Quantidade de registros por página (padrão: 500)
 * @param onProgress Callback opcional para progresso de carregamento
 * @returns Array com todos os clientes e metadados
 */
export const listarTodosClientes = async (
  limite: number = CLIENTES_PAGE_SIZE,
  onProgress?: (loaded: number, total: number) => void
): Promise<{
  clientes: Cliente[];
  total: number;
  loadedPages: number;
}> => {
  // 1. Busca primeira página para descobrir total
  const firstPage = await listarClientes(1, limite);
  
  // Valida estrutura da resposta
  if (!isValidResponse(firstPage)) {
    console.warn('⚠️ Estrutura de dados inválida na primeira página');
    throw new Error('Estrutura de dados inválida');
  }
  
  onProgress?.(firstPage.clientes.length, firstPage.total_registros);
  
  const totalPages = firstPage.total_paginas;
  
  // Se só tem 1 página, retorna direto
  if (totalPages <= 1) {
    return {
      clientes: firstPage.clientes,
      total: firstPage.total_registros,
      loadedPages: 1,
    };
  }
  
  // 2. Carrega páginas restantes em paralelo
  console.log(`🚀 Carregando páginas 2-${totalPages} em paralelo...`);
  
  try {
    const promises = Array.from({ length: totalPages - 1 }, (_, i) =>
      listarClientes(i + 2, limite)
    );
    
    const results = await Promise.all(promises);
    
    // 3. Combina todos os resultados
    const allClientes = [
      ...firstPage.clientes,
      ...results.flatMap((r) => r.clientes || []),
    ];
    
    console.log(`✅ Todas as ${totalPages} páginas carregadas - ${allClientes.length} clientes`);
    
    return {
      clientes: allClientes,
      total: firstPage.total_registros,
      loadedPages: totalPages,
    };
  } catch (error) {
    // 4. Fallback: retorna apenas primeira página em caso de erro
    console.error('❌ Erro ao carregar páginas adicionais:', error);
    console.warn('⚠️ Usando apenas primeira página');
    
    return {
      clientes: firstPage.clientes,
      total: firstPage.total_registros,
      loadedPages: 1,
    };
  }
};

/**
 * Busca detalhes de um cliente específico
 * @param id ID do cliente
 */
export const buscarCliente = async (id: number): Promise<Cliente> => {
  const response = await apiClient.get<Cliente>(`/api/cliente/show/${id}`);
  return response.data;
};
