import { create } from 'zustand';

// ============ Types ============

export type ViewMode = 'day' | 'agenda';

// ============ State Interface ============

interface AgendaState {
  // Core State
  selectedDateKey: string;
  viewMode: ViewMode;
  
  // Sync Control
  lastSyncedDateKey: string;
  isReady: boolean;
  
  // Getters (computed state)
  shouldShowFab: () => boolean;
  canSyncFromScroll: () => boolean;
  
  // Actions - Navigation
  selectDate: (dateKey: string) => void;
  syncFromScroll: (dateKey: string) => boolean;
  goToToday: () => void;
  
  // Actions - View Mode
  setViewMode: (mode: ViewMode) => void;
  
  // Actions - Lifecycle
  markReady: () => void;
  reset: () => void;
}

// ============ Helper Functions ============

const getTodayDateKey = () => new Date().toISOString().split('T')[0];

const getInitialState = () => ({
  selectedDateKey: getTodayDateKey(),
  viewMode: 'day' as ViewMode,
  lastSyncedDateKey: getTodayDateKey(),
  isReady: false,
});

// ============ Store Implementation ============

export const useAgendaStore = create<AgendaState>((set, get) => ({
  // Initial State
  ...getInitialState(),
  
  // ============ Getters ============
  
  /**
   * Determina se o FAB "Hoje" deve ser exibido
   * Retorna true quando usuário não está visualizando o dia atual
   */
  shouldShowFab: () => {
    const state = get();
    const today = getTodayDateKey();
    return state.selectedDateKey !== today;
  },
  
  /**
   * Determina se a sincronização via onScroll está permitida
   * Previne sincronizações durante mount e no modo dia
   */
  canSyncFromScroll: () => {
    const state = get();
    return (
      state.isReady &&                  // Componente já montou (300ms passaram)
      state.viewMode === 'agenda'       // Modo agenda (dia não tem sync)
    );
  },
  
  // ============ Actions - Navigation ============
  
  /**
   * Seleciona uma data específica (clique no calendário ou FAB)
   * Atualiza selectedDateKey e lastSyncedDateKey para debouncing
   */
  selectDate: (dateKey: string) => {
    set({
      selectedDateKey: dateKey,
      lastSyncedDateKey: dateKey,
    });
  },
  
  /**
   * Sincroniza data a partir do scroll da lista (onScroll)
   * Retorna true se sincronizou, false se bloqueou
   */
  syncFromScroll: (dateKey: string) => {
    const state = get();
    
    // Validação: pode sincronizar?
    if (!state.canSyncFromScroll()) {
      return false;
    }
    
    // Debounce: já está sincronizado com essa data?
    if (dateKey === state.lastSyncedDateKey) {
      return false;
    }
    
    // Sincroniza
    set({
      selectedDateKey: dateKey,
      lastSyncedDateKey: dateKey,
    });
    
    return true;
  },
  
  /**
   * Navega para o dia atual (botão FAB)
   */
  goToToday: () => {
    const today = getTodayDateKey();
    get().selectDate(today);
  },
  
  // ============ Actions - View Mode ============
  
  /**
   * Alterna entre modo dia e agenda
   */
  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
  },
  
  // ============ Actions - Lifecycle ============
  
  /**
   * Marca componente como pronto (após 300ms do mount)
   * Habilita sincronização via scroll
   */
  markReady: () => {
    set({ isReady: true });
  },
  
  /**
   * Reseta store ao estado inicial
   * Útil para testes ou remount
   */
  reset: () => {
    set(getInitialState());
  },
}));

// ============ Selectors (para uso granular) ============

/**
 * Selector: Retorna apenas viewMode
 * Componente só re-renderiza quando viewMode muda
 */
export const useViewMode = () => useAgendaStore((state) => state.viewMode);

/**
 * Selector: Retorna apenas selectedDateKey
 * Componente só re-renderiza quando data selecionada muda
 */
export const useSelectedDateKey = () => useAgendaStore((state) => state.selectedDateKey);

/**
 * Selector: Retorna apenas shouldShowFab
 * Componente só re-renderiza quando visibilidade do FAB muda
 */
export const useShouldShowFab = () => {
  const store = useAgendaStore();
  return store.shouldShowFab();
};

/**
 * Selector: Retorna apenas isReady
 * Componente só re-renderiza quando estado de ready muda
 */
export const useIsReady = () => useAgendaStore((state) => state.isReady);

// ============ Dev Tools ============

if (process.env.NODE_ENV === 'development') {
  // Expõe store globalmente para debug
  if (typeof window !== 'undefined') {
    (window as any).__AGENDA_STORE__ = useAgendaStore;
  }
}
