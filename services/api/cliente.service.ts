import apiClient from './apiClient';

export const CLIENTS_PAGE_SIZE = 500;

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
  bloqueado?: string;
  cli_ativado?: string;
}

interface ListClientsResponse {
  total_registros: number;
  consulta_atual: number;
  pagina_atual: number;
  total_paginas: number;
  clientes: Cliente[];
}

const listClients = async (
  page: number = 1,
  limit: number = CLIENTS_PAGE_SIZE
): Promise<ListClientsResponse> => {
  const response = await apiClient.get<ListClientsResponse>(
    `/api/cliente/listar/limite=${limit}&pagina=${page}`
  );
  return response.data;
};

export const listAllClients = async (): Promise<Cliente[]> => {
  const firstPage = await listClients(1);
  
  if (firstPage.total_paginas === 1) {
    return firstPage.clientes.sort((a, b) => a.nome.localeCompare(b.nome));
  }
  
  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.total_paginas - 1 }, (_, i) => 
      listClients(i + 2)
    )
  );
  
  return [
    ...firstPage.clientes,
    ...remainingPages.flatMap(p => p.clientes)
  ].sort((a, b) => a.nome.localeCompare(b.nome));
};

export const getClient = async (id: number): Promise<Cliente> => {
  const response = await apiClient.get<Cliente>(`/api/cliente/show/${id}`);
  return response.data;
};
