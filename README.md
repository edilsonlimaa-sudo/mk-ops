# MK Auth Mobile

React Native + Expo app para técnicos de campo de ISP. Conecta na API do MK-Auth para gerenciar clientes, chamados e instalações.

**Stack:** React Native 0.81 • Expo 54 • TypeScript • TanStack Query • Zustand • NativeWind

---

## 🚀 Como Rodar

### Pré-requisitos

- **Node.js** 18+ e npm/yarn
- **Git**
- **Conta no Expo**: Crie em [expo.dev](https://expo.dev) (gratuito)
- **EAS CLI**: `npm install -g eas-cli`
- **Dispositivo Android físico** (obrigatório - emuladores podem apresentar bugs de UI)

### ⚠️ Importante: Este projeto usa Custom Dev Client

**NÃO funciona com Expo Go.** Você precisa fazer um build de desenvolvimento primeiro.

### Setup Inicial

```bash
# 1. Clone o repositório
git clone <repository-url>
cd mk-auth-mobile

# 2. Instale as dependências
npm install

# 3. Login no EAS (se ainda não fez)
eas login
```

### Rodando no Android

```bash
# Faz build de desenvolvimento na nuvem (demora ~10-15 min)
eas build --platform android --profile development

# Baixa e instala o APK gerado no seu device/emulador
# Depois roda:
npm start
```

Esse comando:
- Faz build do custom dev client via EAS
- Gera um APK para download
- Instale o APK no device/emulador Android
- Depois rode `npm start` para iniciar o metro bundler

### Após o Dev Client estar instalado

Depois que o dev client estiver instalado no seu device/emulador, basta:

```bash
npm start
```

E escanear o QR code ou pressionar `a` para Android

### Primeira execução do app

> **⚠️ Importante:** Solicite a URL do servidor, Client ID e Client Secret com o desenvolvedor responsável: **Edilson Rocha Lima**

O app vai te guiar por um **setup de 4 passos**:

1. **URL do Servidor** - Digite a URL do seu servidor MK-Auth (ex: `meu-servidor.com.br`)
2. **Credenciais da API** - Cole o **Client ID** e **Client Secret** do painel MK-Auth
3. **Permissões** - Checklist das permissões que devem estar habilitadas no MK-Auth para este app:
   - Controllers: `Chamado`, `Cliente`, `Funcionarios`, `Instalacao`, `Plano`, `Usuario`
   - Métodos: `GET` e `PUT` para cada controller
4. **Validação** - Testa conexão, valida credenciais e verifica permissões automaticamente

Se a validação passar, você vai pra tela de sucesso e o app está pronto para usar!

---

## 🧪 Build Preview (Para Validação de Correções)

Para testar correções de bugs em uma versão standalone (sem metro bundler):

```bash
# Build preview - gera APK standalone para testes
eas build --platform android --profile preview
```

**Quando usar:**
- ✅ Validar correções de bugs antes de produção
- ✅ Testar app como usuário final (sem dev tools)
- ✅ Compartilhar versão de teste com outras pessoas

**Diferença do dev build:**
- ❌ Não precisa rodar `npm start`
- ❌ Não tem hot reload
- ✅ App funciona totalmente offline (após instalado)
- ✅ Performance real de produção

Baixe o APK gerado e instale no dispositivo. O app roda standalone.

---

## 🎭 Modos Mock (Para Testes Sem Alterar Dados Reais)

Existem **mocks ativados** no código para testar funcionalidades críticas sem modificar dados no servidor MK-Auth.

### Onde encontrar os mocks:

| Funcionalidade | Arquivo | Variável | Status Atual |
|----------------|---------|----------|--------------|
| Fechar chamado | `hooks/chamado/useFechaChamado.ts` | `MOCK_MODE` | ✅ **ATIVO** (`true`) |
| Reabrir chamado | `hooks/chamado/useReabrirChamado.ts` | `MOCK_MODE` | ❌ Desativado (`false`) |
| Fechar instalação | `hooks/instalacao/useFechaInstalacao.ts` | `MOCK_MODE` | ✅ **ATIVO** (`true`) |
| Reset MAC do cliente | `hooks/cliente/useUpdateClient.ts` | `MOCK_RESET_MAC` | ✅ **ATIVO** (`true`) |

### Como usar:

```typescript
// Exemplo: hooks/chamado/useFechaChamado.ts
const MOCK_MODE = true;  // ✅ Ativado - não chama API real
const MOCK_MODE = false; // ❌ Desativado - chama API real
```

**Com mock ativo:**
- ✅ Simula latência de rede (500ms)
- ✅ Atualiza caches do React Query normalmente
- ✅ UI funciona exatamente igual
- ❌ API real NÃO é chamada
- ❌ Dados no servidor NÃO são alterados

**Quando desativar o mock:**
- Após validar que a UI funciona corretamente
- Quando quiser testar a integração real com a API
- Antes de fazer build de produção

> **💡 Dica:** Deixe os mocks ativos durante desenvolvimento para evitar poluir a base de dados com testes.

---


## 🗂️ Estrutura do Projeto

```
mk-auth-mobile/
├── app/                     # Rotas (Expo Router - file-based)
│   ├── (auth)/             # Telas de autenticação
│   ├── (onboarding)/       # Onboarding inicial
│   └── (app)/              # App principal (tabs + detalhes)
│
├── services/api/            # Chamadas de API
│   ├── core/apiClient.ts   # Axios configurado
│   └── [domain]/           # Organizados por domínio
│
├── hooks/                   # React Query hooks
│   └── [domain]/           # Organizados por domínio
│
├── stores/                  # Estado global (Zustand)
│   ├── useAuthStore.ts     # Auth (token, login, logout)
│   └── useUserStore.ts     # Dados do usuário
│
├── components/              # Componentes React
├── types/                   # TypeScript types
└── docs/                    # Documentação adicional
```

**Organização:** Tudo é organizado por **domínio** (cliente, chamado, instalacao), não por tipo de arquivo.

---

## 📝 Versionamento da Documentação

**Última atualização:** 30 de abril de 2026

---

**Built with React Native + Expo + TypeScript**
