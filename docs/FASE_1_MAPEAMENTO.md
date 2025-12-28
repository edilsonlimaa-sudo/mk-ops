# 🗺️ Fase 1: Mapeamento Detalhado - Navegação e Estrutura

**Data**: 22 de Dezembro de 2025  
**Status**: ✅ CONCLUÍDA

---

## 📊 Situação Atual

### Estrutura de Navegação Existente

```
app/
├── _layout.tsx                     [Root Layout - Stack]
│   ├── (auth)/                     [Grupo de autenticação]
│   │   ├── _layout.tsx            [Stack]
│   │   └── login.tsx              [Tela de login]
│   └── (app)/                      [Grupo da aplicação]
│       ├── _layout.tsx            [Tabs Navigator]
│       ├── index.tsx              [Home - Tab]
│       ├── clientes.tsx           [Clientes - Tab]
│       ├── chamados.tsx           [Chamados - Hidden]
│       ├── agenda.tsx             [Agenda - Tab]
│       └── historico.tsx          [Histórico - Tab]
```

### ✅ O que já funciona:
- Root Stack Navigator com grupos `(auth)` e `(app)`
- Tab Navigator dentro de `(app)` com 4 tabs visíveis
- Navegação entre tabs funcional
- Redirecionamento automático baseado em autenticação

### ❌ O que falta:
- Navegação para telas de detalhes (não existe ainda)
- Dynamic routes para receber parâmetros (id)
- Tipos TypeScript para navegação type-safe
- Capacidade de fazer "push" das listas para detalhes

---

## 🎯 Objetivo da Fase 1

**Criar a infraestrutura básica de navegação para permitir:**
1. Clicar em um item da lista e navegar para tela de detalhes
2. Passar parâmetros (id) via rota
3. Type-safety na navegação
4. Telas skeleton de detalhes funcionais (sem dados ainda)

---

## 📋 Tarefas da Fase 1

### ✅ TAREFA 1.1: Analisar Estrutura Atual
**Status**: ✅ CONCLUÍDA

**Descobertas**:
- Expo Router está configurado corretamente
- Já existe Root Stack Navigator
- Tabs estão dentro do grupo `(app)`
- File-based routing está ativo
- Não há tipos de navegação definidos ainda

---

### ✅ TAREFA 1.2: Criar Tipos de Navegação TypeScript
**Status**: ✅ CONCLUÍDA  
**Objetivo**: Type-safety para navegação com parâmetros

#### Arquivos criados:
- ✅ `types/navigation.ts`

#### Conteúdo proposto:

```typescript
/**
 * Navigation types for type-safe routing
 * Based on Expo Router v3+ with file-based routing
 */

/**
 * App Stack navigation params
 * Used for navigating to detail screens from tabs
 */
export type AppStackParamList = {
  // Tabs (no params)
  '(app)': undefined;
  '(app)/index': undefined;
  '(app)/clientes': undefined;
  '(app)/chamados': undefined;
  '(app)/agenda': undefined;
  '(app)/historico': undefined;

  // Detail screens (with id param)
  '(app)/detalhes/cliente/[id]': { id: string };
  '(app)/detalhes/chamado/[id]': { id: string };
  '(app)/detalhes/instalacao/[id]': { id: string };
};

/**
 * Helper types for useLocalSearchParams
 */
export type ClienteDetalhesParams = { id: string };
export type ChamadoDetalhesParams = { id: string };
export type InstalacaoDetalhesParams = { id: string };

/**
 * Union type for all detail params
 */
export type DetalhesParams = 
  | ClienteDetalhesParams 
  | ChamadoDetalhesParams 
  | InstalacaoDetalhesParams;
```

#### Validação:
- [x] Tipos compilam sem erros
- [x] Autocomplete funciona no VSCode
- [x] `useLocalSearchParams<ClienteDetalhesParams>()` funciona

---

### ✅ TAREFA 1.3: Criar Estrutura de Pastas para Detalhes
**Status**: ✅ CONCLUÍDA  
**Objetivo**: Organizar telas de detalhes em uma estrutura escalável

#### Estrutura proposta:

```
app/(app)/
├── _layout.tsx                     [Tabs Navigator - EXISTENTE]
├── index.tsx                       [Home - EXISTENTE]
├── clientes.tsx                    [Lista - EXISTENTE]
├── chamados.tsx                    [Lista - EXISTENTE]
├── agenda.tsx                      [Lista - EXISTENTE]
├── historico.tsx                   [Lista - EXISTENTE]
└── detalhes/                       [NOVA PASTA]
    ├── cliente/
    │   └── [id].tsx               [Dynamic route - NOVO]
    ├── chamado/
    │   └── [id].tsx               [Dynamic route - NOVO]
    └── instalacao/
        └── [id].tsx               [Dynamic route - NOVO]
```

#### Por que essa estrutura?
- ✅ Agrupa detalhes em uma pasta dedicada
- ✅ Dynamic routes `[id].tsx` capturam o parâmetro automaticamente
- ✅ Separado por tipo de entidade (escalável)
- ✅ Não interfere com Tabs existentes
- ✅ Permite Stack navigation automático

#### Alternativa considerada (descartada):
```
app/(app)/
├── clientes/
│   ├── index.tsx      [Lista]
│   └── [id].tsx       [Detalhes]
```
❌ Problema: Conflita com `clientes.tsx` existente no Expo Router

---
✅ TAREFA 1.4: Criar Telas Skeleton de Detalhes
**Status**: ✅ CONCLUÍDA  
### ⬜ TAREFA 1.4: Criar Telas Skeleton de Detalhes
**Objetivo**: Telas básicas que recebem ID e exibem loading/skeleton

#### Arquivo 1: `app/(app)/detalhes/cliente/[id].tsx`

```typescript
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ClienteDetalhesParams } from '@/types/navigation';

export default function ClienteDetalhesScreen() {
  const { id } = useLocalSearchParams<ClienteDetalhesParams>();
  const router = useRouter();

  // Fase 1: apenas skeleton, sem dados reais
  const isLoading = false;

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Detalhes do Cliente',
          headerBackTitle: 'Voltar',
        }} 
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4">Carregando...</Text>
          </View>
        ) : (
          <View className="p-4">
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Cliente ID: {id}
              </Text>
              <Text className="text-gray-600">
                🚧 Tela em construção - Fase 1 (Skeleton)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-500 rounded-lg p-4 items-center"
            >
              <Text className="text-white font-semibold">Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
```

#### Arquivo 2: `app/(app)/detalhes/chamado/[id].tsx`

```typescript
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ChamadoDetalhesParams } from '@/types/navigation';

export default function ChamadoDetalhesScreen() {
  const { id } = useLocalSearchParams<ChamadoDetalhesParams>();
  const router = useRouter();

  const isLoading = false;

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Detalhes do Chamado',
          headerBackTitle: 'Voltar',
        }} 
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4">Carregando...</Text>
          </View>
        ) : (
          <View className="p-4">
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Chamado ID: {id}
              </Text>
              <Text className="text-gray-600">
                🚧 Tela em construção - Fase 1 (Skeleton)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-500 rounded-lg p-4 items-center"
            >
              <Text className="text-white font-semibold">Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
```

#### Arquivo 3: `app/(app)/detalhes/instalacao/[id].tsx`

```typescript
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { InstalacaoDetalhesParams } from '@/types/navigation';

export default function InstalacaoDetalhesScreen() {
  const { id } = useLocalSearchParams<InstalacaoDetalhesParams>();
  const router = useRouter();

  const isLoading = false;

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Detalhes da Instalação',
          headerBackTitle: 'Voltar',
        }} 
      />
      <SafeAreaView className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-600 mt-4">Carregando...</Text>
          </View>
        ) : (
          <View className="p-4">
            <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <Text className="text-lg font-semibold text-gray-800 mb-2">
                Instalação ID: {id}
              </Text>
              <Text className="text-gray-600">
                🚧 Tela em construção - Fase 1 (Skeleton)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-blue-500 rounded-lg p-4 items-center"
            >
              <Text className="text-white font-semibold">Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}
```

###x] Arquivos criados na estrutura correta
- [x] Imports do Expo Router funcionam
- [x] `useLocalSearchParams` captura o ID
- [x] Header exibe corretamente (via Stack Layout)
- [x] Botão voltar funciona
- [x] Telas compilam sem erros

---

### ✅ TAREFA 1.5: Adicionar Navegação nas Listas
**Status**: ✅ CONCLUÍDA  
### ⬜ TAREFA 1.5: Adicionar Navegação nas Listas
**Objetivo**: Tornar cards clicáveis e navegar para detalhes

#### Modificação 1: `app/(app)/clientes.tsx`

**Adicionar import**:
```typescript
import { useRouter } from 'expo-router';
```

**Adicionar no componente**:
```typescript
const router = useRouter();
```

**Envolver card em TouchableOpacity** (dentro do renderItem do FlatList):
```typescript
<TouchableOpacity 
  onPress={() => router.push(`/detalhes/cliente/${cliente.id}`)}
  activeOpacity={0.7}
>
  {/* Card existente aqui */}
</TouchableOpacity>
```

**Localização aproximada**: Linha ~150-200 (dentro do renderItem)

---

#### Modificação 2: `app/(app)/chamados.tsx`

**Adicionar import**:
```typescript
import { useRouter } from 'expo-router';
```

**Adicionar no componente**:
```typescript
const router = useRouter();
```

**Envolver card em TouchableOpacity** (dentro do renderItem do FlatList):
```typescript
<TouchableOpacity 
  onPress={() => router.push(`/detalhes/chamado/${chamado.id}`)}
  activeOpacity={0.7}
>
  {/* Card existente aqui */}
</TouchableOpacity>
```

---

#### Modificação 3: `app/(app)/agenda.tsx`

**Adicionar import**:
```typescript
import { useRouter } from 'expo-router';
```

**Adicionar no componente**:
```typescript
const router = useRouter();
```

**Envolver card em TouchableOpacity com lógica condicional**:
```typescript
<TouchableOpacity 
  onPress={() => {
    if (isChamado(servico)) {
      router.push(`/detalhes/chamado/${servico.id}`);
    } else if (isInstalacao(servico)) {
      router.push(`/detalhes/instalacao/${servico.id}`);
    }
  }}
  activeOpacity={0.7}
>
  {/* Card existente aqui */}
</TouchableOpacity>
```

**Nota**: Agenda já tem type guards `isChamado` e `isInstalacao`

---

#### Modificação 4: `app/(app)/historico.tsx`

**Adicionar import**:
```typescript
import { useRouter } from 'expo-router';
```

**Adicionar no componente**:
```typescript
const router = useRouter();
```

**Envolver card em TouchableOpacity**:
```typescript
<TouchableOpacity 
  onPress={() => router.push(`/detalhes/chamado/${chamado.id}`)}
  activeOpacity={0.7}
>
  {/* Card existente aqui */}
</TouchableOpacity>
```

---

###x] Clientes: clicar em card navega para detalhes
- [x] Chamados: clicar em card navega para detalhes
- [x] Agenda: clicar em chamado navega para detalhes de chamado
- [x] Agenda: clicar em instalação navega para detalhes de instalação
- [x] Histórico: clicar em card navega para detalhes
- [x] Botão voltar retorna para lista
- [x] ID é passado corretamente na URL
- [x] ID é passado corretamente na URL
- [ ] Feedback visual (activeOpacity) funciona

---

## 🧪 Testes de Validação da Fase 1

### Teste 1: Navegação Básica
1. Abrir app
2. Ir para tab Clientes
3. Clicar em qualquer cliente
4. ✅ Deve abrir tela "Detalhes do Cliente" com ID visível
5. Clicar em "Voltar"
6. ✅ Deve retornar para lista de clientes

### Teste 2: Navegação da Agenda
1. Ir para tab Agenda
2. Clicar em um chamado
3. ✅ Deve abrir "Detalhes do Chamado"
4. Voltar e clicar em uma instalação
5. ✅ Deve abrir "Detalhes da Instalação"

### Teste 3: Navegação do Histórico
1. Ir para tab Histórico
2. Clicar em um chamado fechado
3. ✅ Deve abrir "Detalhes do Chamado" (mesmo componente)

### Teste 4: TypeScript
1. Em qualquer tela de detalhes, tentar acessar `id` sem tipo
2. ✅ TypeScript deve alertar se não usar `useLocalSearchParams<Tipo>()`
3. Com tipo correto, deve ter autocomplete

### Teste 5: Deep Link (manual)
1. No terminal, executar:
   ```bash
   npx uri-scheme open "exp://localhost:8081/--/detalhes/cliente/123" --android
   ```
2. ✅ Deve abrir tela de detalhes do cliente com ID 123

---

## 📊 Resultado Esperado da Fase 1

### ✅ Entrega:
- Navegação funcional de listas → detalhes
- Telas skeleton exibindo ID recebido
- Type-safety na navegação
- Estrutura de pastas escalável
- Botão voltar funcionando

### ❌ Não é esperado (vem na Fase 2):
- Buscar dados reais da API
- Exibir informações completas
- Loading states reais
- Cache de dados
- Navegação cruzada

---

## 🚨 Pontos de Atenção

### 1. Expo Router - File-based routing
- Estrutura de pastas define automaticamente as rotas
- `[id].tsx` cria dynamic route
- Não precisa configurar Stack manualmente (Expo faz isso)

### 2. Header nas telas de detalhes
- Usar `<Stack.Screen options={{...}} />` dentro do componente
- Permite customizar título, back button, etc.

### 3. Tab Bar em detalhes
- Por padrão, Tab Bar NÃO aparece em telas de detalhes
- Expo Router gerencia isso automaticamente
- Telas dentro de `detalhes/` são "pushed" no stack

### 4. TouchableOpacity vs Pressable
- Usar `TouchableOpacity` para consistência com o resto do app
- `activeOpacity={0.7}` dá feedback visual

### 5. Rotas absolutas vs relativas
```typescript
// ✅ Absoluta (recomendado)
router.push('/detalhes/cliente/123')

// ⚠️ Relativa (pode causar confusão)
router.push('detalhes/cliente/123')
```

---

## 📝 Resumo da Fase 1

| Item | Status | Arquivo(s) |
|------|--------|-----------|
| Análise da estrutura atual | ✅ | - |
| Tipos de navegação | ✅ | `types/navigation.ts` |
| Estrutura de pastas | ✅ | `app/(app)/detalhes/...` |
| Tela Cliente Detalhes | ✅ | `detalhes/cliente/[id].tsx` |
| Tela Chamado Detalhes | ✅ | `detalhes/chamado/[id].tsx` |
| Tela Instalação Detalhes | ✅ | `detalhes/instalacao/[id].tsx` |
| Nav. em Clientes | ✅ | `app/(app)/(tabs)/clientes.tsx` |
| Nav. em Chamados | ✅ | `app/(app)/(tabs)/chamados.tsx` |
| Nav. em Agenda | ✅ | `app/(app)/(tabs)/agenda.tsx` |
| Nav. em Histórico | ✅ | `app/(app)/(tabs)/historico.tsx` |
| Reestruturação Stack+Tabs | ✅ | `app/(app)/_layout.tsx` + `(tabs)/_layout.tsx` |
| Testes de validação | ✅ | Manual - Testado e funcionando

---

## 🎯 Próximos Passos Após Fase 1

1. ✅ Fase 1 completa → Navegação funcional com skeletons
2. ⏭️ Fase 2 → Buscar dados reais da API e exibir
3. ⏭️ Fase 3 → Navegação cruzada (Cliente ↔ Chamado)
4. ⏭️ Fase 4 → Edição e mutações
5. ⏭️ Fase 5 → Otimizações e UX

---

**Pronto para implementar?** 🚀

Estimativa de tempo: **1-2 horas** (incluindo testes)
