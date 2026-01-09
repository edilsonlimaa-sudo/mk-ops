import { ViewMode, ViewModeToggle } from '@/components/agenda';
import { AgendaListV2 } from '@/components/agenda/AgendaListV2';
import { CollapsedCalendarV2 } from '@/components/agenda/CollapsedCalendarV2';
import { DayListV2 } from '@/components/agenda/DayListV2';
import { TodayFab } from '@/components/agenda/TodayFab';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useAgenda } from '@/hooks/agenda';
import { useAgendaSync } from '@/hooks/agenda/useAgendaSync';
import { isChamado } from '@/utils/agenda';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Tela principal do app - Agenda V2
 * Migrado de (tabs)/agenda-v2.tsx para ser a tela inicial do Drawer
 */
export default function AgendaScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hook de sincronização entre calendário e listas
  const {
    activeDateKeyRef,
    calendarRef,
    agendaListRef,
    dayListRef,
    todayFabRef,
    handleDayPress,
    handleActiveHeaderChange,
    goToToday,
  } = useAgendaSync(viewMode);

  // Busca dados reais da agenda
  const { data: servicos, isLoading, error, refetch } = useAgenda();

  // Handler para pull-to-refresh (apenas modo dia)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // Transforma os serviços em formato para as listas
  const items = useMemo(() => {
    if (!servicos || servicos.length === 0) return [];

    return servicos.map((servico) => {
      const isChamadoType = isChamado(servico);
      
      // Extrai dateKey da visita
      let dateKey = '';
      let horario = '';
      try {
        if (servico.visita) {
          const dataServico = new Date(servico.visita.replace(' ', 'T'));
          dateKey = dataServico.toISOString().split('T')[0];
          // Extrai horário (HH:MM)
          const parts = servico.visita.split(' ');
          if (parts.length > 1) {
            const timeParts = parts[1].split(':');
            horario = `${timeParts[0]}:${timeParts[1]}`;
          }
        }
      } catch {
        dateKey = '';
      }

      // Verifica se está fechado/concluído
      const isConcluido = isChamadoType 
        ? servico.status === 'fechado' || !!servico.fechamento
        : servico.status === 'concluido';

      return {
        id: `${isChamadoType ? 'chamado' : 'instalacao'}-${servico.id}`,
        title: isChamadoType ? `Chamado #${servico.id}` : `Instalação #${servico.id}`,
        subtitle: `Cliente: ${servico.nome || 'Sem nome'}`,
        dateKey,
        servico, // Passa o serviço completo
        isChamado: isChamadoType,
        isConcluido,
        horario,
        uuid: isChamadoType ? servico.uuid_suporte : servico.uuid_solic, // UUID para navegação
      };
    }).filter(item => item.dateKey !== ''); // Remove itens sem data válida
  }, [servicos]);

  // Função para navegar aos detalhes
  const handleItemPress = (item: any) => {
    if (item.isChamado) {
      router.push(`/detalhes/chamado/${item.uuid}`);
    } else {
      router.push(`/detalhes/instalacao/${item.uuid}`);
    }
  };

  // Estados de loading e erro
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Carregando agenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Erro ao carregar agenda</Text>
          <Text style={[styles.errorSubtext, { color: colors.cardTextSecondary }]}>
            {error.message || 'Tente novamente mais tarde'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
      <ThemedView variant="header">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <CollapsedCalendarV2 
          ref={calendarRef} 
          initialDateKey={activeDateKeyRef.current} 
          onDayPress={handleDayPress}
        />
      </ThemedView>
      {viewMode === 'agenda'
        ? (<AgendaListV2 
            ref={agendaListRef} 
            items={items} 
            initialDateKey={activeDateKeyRef.current}
            onActiveHeaderChange={handleActiveHeaderChange}
            onItemPress={handleItemPress}
          />)
        : (<DayListV2 
            ref={dayListRef} 
            items={items} 
            initialDateKey={activeDateKeyRef.current}
            onItemPress={handleItemPress}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />)
      }

      {/* FAB - Go to Today */}
      <TodayFab ref={todayFabRef} onPress={goToToday} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
