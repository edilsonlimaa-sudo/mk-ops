/**
 * Query key factory for cliente domain
 * Centralizes all query keys related to clientes
 */
export const clienteKeys = {
  all: ['cliente'] as const,
  lists: () => [...clienteKeys.all, 'list'] as const,
  list: () => [...clienteKeys.lists()] as const,
  details: () => [...clienteKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...clienteKeys.details(), uuid] as const,
} as const;
