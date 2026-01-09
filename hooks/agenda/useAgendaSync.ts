import { AgendaListV2Ref } from '@/components/agenda/AgendaListV2';
import { CollapsedCalendarV2Ref } from '@/components/agenda/CollapsedCalendarV2';
import { DayListV2Ref } from '@/components/agenda/DayListV2';
import { getTodayDateKey } from '@/utils/agenda';
import { useRef } from 'react';

export type ViewMode = 'agenda' | 'day';

/**
 * Hook que gerencia a sincronização bidirecional entre calendário e listas
 * Encapsula toda a lógica de refs, callbacks e prevenção de loops
 */
export function useAgendaSync(viewMode: ViewMode) {
  // Estado silencioso - não causa re-render
  const activeDateKeyRef = useRef<string>(getTodayDateKey());
  
  // Refs dos componentes
  const calendarRef = useRef<CollapsedCalendarV2Ref>(null);
  const agendaListRef = useRef<AgendaListV2Ref>(null);
  const dayListRef = useRef<DayListV2Ref>(null);
  
  // Flag para evitar loop de sincronização
  const isProgrammaticScrollRef = useRef(false);

  /**
   * Handler para quando o usuário clica em um dia no calendário
   * Sincroniza o calendário e scrolla a lista apropriada
   */
  const handleDayPress = (dateKey: string) => {
    activeDateKeyRef.current = dateKey;
    
    // Sincroniza o calendário
    calendarRef.current?.setActiveDateInstant(dateKey);
    
    // Desabilita callback durante scroll programático
    isProgrammaticScrollRef.current = true;
    
    // Sincroniza a lista conforme o modo
    if (viewMode === 'agenda') {
      agendaListRef.current?.setActiveDateAnimated(dateKey);
    } else {
      dayListRef.current?.setDateKey(dateKey);
    }
    
    // Reabilita callback após a animação terminar
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 300);
  };

  /**
   * Handler para quando o usuário scrolla a lista (modo agenda)
   * Sincroniza o calendário quando o header ativo muda
   */
  const handleActiveHeaderChange = (dateKey: string) => {
    // Ignora mudanças durante scroll programático
    if (isProgrammaticScrollRef.current) return;
    
    activeDateKeyRef.current = dateKey;
    
    // Sincroniza o calendário quando a lista scrolla
    calendarRef.current?.setActiveDateAnimated(dateKey);
  };

  /**
   * Navega instantaneamente para o dia de hoje
   * Sincroniza calendário e lista sem animação
   */
  const goToToday = () => {
    const todayKey = getTodayDateKey();
    activeDateKeyRef.current = todayKey;

    // Sincroniza calendário sem animação
    calendarRef.current?.setActiveDateInstant(todayKey);

    // Sincroniza lista conforme o modo, sem animação
    if (viewMode === 'agenda') {
      agendaListRef.current?.setActiveDateInstant(todayKey);
    } else {
      dayListRef.current?.setDateKey(todayKey);
    }
  };

  return {
    activeDateKeyRef,
    calendarRef,
    agendaListRef,
    dayListRef,
    handleDayPress,
    handleActiveHeaderChange,
    goToToday,
  };
}
