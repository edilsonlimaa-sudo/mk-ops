# 📱 MK Auth Mobile

> **Enterprise-grade mobile app for field technicians** to manage service tickets, installations, and client information with offline-first capabilities.

Built with React Native, Expo, and TypeScript. From concept to production in 13 days with 118 commits of clean, tested code.

[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020?style=flat&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

---

## 🎯 Overview

MK Auth Mobile is a production-ready mobile application designed for field technicians working with unstable internet connections. It provides instant access to client data, service tickets, and installation schedules with intelligent caching and seamless synchronization.

### Key Highlights
- 🔐 **Dual-layer authentication** with automatic JWT token refresh
- 💾 **Intelligent caching** - Works offline, syncs when online
- ⚡ **Instant navigation** - Progressive loading with skeleton screens
- 🎨 **Modern UX** - Native feel with NativeWind (TailwindCSS)
- 🏗️ **Clean architecture** - Service layer organized by domain
- ✅ **Production tested** - 118 commits, comprehensive test suite

---

## ✨ Features

### 🔒 Authentication
- Dual-layer security (user identification + password validation)
- JWT authentication with automatic token refresh
- Session persistence with Expo SecureStore
- Proactive token validation to prevent interruptions
- Flow-aware immersive loading states

### 👥 Client Management
- List 3000+ clients with instant search
- Search by name, phone, CPF/CNPJ
- Filter by status, activation, and features
- Pull-to-refresh synchronization
- Complete client details with technical and financial data
- Quick actions: copy data, long-press gestures
- GPS integration with Google Maps

### 🎫 Service Tickets (Chamados)
- Unified agenda view (tickets + installations)
- Progressive loading detail screens
- Timeline UI showing ticket lifecycle
- Close/reopen tickets with confirmation
- Real-time cache invalidation
- Navigate to related client information
- Status-based filtering

### 🏗️ Installations
- Service layer with status filtering
- Complete detail screens
- Mark installations as completed
- Integration with unified history
- Progressive loading

### 📜 History
- Unified history tab (closed tickets + completed installations)
- Reverse pagination for performance
- Timeline events for lifecycle tracking
- Date-based filtering
- Error states with retry functionality

### 🎨 User Experience
- Native headers and tab navigation
- SafeAreaView protection for Android
- Toast notifications for feedback
- Skeleton loading states
- Empty states with helpful messages
- Keyboard-aware modals
- Dual badge system for status indicators
- Immersive loading screens

---

## 🛠️ Tech Stack

### Core
- **[React Native](https://reactnative.dev/)** - Cross-platform mobile framework
- **[Expo SDK ~54](https://expo.dev/)** - Development platform and toolchain
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety (100% coverage, strict mode)
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing with layouts

### Styling
- **[NativeWind v4](https://www.nativewind.dev/)** - TailwindCSS for React Native
- Consistent design system
- Dark mode ready

### State Management
- **[Zustand](https://github.com/pmndrs/zustand)** - Minimal state management
  - `useAuthStore` - Authentication state
  - `useUserStore` - User profile data
- **[TanStack Query v5](https://tanstack.com/query)** - Server state management
  - Intelligent caching strategies
  - Optimistic updates
  - Automatic cache invalidation

### Networking
- **[Axios](https://axios-http.com/)** - HTTP client with interceptors
- Custom token refresh interceptor
- Request queue management during token refresh
- Automatic retry logic
- Dynamic baseURL injection

### Storage
- **[Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)** - Encrypted storage
  - JWT tokens
  - Sensitive credentials

### Testing
- **[Jest](https://jestjs.io/)** - Test runner
- **[@testing-library/react-native](https://callstack.github.io/react-native-testing-library/)** - Component testing
- Comprehensive test suite for auth system (80%+ coverage)

### Build & Deploy
- **[EAS Build](https://docs.expo.dev/build/introduction/)** - Cloud builds for Android/iOS
- **[EAS Submit](https://docs.expo.dev/submit/introduction/)** - Automated deployment
- Configured for preview and production environments

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: macOS with Xcode
- For Android: Android Studio with emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mk-auth-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # API Configuration (set at runtime via user input)
   # No hardcoded values needed
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

### Development Builds

For full native features:

```bash
# Android preview build
npx eas build --platform android --profile preview

# iOS preview build
npx eas build --platform ios --profile preview
```

---

## 📁 Project Structure

```
mk-auth-mobile/
├── app/                          # File-based routing (Expo Router)
│   ├── _layout.tsx              # Root layout with Stack navigation
│   ├── index.tsx                # Entry point with redirect logic
│   ├── (auth)/                  # Authentication route group
│   │   ├── _layout.tsx         # Auth stack layout
│   │   ├── login.tsx           # Login screen
│   │   └── user-identification.tsx  # User identification screen
│   └── (app)/                   # Authenticated app route group
│       ├── _layout.tsx         # App layout with bottom tabs
│       ├── (tabs)/             # Tab screens
│       │   ├── index.tsx       # Home/Dashboard
│       │   ├── clientes.tsx    # Clients list
│       │   ├── agenda.tsx      # Unified agenda
│       │   └── historico.tsx   # History
│       └── detalhes/           # Detail screens (stack)
│           ├── cliente/[id].tsx
│           ├── chamado/[id].tsx
│           └── instalacao/[id].tsx
│
├── components/                   # Reusable components
│   ├── ClientSearchModal.tsx   # Client search modal
│   ├── ImmersiveLoadingScreen.tsx
│   ├── PasswordModal.tsx
│   └── ui/                     # UI components
│
├── hooks/                       # Custom React hooks (by domain)
│   ├── auth/                   # Authentication hooks
│   │   ├── useProactiveTokenRefresh.ts
│   │   ├── index.ts
│   │   └── keys.ts
│   ├── cliente/                # Client hooks
│   │   ├── useClients.ts
│   │   ├── useClientDetail.ts
│   │   ├── index.ts
│   │   └── keys.ts
│   ├── chamado/                # Ticket hooks
│   │   ├── useChamadoDetail.ts
│   │   ├── useFechaChamado.ts
│   │   ├── useReabrirChamado.ts
│   │   ├── index.ts
│   │   └── keys.ts
│   ├── instalacao/             # Installation hooks
│   ├── agenda/                 # Agenda hooks
│   ├── historico/              # History hooks
│   └── usuario/                # User hooks
│
├── services/                    # API services (by domain)
│   ├── api/
│   │   ├── core/              # Core infrastructure
│   │   │   ├── apiClient.ts   # Configured axios instance
│   │   │   └── interceptors/  # Request/response interceptors
│   │   ├── auth/              # Auth services
│   │   ├── cliente/           # Client services
│   │   ├── chamado/           # Ticket services
│   │   ├── instalacao/        # Installation services
│   │   ├── agenda/            # Agenda services
│   │   └── usuario/           # User services
│   └── storage/
│       └── authStorage.ts     # Secure storage abstraction
│
├── stores/                      # Global state (Zustand)
│   ├── useAuthStore.ts         # Auth state
│   └── useUserStore.ts         # User state
│
├── types/                       # TypeScript type definitions
│   ├── navigation.ts           # Navigation types
│   ├── client.ts               # Client types
│   ├── chamado.ts              # Ticket types
│   ├── instalacao.ts           # Installation types
│   ├── agenda.ts               # Agenda types
│   └── usuario.ts              # User types
│
├── utils/                       # Utility functions
│   └── agenda.ts               # Agenda utilities
│
├── constants/                   # App constants
│   └── theme.ts                # Theme configuration
│
├── docs/                        # Documentation
│   ├── AUTH.md                 # Authentication system docs
│   ├── CRONOLOGIA_DESENVOLVIMENTO.md
│   ├── ANALISE_TEMPORAL_FASES.md
│   ├── BUILD_IN_PUBLIC.md
│   └── *.md                    # Various planning docs
│
└── scripts/
    └── reset-project.js        # Project reset utility
```

---

## 🏗️ Architecture Highlights

### Service Layer - Pure Orchestrator Pattern
Services are pure orchestrators that compose API calls without business logic:
```typescript
// services/api/chamado/chamado.service.ts
export const fecharChamado = async (uuid: string): Promise<void> => {
  await apiClient.post(`/api/chamado/fechar/uuid=${uuid}`);
};
```

### Hooks by Domain
Organized with centralized query keys for cache management:
```typescript
// hooks/chamado/keys.ts
export const chamadoKeys = {
  all: ['chamados'] as const,
  detail: (id: string) => [...chamadoKeys.all, id] as const,
};
```

### Intelligent Cache Invalidation
Surgical cache updates instead of invalidating everything:
```typescript
// Only invalidate related queries
queryClient.invalidateQueries({ queryKey: agendaKeys.all() });
queryClient.invalidateQueries({ queryKey: historicoKeys.all() });
```

### Dependency Injection Pattern
Dynamic baseURL and token injection:
```typescript
const apiClient = axios.create();
apiClient.interceptors.request.use(tokenInjector);
```

### Observer Pattern
Decoupling between stores and API client:
```typescript
useAuthStore.subscribe(
  (state) => state.token,
  (token) => updateApiClientToken(token)
);
```

---

## 📜 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Start on Android emulator
npm run ios            # Start on iOS simulator
npm run web            # Start web version

# Testing
npm test               # Run test suite
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report

# Code Quality
npm run lint           # Run ESLint

# Project Management
npm run reset-project  # Reset to blank template
```

---

## 🧪 Testing

The project includes comprehensive tests for critical components:

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ Auth service (80%+ coverage)
- ✅ Token refresh logic
- ✅ Auth storage layer
- ✅ Interceptors

---

## 🚢 Deployment

### Android (via EAS)

```bash
# Preview build
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

### iOS (via EAS)

```bash
# Preview build
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

---

## 📊 Project Stats

- **Development Time:** 13 days (Dec 16-28, 2025)
- **Total Commits:** 118 (~9 commits/day)
- **Lines of Code:** ~15,000+
- **Test Coverage:** 80%+ (critical modules)
- **TypeScript:** 100% (strict mode)
- **Architecture:** Service layer + Hooks by domain

### Commit Distribution
- 29.7% - Authentication
- 20.3% - Client management
- 22.9% - Tickets & agenda
- 16.9% - UX refinements
- 10.2% - Mutations & actions

---

## 📚 Documentation

Comprehensive documentation available in the `/docs` folder:

- **[AUTH.md](docs/AUTH.md)** - Authentication system architecture
- **[CRONOLOGIA_DESENVOLVIMENTO.md](docs/CRONOLOGIA_DESENVOLVIMENTO.md)** - Development timeline
- **[ANALISE_TEMPORAL_FASES.md](docs/ANALISE_TEMPORAL_FASES.md)** - Time analysis by phase
- **[BUILD_IN_PUBLIC.md](docs/BUILD_IN_PUBLIC.md)** - Build in public documentation
- **[STACK.md](docs/STACK.md)** - Technology stack details

---

## 🤝 Contributing

This is a private project. If you have access and want to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes using [conventional commits](https://www.conventionalcommits.org/)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention
```
feat: add new feature
fix: bug fix
refactor: code refactoring
docs: documentation changes
test: add or update tests
chore: maintenance tasks
```

---

## 🙏 Acknowledgments

- **[Expo Team](https://expo.dev/)** - Amazing toolchain
- **[TanStack](https://tanstack.com/)** - React Query made data fetching simple
- **[Vercel](https://vercel.com/)** - NativeWind integration
- **TypeScript Team** - Type safety is love ❤️
- **React Native Community** - Always helpful

---

## 📄 License

Private and proprietary. All rights reserved.

---

## 📞 Contact

For questions or support, contact the development team.

---

<div align="center">

**Built with ❤️ using React Native, Expo & TypeScript**

*From zero to production in 13 days*

</div>
