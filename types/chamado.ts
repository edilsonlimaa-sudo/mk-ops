/**
 * Chamado entity from MK-Auth API
 * Contains all fields returned by /api/chamado/listar endpoint
 */
export interface Chamado {
  id: string;
  uuid_suporte: string;
  uuid: string;
  assunto: string;
  abertura: string;
  fechamento: string | null;
  email: string;
  status: string;
  chamado: string; // Número do chamado (ex: "09102514215975")
  nome: string; // Nome do cliente
  login: string; // Login/CPF do cliente
  atendente: string | null; // Nome do atendente/técnico responsável
  visita: string | null; // Data agendada para visita técnica
  prioridade: string;
  ramal: string | null;
  reply: string;
  tecnico: string | null; // ID do técnico
  login_atend: string | null; // Login do atendente
  motivo_fechar: string | null;
}

/**
 * Response structure for paginated chamados list
 */
export interface ChamadoListResponse {
  total_registros: number;
  consulta_atual: number;
  pagina_atual: number;
  total_paginas: number;
  chamados: Chamado[];
}

/**
 * Status filter options for chamados
 */
export type ChamadoStatus = 'aberto' | 'fechado' | 'todos';
