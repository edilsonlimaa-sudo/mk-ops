# Plano de Implementação Gradual - Mutations

Plano para adicionar operações de escrita (fechar/reabrir chamados, concluir instalações) ao app MK-Auth Mobile.

## Contexto

**Endpoints disponíveis:**
- `POST /api/chamado/fechar/uuid={uuid}` - Fecha um chamado
- `POST /api/chamado/reabrir/uuid={uuid}` - Reabre um chamado fechado
- `POST /api/instalacao/fechar/uuid={uuid}` - Conclui uma instalação

**Arquitetura preparada:**
- ✅ Services organizados por domínio
- ✅ Hooks estruturados com query keys centralizados
- ✅ Barrel exports configurados
- ✅ Cache invalidation pronto (React Query)

---

## Fase 1: Fechar Chamado

**Objetivo:** Implementar o fluxo completo de fechar um chamado e validar o padrão antes de escalar.

### 1.1 Service Layer
**Arquivo:** `services/api/chamado/chamado.service.ts`

Adicionar função no final do arquivo:
```typescript
/**
 * Fecha um chamado aberto
 * @param uuid - UUID do chamado (uuid_suporte)
 */
export const fecharChamado = async (uuid: string): Promise<void> => {
  console.log(`🔒 [ChamadoService] Fechando chamado ${uuid}...`);
  await apiClient.post(`/api/chamado/fechar/uuid=${uuid}`);
  console.log(`✅ [ChamadoService] Chamado ${uuid} fechado com sucesso`);
};
```

### 1.2 Hook Layer
**Arquivo:** `hooks/chamado/useFechaChamado.ts` (novo)

Criar custom hook com React Query mutation:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fecharChamado } from '@/services/api/chamado';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';

export const useFechaChamado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => fecharChamado(uuid),
    onSuccess: () => {
      // Invalidar agenda (chamado sai da lista de abertos)
      queryClient.invalidateQueries({ queryKey: agendaKeys.all() });
      // Invalidar histórico (chamado aparece nos fechados)
      queryClient.invalidateQueries({ queryKey: historicoKeys.all() });
    },
  });
};
```

**Atualizar:** `hooks/chamado/index.ts`
```typescript
export * from './useChamadoDetail';
export * from './useFechaChamado'; // adicionar
export * from './keys';
```

### 1.3 UI Layer
**Arquivo:** `app/(app)/detalhes/chamado/[id].tsx`

Adicionar botão "Fechar Chamado" na tela de detalhes:
```typescript
import { useFechaChamado } from '@/hooks/chamado';

// Dentro do componente
const fechaChamadoMutation = useFechaChamado();

// No JSX, após informações do chamado
<View style={{ marginTop: 20 }}>
  <TouchableOpacity
    onPress={() => fechaChamadoMutation.mutate(chamado.uuid_suporte)}
    disabled={fechaChamadoMutation.isPending}
    style={{
      backgroundColor: fechaChamadoMutation.isPending ? '#ccc' : '#10b981',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>
      {fechaChamadoMutation.isPending ? 'Fechando...' : 'Fechar Chamado'}
    </Text>
  </TouchableOpacity>
</View>
```

### 1.4 Testes
- [ ] Abrir um chamado da agenda
- [ ] Clicar em "Fechar Chamado"
- [ ] Verificar que chamado desaparece da agenda
- [ ] Verificar que chamado aparece no histórico
- [ ] Testar com app em background e reabrir

---

## Fase 2: Reabrir Chamado

**Objetivo:** Replicar o padrão validado para operação inversa.

### 2.1 Service Layer
**Arquivo:** `services/api/chamado/chamado.service.ts`

Adicionar função:
```typescript
/**
 * Reabre um chamado fechado
 * @param uuid - UUID do chamado (uuid_suporte)
 */
export const reabrirChamado = async (uuid: string): Promise<void> => {
  console.log(`🔓 [ChamadoService] Reabrindo chamado ${uuid}...`);
  await apiClient.post(`/api/chamado/reabrir/uuid=${uuid}`);
  console.log(`✅ [ChamadoService] Chamado ${uuid} reaberto com sucesso`);
};
```

### 2.2 Hook Layer
**Arquivo:** `hooks/chamado/useReabrirChamado.ts` (novo)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reabrirChamado } from '@/services/api/chamado';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';

export const useReabrirChamado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => reabrirChamado(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaKeys.all() });
      queryClient.invalidateQueries({ queryKey: historicoKeys.all() });
    },
  });
};
```

**Atualizar:** `hooks/chamado/index.ts`
```typescript
export * from './useChamadoDetail';
export * from './useFechaChamado';
export * from './useReabrirChamado'; // adicionar
export * from './keys';
```

### 2.3 UI Layer
**Arquivo:** `app/(app)/detalhes/chamado/[id].tsx`

Adicionar lógica condicional para mostrar botão correto baseado no status:
```typescript
import { useFechaChamado, useReabrirChamado } from '@/hooks/chamado';

const fechaMutation = useFechaChamado();
const reabreMutation = useReabrirChamado();

const isChamadoFechado = chamado.status === 'fechado'; // ajustar conforme tipo

{isChamadoFechado ? (
  <TouchableOpacity
    onPress={() => reabreMutation.mutate(chamado.uuid_suporte)}
    disabled={reabreMutation.isPending}
    style={{ backgroundColor: '#3b82f6', ... }}
  >
    <Text>{reabreMutation.isPending ? 'Reabrindo...' : 'Reabrir Chamado'}</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity
    onPress={() => fechaMutation.mutate(chamado.uuid_suporte)}
    disabled={fechaMutation.isPending}
    style={{ backgroundColor: '#10b981', ... }}
  >
    <Text>{fechaMutation.isPending ? 'Fechando...' : 'Fechar Chamado'}</Text>
  </TouchableOpacity>
)}
```

### 2.4 Testes
- [ ] Abrir um chamado fechado do histórico
- [ ] Clicar em "Reabrir Chamado"
- [ ] Verificar que chamado desaparece do histórico
- [ ] Verificar que chamado aparece na agenda
- [ ] Testar fluxo completo: abrir → fechar → reabrir

---

## Fase 3: Fechar Instalação

**Objetivo:** Completar o conjunto de mutations com instalações.

### 3.1 Service Layer
**Arquivo:** `services/api/instalacao/instalacao.service.ts`

```typescript
/**
 * Conclui uma instalação aberta
 * @param uuid - UUID da instalação (uuid_solic)
 */
export const fecharInstalacao = async (uuid: string): Promise<void> => {
  console.log(`🔒 [InstalacaoService] Concluindo instalação ${uuid}...`);
  await apiClient.post(`/api/instalacao/fechar/uuid=${uuid}`);
  console.log(`✅ [InstalacaoService] Instalação ${uuid} concluída com sucesso`);
};
```

### 3.2 Hook Layer
**Arquivo:** `hooks/instalacao/useFechaInstalacao.ts` (novo)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fecharInstalacao } from '@/services/api/instalacao';
import { agendaKeys } from '../agenda/keys';
import { historicoKeys } from '../historico/keys';

export const useFechaInstalacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => fecharInstalacao(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agendaKeys.all() });
      queryClient.invalidateQueries({ queryKey: historicoKeys.all() });
    },
  });
};
```

**Atualizar:** `hooks/instalacao/index.ts`
```typescript
export * from './useInstalacaoDetail';
export * from './useFechaInstalacao'; // adicionar
export * from './keys';
```

### 3.3 UI Layer
**Arquivo:** `app/(app)/detalhes/instalacao/[id].tsx`

```typescript
import { useFechaInstalacao } from '@/hooks/instalacao';

const fechaInstalacaoMutation = useFechaInstalacao();

<TouchableOpacity
  onPress={() => fechaInstalacaoMutation.mutate(instalacao.uuid_solic)}
  disabled={fechaInstalacaoMutation.isPending}
  style={{ backgroundColor: '#10b981', ... }}
>
  <Text>
    {fechaInstalacaoMutation.isPending ? 'Concluindo...' : 'Concluir Instalação'}
  </Text>
</TouchableOpacity>
```

### 3.4 Testes
- [ ] Abrir uma instalação da agenda
- [ ] Clicar em "Concluir Instalação"
- [ ] Verificar que instalação desaparece da agenda
- [ ] Verificar que instalação aparece no histórico
- [ ] Testar múltiplas instalações

---

## Fase 4: Polimento (Opcional)

### 4.1 Error Handling
Adicionar tratamento de erros em todos os hooks:
```typescript
onError: (error) => {
  console.error('❌ Erro ao fechar chamado:', error);
  // TODO: Mostrar toast/alert para usuário
},
```

### 4.2 Loading States
- Desabilitar navegação durante operação
- Mostrar spinner no botão
- Bloquear múltiplos cliques

### 4.3 Optimistic Updates
Atualizar UI imediatamente antes da resposta do servidor:
```typescript
onMutate: async (uuid) => {
  await queryClient.cancelQueries({ queryKey: agendaKeys.all() });
  // Remover item do cache otimisticamente
  const previousData = queryClient.getQueryData(agendaKeys.all());
  // ... manipular cache
  return { previousData };
},
onError: (err, uuid, context) => {
  // Reverter em caso de erro
  queryClient.setQueryData(agendaKeys.all(), context?.previousData);
},
```

### 4.4 Confirmação
Adicionar modal "Tem certeza?" antes de ações críticas:
```typescript
<Modal visible={showConfirm}>
  <Text>Deseja realmente fechar este chamado?</Text>
  <Button onPress={confirmarFechamento} title="Sim" />
  <Button onPress={() => setShowConfirm(false)} title="Cancelar" />
</Modal>
```

### 4.5 Feedback Visual
- Toast de sucesso após operação
- Animação de transição
- Badge indicando status mutável

---

## Checklist Geral

### Antes de começar
- [x] Services organizados por domínio
- [x] Hooks estruturados
- [x] Query keys centralizados
- [x] App testado e funcionando

### Fase 1 - Fechar Chamado
- [ ] Service function implementada
- [ ] Hook criado com invalidation
- [ ] UI atualizada com botão
- [ ] Testes manuais passando

### Fase 2 - Reabrir Chamado
- [ ] Service function implementada
- [ ] Hook criado
- [ ] UI com lógica condicional
- [ ] Testes de fluxo completo

### Fase 3 - Fechar Instalação
- [ ] Service function implementada
- [ ] Hook criado
- [ ] UI atualizada
- [ ] Testes finais

### Fase 4 - Polimento
- [ ] Error handling implementado
- [ ] Loading states refinados
- [ ] Optimistic updates (opcional)
- [ ] Modais de confirmação (opcional)

---

## Notas Importantes

**Cache Invalidation:**
Sempre invalidar `agendaKeys.all()` e `historicoKeys.all()` para garantir que listas sejam atualizadas após mutations.

**UUIDs:**
- Chamado usa `uuid_suporte`
- Instalação usa `uuid_solic`

**Status:**
Verificar campo correto no tipo `Chamado` e `Instalacao` para determinar se está aberto/fechado.

**Erro Comum:**
Se mutation não refletir na UI, verificar:
1. Query keys corretos na invalidation
2. Hooks usando mesmos query keys nas queries
3. React Query DevTools para debug

**Performance:**
Com optimistic updates (Fase 4), UX fica instantânea. Sem eles, esperar ~500ms de latência da API.
