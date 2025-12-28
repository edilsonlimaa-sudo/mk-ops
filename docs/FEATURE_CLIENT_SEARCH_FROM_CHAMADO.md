# Feature: Busca de Cliente a partir do Chamado

**Data**: 24/12/2025  
**Fase**: 3 - Navegação cruzada  
**Status**: Em implementação  
**Tipo**: Workaround temporário (até uuid_cliente estar disponível na API)

---

## 🎯 Objetivo

Permitir navegação de **Chamado → Cliente** através de busca inteligente e automática, contornando a limitação da API que não retorna `uuid_cliente` no endpoint de chamados.

---

## ⚠️ Problema Atual

```
API Response de Chamado:
{
  "nome": "João Silva",      ✅ Disponível
  "login": "joao.silva",     ✅ Disponível  
  "email": "joao@email.com", ✅ Disponível
  "uuid_cliente": null       ❌ AUSENTE
}

Rota de Cliente:
/detalhes/cliente/[id]       ← Precisa de UUID
```

**Consequência**: Impossível navegar diretamente para o cliente porque não temos o `uuid`.

---

## ✅ Solução Proposta

**Modal de busca com auto-preenchimento inteligente**

### Fluxo UX:

```
┌──────────────────────────────┐
│ Detalhe do Chamado           │
│                              │
│ 👤 Cliente                   │
│ ┌─────────────────────────┐  │
│ │ João Silva          🔍  │  │ ← Tap aqui
│ └─────────────────────────┘  │
└──────────────────────────────┘
                ↓
        [Modal abre]
                ↓
┌──────────────────────────────┐
│ Buscar Cliente          [X]  │
├──────────────────────────────┤
│ 🔍 João Silva                │ ← Pré-preenchido
├──────────────────────────────┤
│ Resultados (2):              │
│                              │
│ ✓ João Silva                 │ ← Match exato (destaque)
│   CPF: 123.456.789-00        │
│   Login: joao.silva          │
│   Plano: 100MB Fibra         │
├──────────────────────────────┤
│   João Silva Santos          │
│   CPF: 987.654.321-00        │
│   Login: joao.santos         │
│   Plano: 200MB Fibra         │
└──────────────────────────────┘
                ↓
        [Usuário escolhe]
                ↓
┌──────────────────────────────┐
│ Detalhe do Cliente           │
│ João Silva                   │
│ ...dados completos...        │
└──────────────────────────────┘
```

---

## 🔧 Implementação Técnica

### 1. Componente Modal

**Arquivo**: `components/ClientSearchModal.tsx`

```typescript
interface Props {
  visible: boolean;
  onClose: () => void;
  initialSearchQuery: string; // Nome do cliente do chamado
}

function ClientSearchModal({ visible, onClose, initialSearchQuery }) {
  const { data, isLoading } = useClients(); // ← Cache compartilhado
  const [query, setQuery] = useState(initialSearchQuery);
  
  const results = useMemo(() => {
    // Busca local (instantânea)
    return data?.clientes.filter(c => 
      c.nome.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);
  }, [query, data]);
  
  return (
    <Modal visible={visible}>
      <TextInput value={query} onChangeText={setQuery} />
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => {
              onClose();
              router.push(`/detalhes/cliente/${item.uuid}`);
            }}
          >
            <ClientResultCard client={item} />
          </TouchableOpacity>
        )}
      />
    </Modal>
  );
}
```

### 2. Cache Compartilhado (React Query)

```
┌─────────────────────────────────────┐
│    React Query Cache Global         │
│    queryKey: ['clients']            │
│    data: { clientes: [...] }        │
└──────────┬─────────────┬────────────┘
           │             │
    ┌──────▼──────┐  ┌──▼───────────┐
    │ Aba         │  │ Modal Busca  │
    │ Clientes    │  │ no Chamado   │
    └─────────────┘  └──────────────┘
```

**Vantagens**:
- ✅ Fetch automático se cache vazio
- ✅ Busca instantânea se cache populado
- ✅ Zero requisições duplicadas
- ✅ Aba Clientes se beneficia do fetch do modal (e vice-versa)

### 3. Prefetch Inteligente

```typescript
// No detalhe do chamado
useEffect(() => {
  const cached = queryClient.getQueryData(['clients']);
  
  // Se cache vazio, prefetch em background
  if (!cached) {
    queryClient.prefetchQuery({
      queryKey: ['clients'],
      queryFn: fetchAllClients,
    });
  }
}, []);
```

Quando usuário clicar no botão de busca, dados já estarão prontos.

---

## 📊 Casos de Uso

### Caso 1: Cache já existe (usuário visitou aba Clientes)
```
1. Tap no nome "João Silva"
2. Modal abre instantaneamente
3. Resultados aparecem (busca local)
4. Tap no cliente correto
5. Navega
= 3 interações, ~1s
```

### Caso 2: Cache vazio (primeira navegação)
```
1. Tap no nome "João Silva"
2. Modal abre com loading (~500ms)
3. Dados carregam do servidor
4. Resultados aparecem
5. Tap no cliente correto
6. Navega
= 3 interações, ~2s
```

### Caso 3: Match único (otimização futura)
```
1. Tap no nome "Maria Oliveira"
2. Sistema detecta 1 único resultado
3. Navega DIRETO (sem modal)
= 1 interação, instantâneo
```

---

## 🎨 Detalhes de UX

### Visual do Card de Resultado
```
┌────────────────────────────────┐
│ João Silva                     │ ← Nome (match exato em bold)
│ CPF: 123.456.789-00            │ ← Identificador único
│ Login: joao.silva              │ ← Login do chamado
│ Plano: 100MB Fibra • Ativo     │ ← Contexto adicional
└────────────────────────────────┘
```

### Busca Fuzzy (tolerante a erros)
```
Query: "joao"  → Matches: "João Silva"
Query: "silva" → Matches: "João Silva", "Maria Silva"
Query: "JOÃO"  → Matches: "João Silva" (case-insensitive)
```

### Ordenação por Relevância
1. Match exato do nome completo
2. Match do início do nome
3. Match parcial do nome
4. Match em login/CPF

---

## 🚀 Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `components/ClientSearchModal.tsx` | **Criar** - Modal de busca |
| `app/(app)/detalhes/chamado/[id].tsx` | **Editar** - Adicionar botão de busca |
| `app/(app)/detalhes/instalacao/[id].tsx` | **Editar** - Adicionar botão de busca |

---

## ⏱️ Estimativa

**Implementação**: 2-3 horas
- Modal component: 1h
- Integração em chamado: 30min
- Integração em instalação: 30min
- Ajustes visuais: 30min

**Testes**: 30min
- Caso cache vazio
- Caso cache populado
- Múltiplos resultados
- Resultado único

---

## 🔄 Migração Futura

Quando backend adicionar `uuid_cliente`, a refatoração é trivial:

```diff
// REMOVER modal
- <ClientSearchModal visible={...} />

// SUBSTITUIR por navegação direta
- onPress={() => setModalVisible(true)}
+ onPress={() => router.push(`/detalhes/cliente/${chamado.uuid_cliente}`)}
```

---

## ✅ Benefícios

1. **Resolve navegação AGORA** (sem esperar backend)
2. **UX inteligente** (busca automática, sem digitação)
3. **Performance** (cache compartilhado, busca local)
4. **Desambiguação** (múltiplos clientes com mesmo nome)
5. **Facilmente reversível** (quando uuid_cliente chegar)

---

## 🎯 Próximos Passos

1. ✅ Documentação alinhada
2. ⏳ Implementar `ClientSearchModal.tsx`
3. ⏳ Integrar em detalhe de chamado
4. ⏳ Integrar em detalhe de instalação
5. ⏳ Testar fluxos completos
6. ⏳ Deploy
