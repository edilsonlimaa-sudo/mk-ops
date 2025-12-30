/**
 * Query keys para funcionários
 * Centraliza as keys para facilitar invalidação de cache
 */
export const funcionarioKeys = {
  all: ['funcionarios'] as const,
  lists: () => [...funcionarioKeys.all, 'list'] as const,
  list: () => [...funcionarioKeys.lists()] as const,
  details: () => [...funcionarioKeys.all, 'detail'] as const,
  detail: (id: string) => [...funcionarioKeys.details(), id] as const,
};
