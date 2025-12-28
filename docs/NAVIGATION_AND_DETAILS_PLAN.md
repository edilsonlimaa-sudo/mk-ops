# 🎯 Planejamento: Navegação e Detalhes de Entidades

**Data**: 22 de Dezembro de 2025  
**Objetivo**: Implementar navegação para detalhes, edição de entidades e navegação cruzada (Cliente ↔ Chamado)

---

## 📊 Contexto Atual

### Funcionalidades Implementadas ✅
- ✅ Autenticação com JWT e refresh token
- ✅ Listagem de Clientes (3000+ registros) com filtros e busca
- ✅ Listagem de Chamados Abertos com filtros por data
- ✅ Listagem de Agenda Unificada (Chamados + Instalações)
- ✅ Listagem de Histórico (Chamados Fechados)
- ✅ Pull-to-refresh em todas as listagens
- ✅ React Query para cache e sincronização

### Desafios a Resolver 🎯
1. **Navegação para detalhes**: Clicar em um item e ver todos os dados
2. **Edição de dados**: Modificar entidades e sincronizar com listas
3. **Navegação cruzada**: Cliente → Chamados e Chamado → Cliente
4. **Cache synchronization**: Editar em detalhes reflete na lista
5. **Invalidação inteligente**: Não recarregar tudo desnecessariamente

---

## 🏗️ FASE 1: Fundação - Navegação e Estrutura

### 1.1 - Configurar Stack Navigation para Detalhes
**Objetivo**: Permitir navegação push/pop para telas de detalhes

#### Tarefas:
- [ ] Analisar estrutura atual de navegação (Tabs + Stack)
- [ ] Criar tipos TypeScript para navegação (RootStackParamList)
- [ ] Configurar Stack Navigator nos grupos necessários
- [ ] Testar navegação básica com tela de exemplo

#### Arquivos a modificar:
- `app/(app)/_layout.tsx` - adicionar Stack se necessário
- `types/navigation.ts` - criar tipos de navegação

#### Estrutura de rotas proposta:
```
app/(app)/
  ├── (tabs)/                        [Tab Navigator existente]
  │   ├── clientes.tsx              [Lista de clientes]
  │   ├── chamados.tsx              [Lista de chamados abertos]
  │   ├── agenda.tsx                [Agenda unificada]
  │   └── historico.tsx             [Chamados fechados]
  └── detalhes/                      [Stack para detalhes]
      ├── cliente/[id].tsx          [Detalhes do cliente]
      ├── chamado/[id].tsx          [Detalhes do chamado]
      └── instalacao/[id].tsx       [Detalhes da instalação]
```

---

### 1.2 - Implementar Navegação Simples (Read-only)
**Objetivo**: Adicionar onPress nas listas para navegar para detalhes

#### Tarefas:
- [ ] Clientes: adicionar `onPress` → navegar para `detalhes/cliente/[id]`
- [ ] Chamados: adicionar `onPress` → navegar para `detalhes/chamado/[id]`
- [ ] Histórico: adicionar `onPress` → navegar para `detalhes/chamado/[id]`
- [ ] Agenda: adicionar `onPress` → navegar baseado no tipo (chamado/instalacao)

#### Arquivos a modificar:
- `app/(app)/clientes.tsx` - adicionar TouchableOpacity com router.push
- `app/(app)/chamados.tsx` - adicionar TouchableOpacity com router.push
- `app/(app)/historico.tsx` - adicionar TouchableOpacity com router.push
- `app/(app)/agenda.tsx` - adicionar TouchableOpacity com router.push condicional

#### Exemplo de implementação:
```typescript
<TouchableOpacity onPress={() => router.push(`/detalhes/cliente/${cliente.id}`)}>
  {/* Card do cliente */}
</TouchableOpacity>
```

---

## 🔍 FASE 2: Detalhes Individuais - Queries Específicas

### 2.1 - Criar Services de Detalhe
**Objetivo**: Adicionar funções para buscar entidades por ID

#### Tarefas:
- [ ] `client.service.ts`: adicionar `fetchClientById(id: string)`
- [ ] `chamado.service.ts`: adicionar `fetchChamadoById(id: string)`
- [ ] `instalacao.service.ts`: adicionar `fetchInstalacaoById(id: string)`

#### Arquivos a criar/modificar:
- `services/api/client.service.ts`
- `services/api/chamado.service.ts`
- `services/api/instalacao.service.ts`

#### Endpoints:
```typescript
// GET /api/v1/clientes/{id}
// GET /api/v1/chamados/{id}
// GET /api/v1/instalacoes/{id}
```

---

### 2.2 - Criar Hooks de Detalhe com React Query
**Objetivo**: Hooks para buscar e cachear dados de detalhes

#### Tarefas:
- [ ] `useClientDetail(id)` - query individual com initialData da lista
- [ ] `useChamadoDetail(id)` - query individual com initialData da lista
- [ ] `useInstalacaoDetail(id)` - query individual com initialData da lista

#### Arquivos a criar:
- `hooks/useClientDetail.ts`
- `hooks/useChamadoDetail.ts`
- `hooks/useInstalacaoDetail.ts`

#### Estratégia de Cache:
```typescript
// Exemplo de hook com initialData da lista
useQuery({
  queryKey: ['client', id],
  queryFn: () => fetchClientById(id),
  initialData: () => {
    // Usa dados da lista como preview inicial (evita loading)
    return queryClient
      .getQueryData<Client[]>(CLIENTS_QUERY_KEY)
      ?.find(c => c.id === id);
  },
  staleTime: 1000 * 60 * 2, // 2min - detalhes precisam ser mais fresh que listas
  gcTime: 1000 * 60 * 10, // 10 minutos
})
```

#### Benefícios:
- ✅ Exibição instantânea usando dados da lista
- ✅ Revalidação em background
- ✅ Cache individual por ID

---

### 2.3 - Implementar Telas de Detalhes (Read-only)
**Objetivo**: Criar interfaces para visualizar dados completos

#### Tarefas:
- [ ] ClienteDetalhes: layout com todos os campos
- [ ] ChamadoDetalhes: layout com todos os campos
- [ ] InstalacaoDetalhes: layout com todos os campos
- [ ] Loading states (skeleton screens)
- [ ] Error states com retry

#### Arquivos a criar:
- `app/(app)/detalhes/cliente/[id].tsx`
- `app/(app)/detalhes/chamado/[id].tsx`
- `app/(app)/detalhes/instalacao/[id].tsx`

#### Componentes de UI (opcional):
- `components/detalhes/ClienteCard.tsx`
- `components/detalhes/ChamadoCard.tsx`
- `components/detalhes/InstalacaoCard.tsx`

#### Layout sugerido:
```
┌─────────────────────┐
│ Header com título   │
├─────────────────────┤
│ Informações Básicas │
│ ┌─────────────────┐ │
│ │ Nome:           │ │
│ │ CPF/CNPJ:       │ │
│ │ Telefone:       │ │
│ └─────────────────┘ │
├─────────────────────┤
│ Endereço            │
│ ┌─────────────────┐ │
│ │ Rua, número     │ │
│ │ Bairro, cidade  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 🔄 FASE 3: Navegação Cruzada

### 3.1 - Links de Navegação Cruzada
**Objetivo**: Permitir navegar entre entidades relacionadas

#### Tarefas Cliente → Chamados:
- [ ] ClienteDetalhes: adicionar seção "Chamados Abertos"
- [ ] ClienteDetalhes: adicionar seção "Histórico de Chamados"
- [ ] Exibir lista compacta (últimos 5 chamados)
- [ ] Botão "Ver todos" para lista completa

#### Tarefas Chamado → Cliente:
- [ ] ChamadoDetalhes: adicionar card do cliente
- [ ] InstalacaoDetalhes: adicionar card do cliente
- [ ] Card clicável para abrir ClienteDetalhes

#### Arquivos a modificar:
- `app/(app)/detalhes/cliente/[id].tsx`
- `app/(app)/detalhes/chamado/[id].tsx`
- `app/(app)/detalhes/instalacao/[id].tsx`

---

### 3.2 - Queries Relacionadas
**Objetivo**: Buscar entidades relacionadas

#### Tarefas:
- [ ] `useChamadosByClientId(clientId)` - lista de chamados de um cliente
- [ ] Adicionar filtro no service existente ou criar endpoint específico
- [ ] Reutilizar `useClientDetail(id)` dentro de ChamadoDetalhes

#### Arquivos a criar:
- `hooks/useChamadosByClientId.ts`

#### Estratégia:
```typescript
// Opção 1: Filtrar localmente (se lista pequena)
const chamadosDoCliente = chamados?.filter(c => c.cliente_id === clientId)

// Opção 2: Query específica (se lista grande)
useQuery({
  queryKey: ['chamados', 'byClient', clientId],
  queryFn: () => fetchChamadosByClientId(clientId),
})
```

---

## ✏️ FASE 4: Mutações e Sincronização

### 4.1 - Criar Mutation Services
**Objetivo**: Adicionar funções para atualizar dados

#### Tarefas:
- [ ] `client.service.ts`: `updateClient(id, data)`
- [ ] `chamado.service.ts`: `updateChamado(id, data)`
- [ ] `chamado.service.ts`: `fecharChamado(id, data)` - caso especial
- [ ] `instalacao.service.ts`: `updateInstalacao(id, data)`

#### Arquivos a modificar:
- `services/api/client.service.ts`
- `services/api/chamado.service.ts`
- `services/api/instalacao.service.ts`

#### Endpoints:
```typescript
// PUT /api/v1/clientes/{id}
// PUT /api/v1/chamados/{id}
// POST /api/v1/chamados/{id}/fechar
// PUT /api/v1/instalacoes/{id}
```

---

### 4.2 - Criar Hooks de Mutação
**Objetivo**: Hooks para editar dados e sincronizar cache

#### Tarefas:
- [ ] `useUpdateClient()` - mutação com cache update
- [ ] `useUpdateChamado()` - mutação com cache update
- [ ] `useFecharChamado()` - mutação complexa (múltiplas invalidações)
- [ ] `useUpdateInstalacao()` - mutação com cache update

#### Arquivos a criar:
- `hooks/useUpdateClient.ts`
- `hooks/useUpdateChamado.ts`
- `hooks/useFecharChamado.ts`
- `hooks/useUpdateInstalacao.ts`

#### Estratégia de Cache Update:
```typescript
useMutation({
  mutationFn: (data) => updateClient(id, data),
  onMutate: async (newData) => {
    // 1. Cancelar queries em andamento
    await queryClient.cancelQueries(['client', id]);
    
    // 2. Snapshot do estado anterior (para rollback)
    const previousData = queryClient.getQueryData(['client', id]);
    
    // 3. Update otimista (UI atualiza antes do servidor)
    queryClient.setQueryData(['client', id], newData);
    
    return { previousData };
  },
  onSuccess: (updatedClient) => {
    // 4. Atualizar query de detalhe com dados do servidor
    queryClient.setQueryData(['client', id], updatedClient);
    
    // 5. Atualizar item na lista (evita invalidação completa)
    queryClient.setQueryData(CLIENTS_QUERY_KEY, (old) =>
      old?.map(c => c.id === id ? updatedClient : c)
    );
    
    // 6. Invalidar queries relacionadas (se necessário)
    // queryClient.invalidateQueries(['chamados', 'byClient', id]);
  },
  onError: (err, newData, context) => {
    // 7. Rollback em caso de erro
    queryClient.setQueryData(['client', id], context.previousData);
  },
})
```

#### Mutação Especial - Fechar Chamado:
```typescript
useFecharChamado({
  onSuccess: () => {
    // 1. Invalidar agenda (remover da lista de abertos)
    queryClient.invalidateQueries(agendaQueryKeys.all);
    
    // 2. Invalidar chamados abertos
    queryClient.invalidateQueries(chamadosQueryKeys.list('aberto'));
    
    // 3. Invalidar histórico (adicionar aos fechados)
    queryClient.invalidateQueries(chamadosFechadosQueryKeys.all);
    
    // 4. Navegar de volta ou mostrar sucesso
    router.back();
  }
})
```

---

### 4.3 - Implementar Formulários de Edição
**Objetivo**: Permitir edição de dados nas telas de detalhes

#### Tarefas:
- [ ] ClienteDetalhes: adicionar modo edição
- [ ] ClienteDetalhes: validação de formulário (react-hook-form?)
- [ ] ChamadoDetalhes: adicionar modo edição
- [ ] ChamadoDetalhes: botão "Fechar Chamado" com modal
- [ ] InstalacaoDetalhes: adicionar modo edição

#### Arquivos a modificar:
- `app/(app)/detalhes/cliente/[id].tsx`
- `app/(app)/detalhes/chamado/[id].tsx`
- `app/(app)/detalhes/instalacao/[id].tsx`

#### UX sugerida:
```
Estado normal:
[Editar] botão no header

Estado de edição:
[Cancelar] [Salvar] botões no header
Campos tornam-se editáveis
```

#### Validação:
- Campos obrigatórios marcados
- Validação inline
- Mensagens de erro claras
- Disable botão Salvar se inválido

---

## 🚀 FASE 5: Otimizações e UX

### 5.1 - Invalidação Inteligente
**Objetivo**: Atualizar apenas o necessário

#### Estratégias:

**Fechar Chamado**:
```typescript
// ❌ Evitar invalidar tudo
queryClient.invalidateQueries();

// ✅ Invalidar apenas relacionados
queryClient.invalidateQueries(agendaQueryKeys.all);
queryClient.invalidateQueries(chamadosQueryKeys.list('aberto'));
queryClient.invalidateQueries(chamadosFechadosQueryKeys.all);
```

**Editar Cliente**:
```typescript
// ✅ Apenas update de cache (sem refetch)
queryClient.setQueryData(['client', id], updatedClient);
queryClient.setQueryData(CLIENTS_QUERY_KEY, (old) =>
  old?.map(c => c.id === id ? updatedClient : c)
);
```

**Editar Chamado (data de visita mudou)**:
```typescript
// ✅ Invalidar agenda (ordem pode ter mudado)
queryClient.invalidateQueries(agendaQueryKeys.all);
```

---

### 5.2 - Estados Otimistas
**Objetivo**: UI responsiva antes da confirmação do servidor

#### Tarefas:
- [ ] Implementar `onMutate` para update otimista
- [ ] Implementar rollback em `onError`
- [ ] Toast notifications de sucesso
- [ ] Toast notifications de erro com retry

#### Arquivos a criar:
- `hooks/useToast.ts` ou usar lib (react-native-toast-message?)

#### Exemplo:
```typescript
const mutation = useUpdateClient(id);

const handleSave = async (data) => {
  try {
    await mutation.mutateAsync(data);
    toast.success('Cliente atualizado com sucesso!');
    router.back();
  } catch (error) {
    toast.error('Erro ao atualizar cliente');
  }
}
```

---

### 5.3 - Performance e Polish
**Objetivo**: Experiência suave e profissional

#### Tarefas:
- [ ] Loading skeletons consistentes
- [ ] Debounce em campos de busca
- [ ] Prefetch de detalhes ao scroll (opcional)
- [ ] Animações de transição
- [ ] Pull-to-refresh em detalhes
- [ ] Empty states informativos

#### Prefetch (opcional):
```typescript
// Ao passar pelo item no scroll, prefetch dos detalhes
const prefetchClient = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClientById(id),
  });
};
```

---

## 📐 Arquitetura Final

```
app/(app)/
  ├── (tabs)/                        [Tab Navigator]
  │   ├── clientes.tsx              [Lista] → onPress → detalhes/cliente/[id]
  │   ├── chamados.tsx              [Lista] → onPress → detalhes/chamado/[id]
  │   ├── agenda.tsx                [Lista] → onPress → detalhes/chamado|instalacao/[id]
  │   └── historico.tsx             [Lista] → onPress → detalhes/chamado/[id]
  └── detalhes/                      [Stack para detalhes]
      ├── cliente/[id].tsx          [View + Edit] → Link para chamados
      ├── chamado/[id].tsx          [View + Edit + Fechar] → Link para cliente
      └── instalacao/[id].tsx       [View + Edit] → Link para cliente

hooks/
  ├── useClients.ts                  ✅ [Existente]
  ├── useChamados.ts                 ✅ [Existente]
  ├── useAgenda.ts                   ✅ [Existente]
  ├── useChamadosFechados.ts         ✅ [Existente]
  ├── useClientDetail.ts             🆕 [Query individual]
  ├── useChamadoDetail.ts            🆕 [Query individual]
  ├── useInstalacaoDetail.ts         🆕 [Query individual]
  ├── useChamadosByClientId.ts       🆕 [Query relacionada]
  ├── useUpdateClient.ts             🆕 [Mutação + cache sync]
  ├── useUpdateChamado.ts            🆕 [Mutação + cache sync]
  ├── useUpdateInstalacao.ts         🆕 [Mutação + cache sync]
  └── useFecharChamado.ts            🆕 [Mutação especial]

services/api/
  ├── client.service.ts              🔄 [+ fetchById, update]
  ├── chamado.service.ts             🔄 [+ fetchById, update, fechar]
  ├── instalacao.service.ts          🔄 [+ fetchById, update]
  └── agenda.service.ts              ✅ [Existente]

types/
  ├── client.ts                      ✅ [Existente]
  ├── chamado.ts                     ✅ [Existente]
  ├── instalacao.ts                  ✅ [Existente]
  └── navigation.ts                  🆕 [Tipos de navegação]
```

---

## 🚦 Ordem de Implementação Recomendada

### Sprint 1: Fundação (Dias 1-2)
1. ✅ Analisar navegação atual
2. ⬜ Configurar Stack Navigation
3. ⬜ Criar tipos TypeScript de navegação
4. ⬜ Criar telas skeleton de detalhes
5. ⬜ Adicionar onPress nas listas

**Entrega**: Clicar em item leva para tela vazia de detalhes

---

### Sprint 2: Detalhes Read-only (Dias 3-4)
6. ⬜ Services `fetchById` (cliente, chamado, instalacao)
7. ⬜ Hooks `useDetail` com initialData
8. ⬜ Implementar layout de detalhes (read-only)
9. ⬜ Loading e error states

**Entrega**: Visualização completa de detalhes sem edição

---

### Sprint 3: Navegação Cruzada (Dia 5)
10. ⬜ Link Cliente → Chamados
11. ⬜ Link Chamado → Cliente
12. ⬜ Hook `useChamadosByClientId`

**Entrega**: Navegação bidirecional funcionando

---

### Sprint 4: Edição e Mutações (Dias 6-7)
13. ⬜ Services `update` (cliente, chamado, instalacao)
14. ⬜ Hooks de mutação com cache sync
15. ⬜ Formulários de edição
16. ⬜ Validação e feedback

**Entrega**: Edição de dados com sincronização

---

### Sprint 5: Fechar Chamado (Dia 8)
17. ⬜ Service `fecharChamado`
18. ⬜ Hook `useFecharChamado` com multi-invalidation
19. ⬜ Modal de confirmação
20. ⬜ Sincronização agenda → histórico

**Entrega**: Feature completa de fechar chamado

---

### Sprint 6: Polimento (Dias 9-10)
21. ⬜ Estados otimistas
22. ⬜ Toasts e notificações
23. ⬜ Animações e transições
24. ⬜ Testes finais
25. ⬜ Ajustes de UX

**Entrega**: Produto polido e pronto para produção

---

## ⚠️ Pontos de Atenção

### 1. Deep Linking
- Mesma rota `/detalhes/chamado/123` pode vir de:
  - Lista de Chamados Abertos
  - Agenda
  - Histórico
  - Detalhes de Cliente
- **Solução**: Usar `initialData` da query mais recente

### 2. Cache Staleness
- Detalhes devem ter `staleTime` menor que listas
- Listas: 5-30min
- Detalhes: 2-5min
- **Razão**: Evitar dados desatualizados após edição

### 3. Navigation Stack
- Expo Router usa file-based routing
- Stack automático com dynamic routes `[id].tsx`
- Tipos devem ser definidos para type-safety

### 4. TypeScript Strictness
```typescript
// ✅ Bom
const { id } = useLocalSearchParams<{ id: string }>();

// ❌ Evitar
const { id } = useLocalSearchParams();
```

### 5. Fechamento de Chamado
- Invalidar múltiplas queries
- Verificar se chamado está na Agenda
- Adicionar ao Histórico
- Não bloquear UI durante o processo

### 6. Performance
- Listas de clientes são grandes (3000+)
- Usar `initialData` para evitar loading desnecessário
- Considerar virtualização se performance cair

---

## 📚 Referências Técnicas

### React Query Patterns
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Initial Query Data](https://tanstack.com/query/latest/docs/react/guides/initial-query-data)
- [Invalidation from Mutations](https://tanstack.com/query/latest/docs/react/guides/invalidations-from-mutations)

### Expo Router
- [Dynamic Routes](https://docs.expo.dev/router/create-pages/#dynamic-routes)
- [TypeScript](https://docs.expo.dev/router/reference/typed-routes/)
- [Navigation](https://docs.expo.dev/router/navigating-pages/)

### React Hook Form (se usar)
- [Getting Started](https://react-hook-form.com/get-started)
- [React Native](https://react-hook-form.com/get-started#ReactNative)

---

## 📊 Métricas de Sucesso

- [ ] Navegação instantânea (< 100ms) usando initialData
- [ ] Sincronização correta após edição (lista reflete mudanças)
- [ ] Sem over-fetching (invalidar apenas necessário)
- [ ] UX suave com estados otimistas
- [ ] Zero bugs de navegação circular
- [ ] Código testável e manutenível

---

## 🎉 Resultado Final Esperado

Usuário poderá:
1. ✅ Clicar em qualquer entidade e ver detalhes completos
2. ✅ Editar dados e ver refletido nas listagens
3. ✅ Navegar de Cliente → Chamados e vice-versa
4. ✅ Fechar chamados e ver migrar para histórico
5. ✅ Experiência fluida sem loadings desnecessários
6. ✅ Feedback claro de sucesso/erro em operações

---

**Próximos Passos**: Iniciar implementação pela Sprint 1 - Fundação
