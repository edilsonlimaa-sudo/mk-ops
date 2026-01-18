import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingPhase = 'welcome' | 'in-setup' | 'success' | 'complete';

interface OnboardingStore {
  // Estado
  currentPhase: OnboardingPhase;
  isOnboardingComplete: boolean;
  
  // Actions - Navegação de fases
  setPhase: (phase: OnboardingPhase) => void;
  startSetup: () => void;
  completeSetup: () => void;
  exitSetup: () => string;
  
  // Actions - Controle geral
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Helpers
  getResumeRoute: () => string;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentPhase: 'welcome',
      isOnboardingComplete: false,

      // Define a fase atual
      setPhase: (phase: OnboardingPhase) => {
        set({ currentPhase: phase });
      },

      // Inicia o setup (usuário clicou em "Começar" na welcome)
      startSetup: () => {
        set({ currentPhase: 'in-setup' });
      },

      // Completa o setup (4-validation foi bem-sucedido)
      completeSetup: () => {
        set({ currentPhase: 'success' });
      },

      // Sai do setup (usuário clicou em "Sair" durante a configuração)
      exitSetup: () => {
        // Importa o resetSetup do useSetupStore
        const { resetSetup } = require('./useSetupStore').useSetupStore.getState();
        resetSetup();
        
        // Volta para a welcome
        set({ currentPhase: 'welcome' });
        
        // Retorna a rota de destino
        return '/(onboarding)/welcome';
      },

      // Marca o onboarding como completo (usuário clicou em "Começar a usar")
      completeOnboarding: () => {
        set({ 
          isOnboardingComplete: true,
          currentPhase: 'complete'
        });
      },

      // Reseta o onboarding (útil para testes ou re-configuração)
      resetOnboarding: () => {
        set({ 
          isOnboardingComplete: false,
          currentPhase: 'welcome'
        });
      },

      // Helper: retorna a rota para onde deve ir ao reabrir o app
      getResumeRoute: () => {
        const { isOnboardingComplete } = get();
        
        // Se completou, vai pro app. Senão, sempre volta pro início (welcome)
        // Os dados do setup (url, clientId, clientSecret) são mantidos no useSetupStore
        return isOnboardingComplete ? '/(app)' : '/(onboarding)/welcome';
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Persiste apenas isOnboardingComplete, não currentPhase
      partialize: (state) => ({ isOnboardingComplete: state.isOnboardingComplete }),
    }
  )
);
