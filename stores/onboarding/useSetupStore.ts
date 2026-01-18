import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SetupData {
  serverUrl: string | null;
  clientId: string | null;
  clientSecret: string | null;
}

interface SetupStore {
  // Estado
  data: SetupData;
  currentStep: number;
  completedSteps: number[];
  isSetupComplete: boolean;

  // Actions - Salvar dados
  setServerUrl: (url: string) => void;
  setCredentials: (clientId: string, clientSecret: string) => void;

  // Actions - Controle de fluxo
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  canAccessStep: (step: number) => boolean;

  // Actions - Reset
  resetSetup: () => void;
  completeSetup: () => void;
}

const initialState = {
  data: {
    serverUrl: null,
    clientId: null,
    clientSecret: null,
  },
  currentStep: 1,
  completedSteps: [],
  isSetupComplete: false,
};

export const useSetupStore = create<SetupStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Salvar URL do servidor
      setServerUrl: (url: string) => {
        set((state) => ({
          data: { ...state.data, serverUrl: url },
        }));
      },

      // Salvar credenciais
      setCredentials: (clientId: string, clientSecret: string) => {
        set((state) => ({
          data: { ...state.data, clientId, clientSecret },
        }));
      },

      // Definir step atual
      setCurrentStep: (step: number) => {
        set({ currentStep: step });
      },

      // Marcar step como completo
      completeStep: (step: number) => {
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step].sort(),
        }));
      },

      // Verificar se pode acessar um step
      canAccessStep: (step: number) => {
        const { completedSteps } = get();
        
        // Step 1 sempre pode acessar
        if (step === 1) return true;
        
        // Para outros steps, precisa ter completado o anterior
        return completedSteps.includes(step - 1);
      },

      // Completar setup inteiro
      completeSetup: () => {
        set({ isSetupComplete: true });
      },

      // Resetar setup (limpar tudo)
      resetSetup: () => {
        set(initialState);
      },
    }),
    {
      name: 'setup-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
