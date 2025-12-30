/**
 * Instalacao entity from MK-Auth API
 * Contains all fields returned by /api/instalacao/listar endpoint
 */
export interface Instalacao {
  id: string;
  uuid_solic: string;
  uuid: string;
  login: string;
  senha: string;
  email: string;
  nome: string; // Nome do cliente
  data_nasc: string;
  cpf: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  vencimento: string;
  plano: string;
  complemento: string;
  rg: string;
  celular: string;
  comodato: string; // 'sim' | 'nao'
  datainst: string | null; // Data da instalação
  visitado: string; // 'sim' | 'nao'
  instalado: string; // 'sim' | 'nao'
  tecnico: string | null; // ID do técnico responsável
  obs: string | null;
  tipo: string; // 'instalacao'
  ip: string | null;
  pool6: string | null;
  mac: string | null;
  valor: string | null;
  concluido: string; // 'xxx' quando concluído
  promocod: string;
  numero: string; // Número do endereço
  endereco_res: string;
  numero_res: string;
  bairro_res: string;
  cidade_res: string;
  cep_res: string;
  estado_res: string;
  complemento_res: string;
  vendedor: string | null;
  nextel: string | null;
  disp: string; // 'sim' | 'nao'
  contrato: string;
  adesao: string;
  visita: string | null; // Data agendada para visita
  equipamento: string;
  codigo: string | null;
  ipcadastro: string;
  processamento: string; // Data de processamento
  status: string; // 'concluido', 'pendente', etc
  opcelular: string;
  coordenadas: string;
  login_atend: string | null;
  ramal: string | null;
  termo: string; // Termo de instalação (ex: "1811I/2023")
  naturalidade: string | null;
  dot_ref: string | null;
  opcelular2: string;
  celular2: string | null;
  nome_feito: string;
  data_feito: string | null;
}

/**
 * Response structure for paginated instalacoes list
 */
export interface InstalacaoListResponse {
  total_registros: number;
  consulta_atual: number;
  pagina_atual: number;
  total_paginas: number;
  instalacoes: Instalacao[];
}

/**
 * Status filter options for instalacoes
 */
export type InstalacaoStatus = 'aberto' | 'concluido' | 'todos';

/**
 * Response from PUT /api/instalacao/editar
 * MK-Auth returns HTTP 200 with status field in body
 */
export interface InstalacaoEditResponse {
  status: 'sucesso' | 'erro';
  mensagem: string;
  dados?: Partial<Instalacao>;
}
