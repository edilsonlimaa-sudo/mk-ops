# Hooks - Estrutura Organizada por Domínio

## 📂 Estrutura

```
hooks/
  ├─ cliente/          # Hooks relacionados a clientes
  │   ├─ useClients.ts
  │   ├─ useClientDetail.ts
  │   ├─ keys.ts       # Query keys centralizados
  │   └─ index.ts
  │
  ├─ chamado/          # Hooks relacionados a chamados
  │   ├─ useChamadoDetail.ts
  │   ├─ keys.ts
  │   └─ index.ts
  │
  ├─ instalacao/       # Hooks relacionados a instalações
  │   ├─ useInstalacaoDetail.ts
  │   ├─ keys.ts
  │   └─ index.ts
  │
  ├─ agenda/           # Agenda unificada (chamados + instalações abertas)
  │   ├─ useAgenda.ts
  │   ├─ keys.ts
  │   └─ index.ts
  │
  ├─ historico/        # Histórico (chamados + instalações concluídas)
  │   ├─ useHistorico.ts
  │   ├─ keys.ts
  │   └─ index.ts
  │
  ├─ auth/             # Hooks de autenticação
  │   ├─ useProactiveTokenRefresh.ts
  │   └─ index.ts
  │
  └─ ui/               # Hooks de UI e tema
      ├─ use-color-scheme.ts
      ├─ use-theme-color.ts
      └─ index.ts
```

## 🎯 Uso

### Imports Limpos

```typescript
// Antes (bagunça)
import { useClients } from '@/hooks/useClients';
import { useClientDetail } from '@/hooks/useClientDetail';
import { CLIENTS_QUERY_KEY } from '@/hooks/useClients';

// Depois (organizado)
import { useClients, useClientDetail, clienteKeys } from '@/hooks/cliente';
```

### Query Keys Centralizados

Cada domínio tem seu arquivo `keys.ts` que exporta query keys padronizadas:

```typescript
// hooks/cliente/keys.ts
export const clienteKeys = {
  all: ['cliente'] as const,
  lists: () => [...clienteKeys.all, 'list'] as const,
  list: () => [...clienteKeys.lists()] as const,
  details: () => [...clienteKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...clienteKeys.details(), uuid] as const,
};
```

**Benefícios:**
- ✅ Invalidar tudo: `queryClient.invalidateQueries(clienteKeys.all)`
- ✅ Invalidar listas: `queryClient.invalidateQueries(clienteKeys.lists())`
- ✅ Invalidar detalhe específico: `queryClient.invalidateQueries(clienteKeys.detail(uuid))`
- ✅ Type-safe, com autocomplete

### Mutations (Futuro)

Quando adicionar mutations, seguir o mesmo padrão:

```
hooks/
  └─ chamado/
      ├─ useChamadoDetail.ts        [Query]
      ├─ useFecharChamado.ts        [Mutation] 🆕
      ├─ useReabrirChamado.ts       [Mutation] 🆕
      ├─ keys.ts
      └─ index.ts
```

## 📝 Convenções

1. **Arquivos de hooks**: começam com `use` (camelCase)
2. **Arquivos de keys**: sempre `keys.ts`
3. **Arquivos de index**: sempre `index.ts` (re-exports)
4. **Imports**: sempre usar barrel exports via `index.ts`

## 🚀 Adicionar Novo Hook

1. Criar arquivo na pasta do domínio correto
2. Adicionar export no `index.ts` da pasta
3. Usar query keys centralizados do `keys.ts`

Exemplo:

```typescript
// hooks/cliente/useUpdateClient.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClient } from '@/services/api/client.service';
import { clienteKeys } from './keys';

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries(clienteKeys.detail(data.uuid_cliente));
      queryClient.invalidateQueries(clienteKeys.list());
    },
  });
};

// hooks/cliente/index.ts
export { useUpdateClient } from './useUpdateClient';
```
