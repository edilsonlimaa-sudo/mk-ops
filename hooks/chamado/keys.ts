/**
 * Query key factory for chamado domain
 * Centralizes all query keys related to chamados
 */
export const chamadoKeys = {
  all: ['chamado'] as const,
  details: () => [...chamadoKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...chamadoKeys.details(), uuid] as const,
} as const;
