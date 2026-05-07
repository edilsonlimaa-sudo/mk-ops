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
import { agendaFetchFailureMessage } from '@/utils/agendaFetchFailureMessage';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const isNavigatingToDetailsRef = useRef(false);
  const navigationUnlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigationUnlockTimeoutRef.current) {
        clearTimeout(navigationUnlockTimeoutRef.current);
      }
    };
  }, []);

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
  const { data: servicos, isPending, error, refetch } = useAgenda();

  // Handler para pull-to-refresh (apenas modo dia)
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
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

  /** True após qualquer fetch bem-sucedido (inclui lista vazia). Evita tela de erro no refresh offline. */
  const hasAgendaSnapshot = servicos !== undefined;

  // Função para navegar aos detalhes
  const handleItemPress = (item: any) => {
    if (isNavigatingToDetailsRef.current) {
      return;
    }

    isNavigatingToDetailsRef.current = true;
    if (navigationUnlockTimeoutRef.current) {
      clearTimeout(navigationUnlockTimeoutRef.current);
    }
    navigationUnlockTimeoutRef.current = setTimeout(() => {
      isNavigatingToDetailsRef.current = false;
      navigationUnlockTimeoutRef.current = null;
    }, 900);

    if (item.isChamado) {
      router.push(`/detalhes/chamado/${item.uuid}`);
    } else {
      router.push(`/detalhes/instalacao/${item.uuid}`);
    }
  };

  // Estados de loading e erro
  if (isPending) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Carregando agenda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !hasAgendaSnapshot) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {agendaFetchFailureMessage(error, 'initial')}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-4 px-4 py-2 rounded-lg"
            style={{ backgroundColor: colors.tint }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '600' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.screenBackground }} edges={['bottom']}>
      <ThemedView variant="header">
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        {error && hasAgendaSnapshot ? (
          <View
            className="mx-3 mt-2 mb-1 px-3 py-2 rounded-lg border flex-row items-start justify-between gap-2"
            style={{
              backgroundColor: '#f59e0b15',
              borderColor: '#f59e0b55',
            }}
          >
            <View className="flex-1">
              <Text className="text-xs leading-snug" style={{ color: colors.text }}>
                {agendaFetchFailureMessage(error, 'refresh')}
              </Text>
              <Text className="text-xs leading-snug mt-1" style={{ color: colors.cardTextSecondary }}>
                Os dados exibidos são os últimos carregados.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRefresh}
              className="px-2 py-1 rounded shrink-0"
              style={{ backgroundColor: '#f59e0b' }}
            >
              <Text className="text-xs font-semibold" style={{ color: '#ffffff' }}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
});
