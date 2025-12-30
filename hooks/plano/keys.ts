export const planoKeys = {
  all: ['planos'] as const,
  lists: () => [...planoKeys.all, 'list'] as const,
  list: () => [...planoKeys.lists()] as const,
};
