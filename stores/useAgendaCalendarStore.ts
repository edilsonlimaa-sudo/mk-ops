import { create } from 'zustand';

interface AgendaCalendarState {
  selectedDateKey: string;
  setSelectedDateKey: (dateKey: string) => void;
}

// Pega data de hoje como default
const getTodayDateKey = () => new Date().toISOString().split('T')[0];

export const useAgendaCalendarStore = create<AgendaCalendarState>((set) => ({
  selectedDateKey: getTodayDateKey(),
  setSelectedDateKey: (dateKey) => set({ selectedDateKey: dateKey }),
}));

// Selector para evitar re-renders quando não precisa do valor
export const useSelectedDateKey = () =>
  useAgendaCalendarStore((state) => state.selectedDateKey);

export const useSetSelectedDateKey = () =>
  useAgendaCalendarStore((state) => state.setSelectedDateKey);
