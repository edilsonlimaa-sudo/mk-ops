/**
 * Query key factory for instalacao domain
 * Centralizes all query keys related to instalacoes
 */
export const instalacaoKeys = {
  all: ['instalacao'] as const,
  details: () => [...instalacaoKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...instalacaoKeys.details(), uuid] as const,
} as const;
