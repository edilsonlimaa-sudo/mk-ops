// Mock expo winter runtime
jest.mock('expo/src/winter/runtime.native.ts', () => ({}), { virtual: true });
jest.mock('expo/src/winter/installGlobal.ts', () => ({}), { virtual: true });

// Mock expo modules
jest.mock('expo', () => ({
  __esModule: true,
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

// Suppress console logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
