# MK Auth Mobile

**React Native + Expo mobile app** for ISP field technicians. Connects to MK-Auth API for managing clients, service tickets, and installations.

**Stack:** React Native 0.81 • Expo 54 • TypeScript • TanStack Query • Zustand • NativeWind

---

## 🚀 Quick Start

```bash
# Clone and install
git clone <repository-url>
cd mk-auth-mobile
npm install

# Start dev server
npm start

# Run on device
# Press 'a' for Android or 'i' for iOS
# Or scan QR code with Expo Go
```

**First launch:** App will guide you through onboarding (API URL, credentials, permissions).

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Development](#-development)
- [Testing](#-testing)
- [Known Issues](#-known-issues)
- [Troubleshooting](#-troubleshooting)
- [Docs](#-documentation)

---

## �️ Tech Stack

**Core:**
- **React Native 0.81** + **Expo SDK 54** - Cross-platform mobile
- **TypeScript** (strict mode, 100% coverage) - Type safety
- **Expo Router** - File-based routing with layouts

**State:**
- **TanStack Query v5** - Server state, caching, optimistic updates
- **Zustand** - Minimal global state (auth + user only)

**UI:**
- **NativeWind v4** - TailwindCSS for React Native
- Custom components, skeleton loaders, toast notifications

**Network:**
- **Axios** - HTTP client with interceptors
- Custom token refresh queue
- Dynamic baseURL injection

**Storage:**
- **Expo SecureStore** - Encrypted JWT tokens
- **MMKV** - Fast key-value storage (React Query persist)

**Testing:**
- **Jest** + **React Native Testing Library**
- 80%+ coverage on critical paths (auth, token refresh)

**Build:**
- **EAS Build** - Cloud builds
- Android + iOS support

---

## 🏗️ Architecture

### Design Patterns

**1. Service Layer = Pure Orchestrators**
```typescript
// services/api/chamado/chamado.service.ts
export const fecharChamado = async (uuid: string): Promise<void> => {
  await apiClient.post(`/api/chamado/fechar/uuid=${uuid}`);
};
```
- No business logic
- No state management
- Just compose API calls

**2. Hooks by Domain**
```typescript
// hooks/chamado/useFechaChamado.ts
export const useFechaChamado = () => {
  return useMutation({
    mutationFn: fecharChamado,
    onSuccess: () => {
      // Surgical cache invalidation
      queryClient.invalidateQueries({ queryKey: agendaKeys.all() });
    },
  });
};
```
- Each domain has its own folder (cliente, chamado, instalacao, etc.)
- Centralized query keys in `keys.ts`
- Export all from `index.ts`

**3. Dependency Injection**
```typescript
// API baseURL injected at runtime
apiClient.interceptors.request.use((config) => {
  config.baseURL = useUserStore.getState().apiUrl;
  return config;
});
```

**4. Observer Pattern**
```typescript
// Decouple auth store from API client
useAuthStore.subscribe(
  (state) => state.token,
  (token) => updateApiClientToken(token)
);
```

**5. Request Queue for Token Refresh**
- Prevents race conditions when multiple 401s trigger refresh
- Queues failed requests, replays after new token
- See [`tokenRefreshInterceptor.ts`](services/api/core/interceptors/tokenRefreshInterceptor.ts)

### Key Files

**File** | **Purpose**
-------- | -----------
[`app/_layout.tsx`](app/_layout.tsx) | Root navigation, auth flow, splash screen
[`stores/useAuthStore.ts`](stores/useAuthStore.ts) | Auth state (login, logout, token)
[`stores/useUserStore.ts`](stores/useUserStore.ts) | User data, API URL
[`services/api/core/apiClient.ts`](services/api/core/apiClient.ts) | Axios instance with interceptors
[`services/api/core/interceptors/`](services/api/core/interceptors/) | Token refresh, error handling
[`hooks/*/keys.ts`](hooks/) | Centralized React Query cache keys
[`lib/queryClient.ts`](lib/queryClient.ts) | React Query config + MMKV persistence

---

## 🔌 API Integration

**Connects to MK-Auth API** (ISP management system). API URL configured during onboarding.

### Authentication Flow

1. **Identify user**: `POST /api/funcionario/identificar` → Returns employee data
2. **Login**: `POST /api/funcionario/logar` (Basic Auth) → Returns JWT  
3. **Auto-refresh**: Token refreshed automatically on 401

### Main Endpoints

```
GET  /api/cliente/todos              # List all clients
GET  /api/cliente/{id}               # Client details
GET  /api/agenda                     # Tickets + installations
POST /api/chamado/fechar/uuid={uuid} # Close ticket
```

Full endpoint list in code comments + service files.

### API Quirks ⚠️

- **HTTP 200 with errors**: Some endpoints return 200 with error text in body
- **No chamado by cliente_id**: Use `/api/agenda` + filter client-side  
- **Token refresh races**: Handled with request queue pattern

See [`docs/API_LIMITATION_CHAMADO_CLIENTE.md`](docs/API_LIMITATION_CHAMADO_CLIENTE.md) for details.

---

## 📁 Project Structure

```
mk-auth-mobile/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx              # Root: Stack nav, auth flow, splash
│   ├── (auth)/                  # Auth screens (login, identification)
│   ├── (onboarding)/            # First-launch setup flow
│   └── (app)/                   # Main app (tabs + detail screens)
│
├── services/api/                 # API layer (thin orchestrators)
│   ├── core/
│   │   ├── apiClient.ts         # Axios instance
│   │   └── interceptors/        # Token refresh, error handling
│   ├── auth/                    # Auth API calls
│   ├── cliente/                 # Client API calls
│   ├── chamado/                 # Ticket API calls
│   └── [domain]/                # One folder per domain
│
├── hooks/                        # React Query hooks by domain
│   ├── auth/
│   │   ├── keys.ts              # Cache keys
│   │   ├── useLogin.ts          # Login mutation
│   │   └── index.ts             # Exports
│   ├── cliente/                 # Client hooks
│   ├── chamado/                 # Ticket hooks
│   └── [domain]/                # One folder per domain
│
├── stores/                       # Zustand stores (minimal)
│   ├── useAuthStore.ts          # Auth state (token, isAuthenticated)
│   └── useUserStore.ts          # User data, API URL
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI (Button, Input, etc.)
│   ├── agenda/                  # Agenda-specific components
│   └── [feature]/               # Feature-specific
│
├── types/                        # TypeScript definitions
│   ├── client.ts                # Client types
│   ├── chamado.ts               # Ticket types
│   └── [domain].ts              # One file per domain
│
├── lib/                          # Config & utils
│   ├── queryClient.ts           # React Query config
│   └── auth/                    # Auth utilities
│
└── docs/                         # Documentation
    ├── AUTH.md                  # Auth system deep dive
    └── *.md                     # Architecture docs
```

**Organization principle:** Group by domain (cliente, chamado, instalacao), not by type.

---

## 🐛 Known Issues

**Before fixing bugs, check here first.**

### Current Issues

- Pull-to-refresh sometimes needs multiple pulls
- Search modal keyboard handling quirks on Android
- Loading states inconsistent in some flows

### API Quirks

⚠️ **MK-Auth API has some quirks** - see [API_LIMITATION_CHAMADO_CLIENTE.md](docs/API_LIMITATION_CHAMADO_CLIENTE.md)

- **HTTP 200 with errors**: Some endpoints return status 200 even on error (error in body)
- **No direct chamado by cliente_id**: Must use agenda endpoint + filter client-side
- **Token refresh race conditions**: Handled with request queue pattern

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **"Failed to connect to API"** | Verify API URL (include `https://`), test in browser, check network |
| **"Authentication failed"** | Check employee exists in MK-Auth, verify credentials, ensure API permissions |
| **"Session expired" loop** | Check token expiration settings, clear app data, check console logs |
| **App crashes on startup** | Clear app data/cache, reinstall app |
| **Cannot see data** | Verify employee has permissions in MK-Auth for `cliente`, `chamado`, `instalacao` controllers |
| **Dev server won't start** | `npm start -- --clear` (clear metro cache) |
| **TypeScript errors** | `rm -rf node_modules && npm install`, restart TS server in VS Code |
| **Android build fails** | `cd android && ./gradlew clean` |

### Debug Tools

```bash
npm start -- --clear  # Clear metro cache
```

- Shake device → Debug menu
- Check terminal for API logs  
- React Query cache logged to console

---

## 📚 Documentation

**Deep dives:**
- [`docs/AUTH.md`](docs/AUTH.md) - Auth system architecture (token refresh, interceptors)
- [`docs/API_LIMITATION_CHAMADO_CLIENTE.md`](docs/API_LIMITATION_CHAMADO_CLIENTE.md) - API quirks & workarounds

**Project history:**
- [`docs/CRONOLOGIA_DESENVOLVIMENTO.md`](docs/CRONOLOGIA_DESENVOLVIMENTO.md) - Development timeline
- [`docs/BUILD_IN_PUBLIC.md`](docs/BUILD_IN_PUBLIC.md) - Build notes

---

## 🛠️ Development Workflow

### Adding a New Feature

1. **Define types** in `types/[domain].ts`
2. **Create service** in `services/api/[domain]/[domain].service.ts`
3. **Add query keys** in `hooks/[domain]/keys.ts`
4. **Create hook** in `hooks/[domain]/use[Feature].ts`
5. **Export** from `hooks/[domain]/index.ts`
6. **Use in component**

### Code Style

- **TypeScript strict mode** - No `any` without reason
- **Functional components** - Use hooks
- **Named exports** - Avoid default exports
- **Group by domain** - Not by type (services, hooks, types)

### Commit Convention

```
feat: add new feature
fix: bug fix
refactor: code refactoring
docs: documentation
test: tests
chore: dependencies, config
```

### Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

**Focus on:**
- Auth flows (login, token refresh)
- API interceptors
- Critical business logic
- Edge cases

### Deployment

```bash
# Android
eas build --platform android --profile production
eas submit --platform android

# iOS
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 📝 Quick Reference

### Common Tasks

**Task** | **Where to look**
-------- | -----------------
Auth flow | [`stores/useAuthStore.ts`](stores/useAuthStore.ts), [`docs/AUTH.md`](docs/AUTH.md)
API calls | [`services/api/[domain]/`](services/api/)
Data fetching | [`hooks/[domain]/`](hooks/)
Routing | [`app/`](app/) (file-based)
Types | [`types/[domain].ts`](types/)
Token refresh | [`services/api/core/interceptors/`](services/api/core/interceptors/)

### Scripts

```bash
npm start            # Dev server
npm test             # Tests
npm run android      # Android
npm run ios          # iOS
npm run lint         # ESLint
```

---

**Built with React Native + Expo + TypeScript**
