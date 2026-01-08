import { ViewMode, ViewModeToggle } from '@/components/agenda';
import { AgendaList, AgendaListRef } from '@/components/agenda/AgendaList';
import { CollapsedCalendar, CollapsedCalendarRef } from '@/components/agenda/CollapsedCalendar';
import { useTheme } from '@/contexts/ThemeContext';
import { getTodayDateKey } from '@/utils/agenda';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

// Mock data para testar - agora com dateKey
const mockItems = [
  { id: '1', title: 'Chamado #1234', subtitle: 'Cliente: João Silva', dateKey: '2026-01-07' },
  { id: '2', title: 'Instalação #5678', subtitle: 'Cliente: Maria Santos', dateKey: '2026-01-08' },
  { id: '3', title: 'Chamado #9012', subtitle: 'Cliente: Pedro Costa', dateKey: '2026-01-15' },
  { id: '4', title: 'Instalação #3456', subtitle: 'Cliente: Ana Lima', dateKey: '2026-01-15' },
];

export default function AgendaScreen() {
  console.log('[AgendaScreen] Re-render');
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [activeDateKey, setActiveDateKey] = useState<string>(getTodayDateKey());
  const lastActiveDateKeyRef = useRef<string>(getTodayDateKey());
  const calendarRef = useRef<CollapsedCalendarRef>(null);
  const agendaListRef = useRef<AgendaListRef>(null);
  const currentWeekRef = useRef<number>(-1);
  const isProgrammaticScrollRef = useRef<boolean>(false);

  // Scroll inicial para hoje
  useEffect(() => {
    const todayDateKey = getTodayDateKey();
    console.log('[AgendaScreen] Scrollando para hoje:', todayDateKey);

    // Calcula qual semana é hoje
    // generateCalendarDays() começa 4 semanas antes do domingo atual
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 = domingo, 6 = sábado

    // Domingo da semana atual
    const domingoAtual = new Date(today);
    domingoAtual.setDate(today.getDate() - dayOfWeek);

    // Começa 4 semanas antes
    const startDate = new Date(domingoAtual);
    startDate.setDate(domingoAtual.getDate() - (4 * 7));

    // Calcula quantos dias desde o início até hoje
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const todayDayIndex = diffDays;
    const todayWeekIndex = Math.floor(todayDayIndex / 7);

    console.log('[AgendaScreen] Hoje está no dayIndex:', todayDayIndex, 'weekIndex:', todayWeekIndex);

    // Scroll instantâneo (sem animação) na inicialização
    isProgrammaticScrollRef.current = true;
    currentWeekRef.current = todayWeekIndex;

    // Scrolla tudo sem animação para evitar piscada
    calendarRef.current?.scrollToWeek(todayWeekIndex, false);
    agendaListRef.current?.scrollToDate(todayDateKey, false);
    calendarRef.current?.updateActiveDay(todayDateKey);

    // Reseta flag rapidamente
    const timer = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Controle da lista -> calendário
  const handleActiveHeaderChange = (dateKey: string, dayIndex: number) => {
    console.log('[AgendaScreen] Header ativo:', dateKey, 'dayIndex:', dayIndex);
    
    // Sempre atualiza a ref (sem causar re-render)
    lastActiveDateKeyRef.current = dateKey;
    
    // Só atualiza o state no modo dia (evita re-renders desnecessários no modo agenda)
    if (viewMode === 'day') {
      setActiveDateKey(dateKey);
    }

    // Ignora se é scroll programático (clicou no calendário)
    if (isProgrammaticScrollRef.current) {
      console.log('[AgendaScreen] Ignorando - scroll programático');
      return;
    }

    const weekIndex = Math.floor(dayIndex / 7);

    // Atualiza bolinha (sempre, sem re-render)
    calendarRef.current?.updateActiveDay(dateKey);

    // Scrolla semana (só se mudou)
    if (currentWeekRef.current !== weekIndex) {
      console.log('[AgendaScreen] Scrollando calendário para semana:', weekIndex);
      currentWeekRef.current = weekIndex;
      calendarRef.current?.scrollToWeek(weekIndex, true); // Com animação no scroll normal
    }
  };

  // Controle do calendário -> lista
  const handleDayPress = (dateKey: string) => {
    console.log('[AgendaScreen] Data selecionada no calendário:', dateKey);

    // Atualiza o activeDateKey (importante para modo dia)
    setActiveDateKey(dateKey);

    // Atualiza bolinha imediatamente
    calendarRef.current?.updateActiveDay(dateKey);

    // No modo agenda, scrolla a lista
    if (viewMode === 'agenda') {
      // Marca como scroll programático
      isProgrammaticScrollRef.current = true;

      // Scrolla lista
      agendaListRef.current?.scrollToDate(dateKey);

      // Reseta flag após o scroll terminar
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
    // No modo dia, a lista já atualiza automaticamente via filteredItems
  };

  // Quando mudar de modo, sincroniza o activeDateKey com a ref
  const handleViewModeChange = (newMode: ViewMode) => {
    const previousMode = viewMode;
    
    if (newMode === 'day') {
      // Ao entrar no modo dia, usa o último dia que estava visível
      setActiveDateKey(lastActiveDateKeyRef.current);
    } else if (newMode === 'agenda' && previousMode === 'day') {
      // Ao voltar do modo dia para agenda, agenda o scroll sem animação
      setTimeout(() => {
        console.log('[AgendaScreen] Voltando para modo agenda, scrollando para:', lastActiveDateKeyRef.current);
        
        // Marca como programático para evitar que handleActiveHeaderChange anime o calendário
        isProgrammaticScrollRef.current = true;
        
        // Calcula a semana do dia ativo
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = today.getDay();
        const domingoAtual = new Date(today);
        domingoAtual.setDate(today.getDate() - dayOfWeek);
        const startDate = new Date(domingoAtual);
        startDate.setDate(domingoAtual.getDate() - (4 * 7));
        
        const targetDate = new Date(lastActiveDateKeyRef.current);
        const diffTime = targetDate.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        
        // Atualiza semana e bolinha SEM animação
        currentWeekRef.current = weekIndex;
        calendarRef.current?.scrollToWeek(weekIndex, false);
        calendarRef.current?.updateActiveDay(lastActiveDateKeyRef.current);
        
        // Scrolla lista SEM animação
        agendaListRef.current?.scrollToDate(lastActiveDateKeyRef.current, false);
        
        // Reseta flag após o scroll
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 100);
      }, 100);
    }
    
    setViewMode(newMode);
  };

  // Filtra itens baseado no viewMode
  const filteredItems = viewMode === 'day'
    ? mockItems.filter(item => item.dateKey === activeDateKey)
    : mockItems;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.screenBackground }}>
      <View style={{ backgroundColor: colors.cardBackground }}>
        <ViewModeToggle value={viewMode} onChange={handleViewModeChange} />
        <CollapsedCalendar ref={calendarRef} onDayPress={handleDayPress} />
      </View>

      <AgendaList
        ref={agendaListRef}
        items={filteredItems}
        viewMode={viewMode}
        activeDateKey={activeDateKey}
        onActiveHeaderChange={handleActiveHeaderChange}
        onScrollBeginDrag={() => {
          console.log('[AgendaScreen] Usuário começou scroll manual');
          isProgrammaticScrollRef.current = false;
        }}
      />
    </View>
  );
}