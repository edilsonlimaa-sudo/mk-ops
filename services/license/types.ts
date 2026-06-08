/**
 * Contrato da API de Licenciamento (extraído do frontend)
 * Servidor: https://licenses.mk-ops.com.br/api/v1
 */

/** Status possíveis de uma licença */
export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'not_found';

/** Request enviado ao servidor de licenças */
export interface LicenseValidationRequest {
  /** Endereço do servidor mk-auth (IP ou domínio), chave única por empresa */
  mkAuthAddress: string;
}

/** Response do servidor de licenças */
export interface LicenseValidationResponse {
  /** Licença válida para acesso? (active OR active dentro do período de graça) */
  valid: boolean;
  /** Status real da licença */
  status: LicenseStatus;
  /** Razão quando inválida: 'expired' | 'suspended' | 'not_found' */
  reason?: string;
  /** Nome do cliente (empresa) */
  clientName?: string;
  /** Data de expiração da licença (ISO 8601) */
  expiresAt?: string;
  /** Data de fim do período de graça (expiresAt + 7 dias) */
  gracePeriodEndsAt?: string;
}

/** Dados armazenados em cache localmente */
export interface LicenseCacheData {
  /** Endereço do mk-auth que foi validado */
  mkAuthAddress: string;
  /** Timestamp da última validação bem-sucedida com o servidor */
  lastCheckedAt: number;
  /** Resposta completa armazenada em cache */
  response: LicenseValidationResponse;
}
