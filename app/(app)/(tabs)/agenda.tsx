import {
  AgendaItemCard,
  CollapsedCalendar,
  CollapsedCalendarRef,
} from '@/components/agenda';
import { useTheme } from '@/contexts/ThemeContext';
import { useAgenda, useInvalidateAgenda } from '@/hooks/agenda';
import { isChamado, ServicoAgenda } from '@/services/api/agenda';
import { useAgendaCalendarStore } from '@/stores/useAgendaCalendarStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Tipos para lista achatada (FlatList)
type FlatListItem = 
  | { type: 'header'; id: string; title: string; dateKey: string; isToday: boolean; isTomorrow: boolean; isPast: boolean }
  | { type: 'item'; id: string; data: ServicoAgenda }
  | { type: 'empty'; id: string; dateKey: string };

// Modo de visualização
type ViewMode = 'day' | 'agenda';

// Alturas fixas para getItemLayout
const HEADER_HEIGHT = 40;
const ITEM_HEIGHT = 100; // Card com padding 12 + conteúdo compacto
const EMPTY_HEIGHT = 36;

// Componentes memoizados para renderItem (evita re-criação)
const HeaderItem = memo(function HeaderItem({ 
  title, 
  isToday, 
  backgroundColor,
  textColorToday,
  textColorNormal,
  lineColorToday,
  lineColorNormal,
}: { 
  title: string; 
  isToday: boolean; 
  backgroundColor: string;
  textColorToday: string;
  textColorNormal: string;
  lineColorToday: string;
  lineColorNormal: string;
}) {
  const textColor = isToday ? textColorToday : textColorNormal;
  const lineColor = isToday ? lineColorToday : lineColorNormal;
  const fontWeight = isToday ? '700' : '500';

  return (
    <View
      style={{
        backgroundColor,
        height: HEADER_HEIGHT,
        justifyContent: 'center',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ height: 1, flex: 1, backgroundColor: lineColor, marginRight: 12 }} />
        <Text
          style={{
            fontSize: 13,
            fontWeight: fontWeight,
            color: textColor,
          }}
        >
          {title}
        </Text>
        <View style={{ height: 1, flex: 1, backgroundColor: lineColor, marginLeft: 12 }} />
      </View>
    </View>
  );
});

const EmptyItem = memo(function EmptyItem({ textColor }: { textColor: string }) {
  return (
    <View style={{ height: EMPTY_HEIGHT, justifyContent: 'center', paddingLeft: 16 }}>
      <Text style={{ fontSize: 13, color: textColor, fontStyle: 'italic' }}>
        Sem agendamentos
      </Text>
    </View>
  );
});

const ServiceItem = memo(function ServiceItem({ 
  servico, 
  onPress 
}: { 
  servico: ServicoAgenda; 
  onPress: () => void;
}) {
  return (
    <View style={{ height: ITEM_HEIGHT }}>
      <AgendaItemCard item={servico} onPress={onPress} />
    </View>
  );
});

// Gera array de datas de D-30 a D+30 (61 dias)
const gerarDatasFixas = () => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const datas: Date[] = [];
  for (let i = -30; i <= 30; i++) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() + i);
    datas.push(data);
  }
  return datas;
};

export default function AgendaScreen() {
  const { data: servicos, isLoading, isFetching, error } = useAgenda();
  const { invalidate } = useInvalidateAgenda();
  const { colors } = useTheme();
  const router = useRouter();
  const flatListRef = useRef<FlatList<FlatListItem>>(null);
  const calendarRef = useRef<CollapsedCalendarRef>(null);

  // Controle do FAB (usando refs para evitar re-renders)
  const showTodayFabRef = useRef(false);
  const todayIsAboveRef = useRef(false);
  const fabOpacity = useRef(new Animated.Value(0)).current;

  // Data de hoje (constante)
  const todayDateKey = new Date().toISOString().split('T')[0];

  // Modo de visualização (padrão: dia)
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  
  // Dia selecionado no calendário (para modo dia)
  const selectedDateKey = useAgendaCalendarStore((state) => state.selectedDateKey);

  // Controla FAB no modo dia baseado no selectedDateKey
  useEffect(() => {
    if (viewMode !== 'day') return;
    
    const shouldShow = selectedDateKey !== todayDateKey;
    if (shouldShow !== showTodayFabRef.current) {
      showTodayFabRef.current = shouldShow;
      Animated.timing(fabOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [viewMode, selectedDateKey, todayDateKey, fabOpacity]);

  const handleRefresh = async () => {
    await invalidate();
  };

  // Gera lista achatada com headers + itens + vazios + offsets pré-calculados
  const { flatData, todayHeaderIndex, itemLayouts } = useMemo(() => {
    const datasFixas = gerarDatasFixas();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    // Mapeia serviços por dateKey
    const servicosPorData = new Map<string, ServicoAgenda[]>();

    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        if (!servico.visita) continue;
        try {
          const dataServico = new Date(servico.visita.replace(' ', 'T'));
          dataServico.setHours(0, 0, 0, 0);
          const dateKey = dataServico.toISOString().split('T')[0];

          if (!servicosPorData.has(dateKey)) {
            servicosPorData.set(dateKey, []);
          }
          servicosPorData.get(dateKey)!.push(servico);
        } catch {
          // Ignora datas inválidas
        }
      }
    }

    // Constrói lista achatada E pré-calcula layouts
    const items: FlatListItem[] = [];
    const layouts: { length: number; offset: number; index: number }[] = [];
    let todayIdx = 0;
    let currentOffset = 0;

    for (let i = 0; i < datasFixas.length; i++) {
      const data = datasFixas[i];
      const dateKey = data.toISOString().split('T')[0];
      const isToday = data.getTime() === hoje.getTime();
      const isTomorrow = data.getTime() === amanha.getTime();
      const isPast = data < hoje;

      // Formata título
      const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
      const diaSemanaCapitalizado =
        diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
      const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      });

      let title: string;
      if (isToday) {
        title = `Hoje, ${dataFormatada}`;
        todayIdx = items.length; // Captura índice ANTES de adicionar o header
      } else if (isTomorrow) {
        title = `Amanhã, ${dataFormatada}`;
      } else {
        title = `${diaSemanaCapitalizado}, ${dataFormatada}`;
      }

      // Adiciona header + layout
      items.push({
        type: 'header',
        id: `header-${dateKey}`,
        title,
        dateKey,
        isToday,
        isTomorrow,
        isPast,
      });
      layouts.push({ length: HEADER_HEIGHT, offset: currentOffset, index: items.length - 1 });
      currentOffset += HEADER_HEIGHT;

      // Adiciona itens do dia ou placeholder vazio
      const servicosDoDia = servicosPorData.get(dateKey);
      if (servicosDoDia && servicosDoDia.length > 0) {
        for (const servico of servicosDoDia) {
          items.push({
            type: 'item',
            id: servico.id,
            data: servico,
          });
          layouts.push({ length: ITEM_HEIGHT, offset: currentOffset, index: items.length - 1 });
          currentOffset += ITEM_HEIGHT;
        }
      } else {
        items.push({
          type: 'empty',
          id: `empty-${dateKey}`,
          dateKey,
        });
        layouts.push({ length: EMPTY_HEIGHT, offset: currentOffset, index: items.length - 1 });
        currentOffset += EMPTY_HEIGHT;
      }
    }

    return { flatData: items, todayHeaderIndex: todayIdx, itemLayouts: layouts };
  }, [servicos]);

  // Dados filtrados para modo dia (só mostra o dia selecionado)
  // Sempre calcula para estar pronto quando mudar de modo
  const { dayModeData, dayModeLayouts } = useMemo(() => {
    const items: FlatListItem[] = [];
    const layouts: { length: number; offset: number; index: number }[] = [];
    let currentOffset = 0;
    let foundHeader = false;
    
    for (const item of flatData) {
      if (item.type === 'header') {
        if (item.dateKey === selectedDateKey) {
          foundHeader = true;
          items.push(item);
          layouts.push({ length: HEADER_HEIGHT, offset: currentOffset, index: items.length - 1 });
          currentOffset += HEADER_HEIGHT;
        } else if (foundHeader) {
          // Chegou no próximo header, para
          break;
        }
      } else if (foundHeader) {
        items.push(item);
        const height = item.type === 'empty' ? EMPTY_HEIGHT : ITEM_HEIGHT;
        layouts.push({ length: height, offset: currentOffset, index: items.length - 1 });
        currentOffset += height;
      }
    }
    
    return { dayModeData: items, dayModeLayouts: layouts };
  }, [flatData, selectedDateKey]);

  // Dados ativos baseado no modo
  const activeData = viewMode === 'day' ? dayModeData : flatData;
  const activeLayouts = viewMode === 'day' ? dayModeLayouts : itemLayouts;

  // Mapa de dateKey -> índice do header para navegação rápida
  const dateKeyToIndex = useMemo(() => {
    const map = new Map<string, number>();
    flatData.forEach((item, index) => {
      if (item.type === 'header') {
        map.set(item.dateKey, index);
      }
    });
    return map;
  }, [flatData]);

  // getItemLayout O(1) - usa layouts pré-calculados
  const getItemLayout = useCallback(
    (_: any, index: number) => activeLayouts[index] || { length: 0, offset: 0, index },
    [activeLayouts]
  );

  // Pré-calcula índices dos headers para sticky (evita recalcular em cada render)
  const stickyHeaderIndices = useMemo(
    () =>
      activeData
        .map((item, idx) => (item.type === 'header' ? idx : null))
        .filter((idx): idx is number => idx !== null),
    [activeData]
  );

  // Refs de controle (declarados antes dos callbacks que os usam)
  const isScrollingFromCalendar = useRef(false);
  const lastSyncedDateKey = useRef<string>(todayDateKey);
  
  // Flag para ignorar onScroll durante mount inicial (evita sync errado)
  const isMountedRef = useRef(false);
  setTimeout(() => { isMountedRef.current = true; }, 300);

  // Scroll para hoje (funciona nos dois modos)
  const scrollToToday = useCallback(() => {
    // Esconde FAB imediatamente
    showTodayFabRef.current = false;
    Animated.timing(fabOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    // Atualiza store diretamente (sem hook = sem re-render)
    useAgendaCalendarStore.getState().setSelectedDateKey(todayDateKey);
    lastSyncedDateKey.current = todayDateKey;

    // Faz scroll do calendário
    calendarRef.current?.scrollToToday(false);

    // No modo agenda, também scrolla a lista
    if (viewMode === 'agenda' && flatListRef.current && todayHeaderIndex >= 0) {
      // Bloqueia onScroll de interferir
      isScrollingFromCalendar.current = true;

      flatListRef.current.scrollToIndex({
        index: todayHeaderIndex,
        animated: false,
        viewPosition: 0,
      });

      // Libera após o scroll terminar
      setTimeout(() => {
        isScrollingFromCalendar.current = false;
      }, 100);
    }
  }, [todayHeaderIndex, todayDateKey, fabOpacity, viewMode]);

  // Scroll para data específica (do calendário)

  const scrollToDate = useCallback(
    (dateKey: string) => {
      // No modo dia, não precisa scrollar - a lista já vai mostrar o dia selecionado
      if (viewMode === 'day') {
        lastSyncedDateKey.current = dateKey;
        return;
      }
      
      const index = dateKeyToIndex.get(dateKey);
      if (index === undefined || !flatListRef.current) return;

      // Marca que estamos scrollando via calendário para ignorar onScroll
      isScrollingFromCalendar.current = true;
      lastSyncedDateKey.current = dateKey;

      // Não precisa setar o store aqui - CalendarDayItem já faz isso
      flatListRef.current.scrollToIndex({
        index,
        animated: false,
        viewPosition: 0,
      });

      // Libera após o scroll terminar
      setTimeout(() => {
        isScrollingFromCalendar.current = false;
      }, 50);
    },
    [dateKeyToIndex, viewMode]
  );

  // Sincroniza calendário usando onScroll (mais rápido que onViewableItemsChanged)
  // Só funciona no modo agenda
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Ignora no modo dia ou se scroll foi iniciado pelo calendário
      if (viewMode === 'day' || isScrollingFromCalendar.current || !isMountedRef.current) return;

      const offsetY = event.nativeEvent.contentOffset.y;

      // Adiciona tolerância para detectar o header correto
      // Quando scrollamos para um header, queremos que ele seja detectado
      const adjustedOffset = offsetY + HEADER_HEIGHT / 2;

      // Busca binária para encontrar o item no offset atual
      let left = 0;
      let right = itemLayouts.length - 1;
      let foundIndex = 0;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const layout = itemLayouts[mid];

        if (layout.offset <= adjustedOffset) {
          foundIndex = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      // Se encontrou um item, verifica se é header ou busca o header anterior
      const item = flatData[foundIndex];
      let headerDateKey: string | null = null;

      if (item?.type === 'header') {
        headerDateKey = item.dateKey;
      } else {
        // Busca o header anterior
        let headerIndex = foundIndex - 1;
        while (headerIndex >= 0 && flatData[headerIndex]?.type !== 'header') {
          headerIndex--;
        }
        if (headerIndex >= 0) {
          const header = flatData[headerIndex];
          if (header?.type === 'header') {
            headerDateKey = header.dateKey;
          }
        }
      }

      if (headerDateKey && headerDateKey !== lastSyncedDateKey.current) {
        lastSyncedDateKey.current = headerDateKey;
        calendarRef.current?.scrollToDate(headerDateKey, false);
        // Atualiza store diretamente (sem hook = sem re-render do componente)
        useAgendaCalendarStore.getState().setSelectedDateKey(headerDateKey);
      }
    },
    [viewMode, itemLayouts, flatData]
  );

  // Monitora visibilidade apenas para FAB (usa refs para evitar re-renders)
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0) return;

      // Verifica se header do "Hoje" está visível
      const todayVisible = viewableItems.some(
        (v) => v.item?.type === 'header' && v.item?.isToday
      );

      const shouldShow = !todayVisible;
      
      // Só anima se mudou
      if (shouldShow !== showTodayFabRef.current) {
        showTodayFabRef.current = shouldShow;
        Animated.timing(fabOpacity, {
          toValue: shouldShow ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      if (!todayVisible) {
        // Determina direção baseado no primeiro item visível
        const firstVisibleHeader = viewableItems.find(
          (v) => v.item?.type === 'header'
        );
        if (firstVisibleHeader && firstVisibleHeader.index !== null) {
          todayIsAboveRef.current = firstVisibleHeader.index > todayHeaderIndex;
        }
      }
    },
    [todayHeaderIndex, fabOpacity]
  );

  // Config mais responsiva para detectar mudanças rapidamente
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 1,
    minimumViewTime: 0,
  }).current;

  // Renderiza item baseado no tipo (usando componentes memoizados)
  const renderItem = useCallback(({ item }: { item: FlatListItem }) => {
    if (item.type === 'header') {
      return (
        <HeaderItem 
          title={item.title} 
          isToday={item.isToday} 
          backgroundColor={colors.screenBackground}
          textColorToday={colors.tabBarActiveTint}
          textColorNormal={colors.cardTextSecondary}
          lineColorToday={colors.tabBarActiveTint}
          lineColorNormal={colors.cardBorder}
        />
      );
    }
    
    if (item.type === 'empty') {
      return <EmptyItem textColor={colors.cardTextSecondary} />;
    }
    
    // type === 'item'
    const servico = item.data;
    const route = isChamado(servico)
      ? `/detalhes/chamado/${servico.uuid_suporte}`
      : `/detalhes/instalacao/${(servico as any).uuid_solic}`;

    return (
      <ServiceItem 
        servico={servico} 
        onPress={() => router.push(route as any)} 
      />
    );
  }, [colors, router]);

  if (isLoading && !servicos) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: colors.cardTextSecondary, marginTop: 16 }}>Carregando agenda...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Erro ao carregar agenda
        </Text>
        <Text style={{ color: colors.cardTextSecondary }} className="text-center mb-4">
          {error.message}
        </Text>
        <TouchableOpacity
          onPress={invalidate}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-2"
          activeOpacity={0.7}
        >
          <Text className="text-white font-semibold">Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.screenBackground }}>
      {/* Toggle + Calendário colapsado no topo */}
      <View style={{ backgroundColor: colors.cardBackground }}>
        {/* Toggle Dia/Agenda - estilo badge pill, alinhado à esquerda */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'flex-start',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 4,
        }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.searchInputBackground,
            borderRadius: 20,
            padding: 3,
          }}>
            <TouchableOpacity
              onPress={() => setViewMode('day')}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: viewMode === 'day' ? colors.tabBarActiveTint : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: viewMode === 'day' ? '#ffffff' : colors.cardTextSecondary,
              }}>
                Dia
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setViewMode('agenda')}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: viewMode === 'agenda' ? colors.tabBarActiveTint : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: viewMode === 'agenda' ? '#ffffff' : colors.cardTextSecondary,
              }}>
                Agenda
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendário colapsado */}
        <CollapsedCalendar
          ref={calendarRef}
          onSelectDate={(dateKey) => scrollToDate(dateKey)}
        />
      </View>

      <FlatList
        key={viewMode} // Força remount quando muda o modo
        ref={flatListRef}
        data={activeData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialScrollIndex={viewMode === 'agenda' ? todayHeaderIndex : undefined}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        stickyHeaderIndices={viewMode === 'agenda' ? stickyHeaderIndices : undefined}
        // Otimizações de performance
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        updateCellsBatchingPeriod={100}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
        }
        onScroll={viewMode === 'agenda' ? onScroll : undefined}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewMode === 'agenda' ? onViewableItemsChanged : undefined}
        viewabilityConfig={viewabilityConfig}
        onScrollToIndexFailed={(info) => {
          // Fallback silencioso: scroll via offset
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: false,
          });
        }}
      />

      {/* FAB - Voltar para Hoje */}
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: 24,
          right: 20,
          opacity: fabOpacity,
        }}
      >
        <TouchableOpacity
          onPress={scrollToToday}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.tabBarActiveTint,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="today-outline" size={16} color="white" />
          <Text
            style={{
              color: 'white',
              fontSize: 13,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Hoje
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
