# Services API

Serviços organizados por domínio para comunicação com a API MK-Auth.

## Estrutura

```
services/api/
├─ cliente/        # Gestão de clientes
├─ chamado/        # Gestão de chamados técnicos
├─ instalacao/     # Gestão de instalações
├─ agenda/         # Unificação de chamados + instalações abertos
├─ auth/           # Autenticação OAuth2
└─ core/           # Infraestrutura compartilhada
   ├─ apiClient.ts          # Axios client configurado
   ├─ interceptors/         # Request/response interceptors
   └─ token/                # JWT decode e refresh logic
```

## Padrões

### Organização por Domínio
Cada domínio possui:
- `{dominio}.service.ts` - Todas as operações (queries + mutations)
- `index.ts` - Barrel export (`export * from './{dominio}.service'`)

### Imports
```typescript
// ✅ Usar barrel exports
import { fetchAllClientes, fetchClienteById } from '@/services/api/cliente';
import { fetchAgenda } from '@/services/api/agenda';

// ❌ Não importar diretamente
import { fetchAllClientes } from '@/services/api/cliente/cliente.service';
```

### Adicionando Mutations
Mutations (fechar/reabrir chamado, fechar instalação) devem ser adicionadas no mesmo arquivo do domínio:

```typescript
// services/api/chamado/chamado.service.ts
export const fecharChamado = async (uuid: string): Promise<void> => {
  await apiClient.post(`/api/chamado/fechar/uuid=${uuid}`);
};

export const reabrirChamado = async (uuid: string): Promise<void> => {
  await apiClient.post(`/api/chamado/reabrir/uuid=${uuid}`);
};
```

## Core Infrastructure

### apiClient
Axios instance configurado com:
- Base URL dinâmica (armazenada no authStore)
- Interceptors para injetar token JWT
- Token refresh automático quando expira
- Detecção de erros de autenticação

### Interceptors
1. **authRequestInterceptor**: Injeta base URL e token JWT
2. **tokenRefreshInterceptor**: Renova token antes de expirar
3. **authErrorDetectorInterceptor**: Detecta erros 401/403 e faz logout

### Token Management
- **jwtDecoder**: Decodifica JWT e extrai exp
- **tokenRefreshManager**: Gerencia fila de requisições durante refresh

## Documentação
Ver [docs/FASE_1_MAPEAMENTO.md](../../docs/FASE_1_MAPEAMENTO.md) para mapeamento completo de endpoints.
