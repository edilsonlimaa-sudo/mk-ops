import apiClient from './apiClient';

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
 * Busca detalhes de um cliente específico
 * @param id ID do cliente
 */
export const buscarCliente = async (id: number): Promise<Cliente> => {
  const response = await apiClient.get<Cliente>(`/api/cliente/show/${id}`);
  return response.data;
};
