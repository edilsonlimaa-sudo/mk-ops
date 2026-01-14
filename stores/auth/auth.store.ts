import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Estado puro de autenticação.
 * 
 * Esta store contém apenas FATOS OBSERVÁVEIS, não decisões ou fluxos.
 * Lógica de login, logout, refresh e bootstrap estão em módulos externos.
 */
interface AuthState {
  /** Token JWT atual */
  token: string | null;
  
  /** Timestamp de expiração do token em milissegundos */
  tokenExpiration: number | null;
  
  /** IP do servidor MkAuth */
  ipMkAuth: string | null;
  
  /** Indica se a sessão foi restaurada do storage (bootstrap completo) */
  isRestored: boolean;

  /** Propriedade derivada: usuário está autenticado (token existe + bootstrap completo) */
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    token: null,
    tokenExpiration: null,
    ipMkAuth: null,
    isRestored: false,
    isAuthenticated: false,
  }))
);

// Subscrição reativa: atualiza isAuthenticated automaticamente quando token ou isRestored mudam
useAuthStore.subscribe(
  (state) => ({ token: state.token, isRestored: state.isRestored }),
  ({ token, isRestored }) => {
    const isAuthenticated = !!token && isRestored;
    const currentIsAuthenticated = useAuthStore.getState().isAuthenticated;
    
    // Só atualiza se mudou para evitar loops
    if (isAuthenticated !== currentIsAuthenticated) {
      useAuthStore.setState({ isAuthenticated });
    }
  },
  { equalityFn: (a, b) => a.token === b.token && a.isRestored === b.isRestored }
);
