import { ViewMode, ViewModeToggle } from '@/components/agenda';
import { AgendaListV2, AgendaListV2Ref } from '@/components/agenda/AgendaListV2';
import { CollapsedCalendarV2, CollapsedCalendarV2Ref } from '@/components/agenda/CollapsedCalendarV2';
import { DayListV2, DayListV2Ref } from '@/components/agenda/DayListV2';
import { useTheme } from '@/contexts/ThemeContext';
import { getTodayDateKey } from '@/utils/agenda';
import { useRef, useState } from 'react';
import { View } from 'react-native';

// Mock data para testar
const mockItems = [
  { id: '1', title: 'Chamado #1234', subtitle: 'Cliente: João Silva', dateKey: '2026-01-07' },
  { id: '2', title: 'Instalação #5678', subtitle: 'Cliente: Maria Santos', dateKey: '2026-01-08' },
  { id: '3', title: 'Chamado #9012', subtitle: 'Cliente: Pedro Costa', dateKey: '2026-01-15' },
  { id: '4', title: 'Instalação #3456', subtitle: 'Cliente: Ana Lima', dateKey: '2026-01-15' },
];

export default function AgendaV2Screen() {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');

  // Estado silencioso - não causa re-render
  const activeDateKeyRef = useRef<string>(getTodayDateKey());
  const calendarRef = useRef<CollapsedCalendarV2Ref>(null);
  const agendaListRef = useRef<AgendaListV2Ref>(null);
  const dayListRef = useRef<DayListV2Ref>(null);
  
  // Flag para evitar loop de sincronização
  const isProgrammaticScrollRef = useRef(false);

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

  const handleActiveHeaderChange = (dateKey: string) => {
    // Ignora mudanças durante scroll programático
    if (isProgrammaticScrollRef.current) return;
    
    activeDateKeyRef.current = dateKey;
    
    // Sincroniza o calendário quando a lista scrolla
    calendarRef.current?.setActiveDateAnimated(dateKey);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.screenBackground }}>
      <View style={{ backgroundColor: colors.cardBackground }}>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <CollapsedCalendarV2 
          ref={calendarRef} 
          initialDateKey={activeDateKeyRef.current} 
          onDayPress={handleDayPress}
        />
      </View>
      {viewMode === 'agenda'
        ? (<AgendaListV2 
            ref={agendaListRef} 
            items={mockItems} 
            initialDateKey={activeDateKeyRef.current}
            onActiveHeaderChange={handleActiveHeaderChange}
          />)
        : (<DayListV2 ref={dayListRef} items={mockItems} initialDateKey={activeDateKeyRef.current} />)
      }
    </View>
  );
}
