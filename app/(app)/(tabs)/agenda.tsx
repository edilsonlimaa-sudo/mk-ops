import { AgendaList, AgendaListRef } from '@/components/agenda/AgendaList';
import { CollapsedCalendar, CollapsedCalendarRef } from '@/components/agenda/CollapsedCalendar';
import { useTheme } from '@/contexts/ThemeContext';
import { useRef } from 'react';
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
  const calendarRef = useRef<CollapsedCalendarRef>(null);
  const agendaListRef = useRef<AgendaListRef>(null);
  const currentWeekRef = useRef<number>(-1);

  // Controle da lista -> calendário
  const handleActiveHeaderChange = (dateKey: string, dayIndex: number) => {
    console.log('[AgendaScreen] Header ativo:', dateKey, 'dayIndex:', dayIndex);
    
    const weekIndex = Math.floor(dayIndex / 7);
    
    if (currentWeekRef.current !== weekIndex) {
      console.log('[AgendaScreen] Scrollando calendário para semana:', weekIndex);
      currentWeekRef.current = weekIndex;
      calendarRef.current?.scrollToWeek(weekIndex);
    }
  };

  // Controle do calendário -> lista
  const handleDayPress = (dateKey: string) => {
    console.log('[AgendaScreen] Data selecionada no calendário:', dateKey);
    agendaListRef.current?.scrollToDate(dateKey);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.screenBackground }}>
      <CollapsedCalendar ref={calendarRef} onDayPress={handleDayPress} />
      <AgendaList 
        ref={agendaListRef} 
        items={mockItems} 
        onActiveHeaderChange={handleActiveHeaderChange}
      />
    </View>
  );
}

  // // Controle do FAB (usando refs para evitar re-renders)
  // const showTodayFabRef = useRef(false);
  // const todayIsAboveRef = useRef(false);
  // const fabOpacity = useRef(new Animated.Value(0)).current;
  
  // // Rastreia domingo da semana atual (não mais necessário - calendário é fixo)
  // const currentCalendarSunday = useRef<number>(-1);

  // // Data de hoje (constante)
  // const todayDateKey = new Date().toISOString().split('T')[0];

  // // Store centralizado - NÃO subscreve selectedDateKey para evitar re-renders
  // const store = useAgendaStore();
  // const viewMode = store.viewMode;
  // const setViewMode = store.setViewMode;
  
  // // Usa ref para selectedDateKey para não causar re-render
  // const selectedDateKeyRef = useRef(store.selectedDateKey);
  
  // // Atualiza ref quando necessário (sem causar re-render)
  // useEffect(() => {
  //   const unsubscribe = useAgendaStore.subscribe((state) => {
  //     selectedDateKeyRef.current = state.selectedDateKey;
      
  //     // Atualiza FAB apenas no modo dia
  //     if (viewMode === 'day') {
  //       const shouldShow = state.selectedDateKey !== todayDateKey;
  //       if (shouldShow !== showTodayFabRef.current) {
  //         showTodayFabRef.current = shouldShow;
  //         Animated.timing(fabOpacity, {
  //           toValue: shouldShow ? 1 : 0,
  //           duration: 200,
  //           useNativeDriver: true,
  //         }).start();
  //       }
  //     }
  //   });
  //   return unsubscribe;
  // }, [viewMode, todayDateKey, fabOpacity]);

  // const handleRefresh = async () => {
  //   await invalidate();
  // };

  // // Hook que transforma servicos em dados otimizados para FlatList
  // const {
  //   activeData,
  //   activeLayouts,
  //   flatData,
  //   itemLayouts,
  //   todayHeaderIndex,
  //   dateKeyToIndex,
  //   stickyHeaderIndices,
  // } = useAgendaData(servicos, selectedDateKeyRef.current, viewMode);

  // // getItemLayout O(1) - usa layouts pré-calculados
  // const getItemLayout = useCallback(
  //   (_: any, index: number) => activeLayouts[index] || { length: 0, offset: 0, index },
  //   [activeLayouts]
  // );
  
  // // Marca componente como pronto após 300ms (habilita sync)
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     store.markReady();
  //   }, 300);
  //   return () => clearTimeout(timer);
  // }, [store]);

  // // Scroll para hoje (funciona nos dois modos)
  // const scrollToToday = useCallback(() => {
  //   // Esconde FAB imediatamente
  //   showTodayFabRef.current = false;
  //   Animated.timing(fabOpacity, {
  //     toValue: 0,
  //     duration: 150,
  //     useNativeDriver: true,
  //   }).start();

  //   // Usa action do store (bloqueia sync automático + atualiza selectedDateKey)
  //   store.goToToday();

  //   // No modo agenda, também scrolla a lista
  //   if (viewMode === 'agenda' && flatListRef.current && todayHeaderIndex >= 0) {
  //     flatListRef.current.scrollToIndex({
  //       index: todayHeaderIndex,
  //       animated: false,
  //       viewPosition: 0,
  //     });
  //   }
  // }, [todayHeaderIndex, fabOpacity, viewMode, store]);

  // // Scroll para data específica (do calendário)
  // const scrollToDate = useCallback(
  //   (dateKey: string) => {
  //     // No modo dia, não precisa scrollar - a lista já vai mostrar o dia selecionado
  //     if (viewMode === 'day') return;
      
  //     const index = dateKeyToIndex.get(dateKey);
  //     if (index === undefined || !flatListRef.current) return;

  //     // Calcula domingo da semana quando clica no calendário
  //     const date = new Date(dateKey);
  //     const dayOfWeek = date.getDay(); // 0 = domingo, 6 = sábado
  //     const sundayIndex = index - dayOfWeek;
  //     currentCalendarSunday.current = sundayIndex;

  //     // Scroll físico da lista
  //     flatListRef.current.scrollToIndex({
  //       index,
  //       animated: false,
  //       viewPosition: 0,
  //     });
  //   },
  //   [dateKeyToIndex, viewMode]
  // );

  // // Sincroniza calendário usando onScroll (arquitetura de semanas D-S)
  // // Bolinha corre livremente, calendário só scrolla quando muda de semana
  // const onScroll = useCallback(
  //   (event: NativeSyntheticEvent<NativeScrollEvent>) => {
  //     const t0 = performance.now();
  //     const offsetY = event.nativeEvent.contentOffset.y;

  //     // Busca header no offset atual usando busca binária
  //     const headerDateKey = findHeaderAtOffset(offsetY, itemLayouts, flatData, HEADER_HEIGHT);
      
  //     if (!headerDateKey) return;
      
  //     const t1 = performance.now();
  //     console.log(`[onScroll] Detectou ${headerDateKey} em ${(t1 - t0).toFixed(2)}ms`);
      
  //     // ATUALIZA BOLINHA IMEDIATAMENTE (sem esperar re-render)
  //     calendarRef.current?.updateBolinhaFromScroll(headerDateKey);
      
  //     const t2 = performance.now();
  //     console.log(`[onScroll] Bolinha atualizada em ${(t2 - t1).toFixed(2)}ms`);
      
  //     // Tenta sincronizar via store (valida automaticamente)
  //     store.syncFromScroll(headerDateKey);
      
  //     const t3 = performance.now();
  //     console.log(`[onScroll] Store sincronizado em ${(t3 - t2).toFixed(2)}ms | TOTAL: ${(t3 - t0).toFixed(2)}ms`);

  //   },
  //   [itemLayouts, flatData, store]
  // );

  // // Monitora visibilidade apenas para FAB (usa refs para evitar re-renders)
  // const onViewableItemsChanged = useCallback(
  //   ({ viewableItems }: { viewableItems: ViewToken[] }) => {
  //     if (viewableItems.length === 0) return;

  //     // Verifica se header do "Hoje" está visível
  //     const todayVisible = viewableItems.some(
  //       (v) => v.item?.type === 'header' && v.item?.isToday
  //     );

  //     const shouldShow = !todayVisible;
      
  //     // Só anima se mudou
  //     if (shouldShow !== showTodayFabRef.current) {
  //       showTodayFabRef.current = shouldShow;
  //       Animated.timing(fabOpacity, {
  //         toValue: shouldShow ? 1 : 0,
  //         duration: 200,
  //         useNativeDriver: true,
  //       }).start();
  //     }

  //     if (!todayVisible) {
  //       // Determina direção baseado no primeiro item visível
  //       const firstVisibleHeader = viewableItems.find(
  //         (v) => v.item?.type === 'header'
  //       );
  //       if (firstVisibleHeader && firstVisibleHeader.index !== null) {
  //         todayIsAboveRef.current = firstVisibleHeader.index > todayHeaderIndex;
  //       }
  //     }
  //   },
  //   [todayHeaderIndex, fabOpacity]
  // );

  // // Config mais responsiva para detectar mudanças rapidamente
  // const viewabilityConfig = useRef({
  //   itemVisiblePercentThreshold: 1,
  //   minimumViewTime: 0,
  // }).current;

  // // Renderiza item baseado no tipo
  // const renderItem = useCallback(({ item }: { item: FlatListItem }) => {
  //   if (item.type === 'header') {
  //     return <HeaderItem title={item.title} isToday={item.isToday} colors={colors} />;
  //   }
    
  //   if (item.type === 'empty') {
  //     return <EmptyItem colors={colors} />;
  //   }
    
  //   // type === 'item'
  //   const servico = item.data;
  //   const route = isChamado(servico)
  //     ? `/detalhes/chamado/${servico.uuid_suporte}`
  //     : `/detalhes/instalacao/${(servico as any).uuid_solic}`;

  //   return (
  //     <View style={{ height: 100 }}>
  //       <AgendaItemCard item={servico} onPress={() => router.push(route as any)} />
  //     </View>
  //   );
  // }, [colors, router]);

  // if (isLoading && !servicos) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color="#3b82f6" />
  //       <Text style={{ color: colors.cardTextSecondary, marginTop: 16 }}>Carregando agenda...</Text>
  //     </SafeAreaView>
  //   );
  // }

  // if (error) {
  //   return (
  //     <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBackground, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
  //       <Text className="text-red-500 text-lg font-semibold mb-2">
  //         Erro ao carregar agenda
  //       </Text>
  //       <Text style={{ color: colors.cardTextSecondary }} className="text-center mb-4">
  //         {error.message}
  //       </Text>
  //       <TouchableOpacity
  //         onPress={invalidate}
  //         className="bg-blue-600 px-6 py-3 rounded-lg mt-2"
  //         activeOpacity={0.7}
  //       >
  //         <Text className="text-white font-semibold">Tentar novamente</Text>
  //       </TouchableOpacity>
  //     </SafeAreaView>
  //   );
  // }

  // return (
  //   <View className="flex-1" style={{ backgroundColor: colors.screenBackground }}>
  //     {/* Toggle + Calendário colapsado no topo */}
  //     <View style={{ backgroundColor: colors.cardBackground }}>
  //       {/* Toggle Dia/Agenda - estilo badge pill, alinhado à esquerda */}
  //       <View style={{ 
  //         flexDirection: 'row', 
  //         justifyContent: 'flex-start',
  //         paddingHorizontal: 16,
  //         paddingTop: 8,
  //         paddingBottom: 4,
  //       }}>
  //         <View style={{
  //           flexDirection: 'row',
  //           backgroundColor: colors.searchInputBackground,
  //           borderRadius: 20,
  //           padding: 3,
  //         }}>
  //           <TouchableOpacity
  //             onPress={() => setViewMode('day')}
  //             activeOpacity={0.7}
  //             style={{
  //               paddingHorizontal: 16,
  //               paddingVertical: 6,
  //               borderRadius: 16,
  //               backgroundColor: viewMode === 'day' ? colors.tabBarActiveTint : 'transparent',
  //             }}
  //           >
  //             <Text style={{
  //               fontSize: 12,
  //               fontWeight: '600',
  //               color: viewMode === 'day' ? '#ffffff' : colors.cardTextSecondary,
  //             }}>
  //               Dia
  //             </Text>
  //           </TouchableOpacity>
            
  //           <TouchableOpacity
  //             onPress={() => setViewMode('agenda')}
  //             activeOpacity={0.7}
  //             style={{
  //               paddingHorizontal: 16,
  //               paddingVertical: 6,
  //               borderRadius: 16,
  //               backgroundColor: viewMode === 'agenda' ? colors.tabBarActiveTint : 'transparent',
  //             }}
  //           >
  //             <Text style={{
  //               fontSize: 12,
  //               fontWeight: '600',
  //               color: viewMode === 'agenda' ? '#ffffff' : colors.cardTextSecondary,
  //             }}>
  //               Agenda
  //             </Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>

  //       {/* Calendário colapsado fixo (Dom-Sab) */}
  //       <CollapsedCalendar
  //         ref={calendarRef}
  //         onSelectDate={(dateKey) => scrollToDate(dateKey)}
  //       />
  //     </View>

  //     <FlatList
  //       key={viewMode} // Força remount quando muda o modo
  //       ref={flatListRef}
  //       data={activeData}
  //       keyExtractor={(item) => item.id}
  //       renderItem={renderItem}
  //       getItemLayout={getItemLayout}
  //       initialScrollIndex={viewMode === 'agenda' ? todayHeaderIndex : undefined}
  //       contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
  //       stickyHeaderIndices={viewMode === 'agenda' ? stickyHeaderIndices : undefined}
  //       // Desabilita TODA virtualização
  //       initialNumToRender={9999}
  //       maxToRenderPerBatch={9999}
  //       windowSize={999}
  //       updateCellsBatchingPeriod={0}
  //       removeClippedSubviews={false}
  //       disableVirtualization={true}
  //       refreshControl={
  //         <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
  //       }
  //       onScroll={viewMode === 'agenda' ? onScroll : undefined}
  //       scrollEventThrottle={8}
  //       onViewableItemsChanged={viewMode === 'agenda' ? onViewableItemsChanged : undefined}
  //       viewabilityConfig={viewabilityConfig}
  //       onScrollToIndexFailed={(info) => {
  //         // Fallback silencioso: scroll via offset
  //         flatListRef.current?.scrollToOffset({
  //           offset: info.averageItemLength * info.index,
  //           animated: false,
  //         });
  //       }}
  //     />

  //     {/* FAB - Voltar para Hoje */}
  //     <Animated.View
  //       pointerEvents="box-none"
  //       style={{
  //         position: 'absolute',
  //         bottom: 24,
  //         right: 20,
  //         opacity: fabOpacity,
  //       }}
  //     >
  //       <TouchableOpacity
  //         onPress={scrollToToday}
  //         activeOpacity={0.8}
  //         style={{
  //           flexDirection: 'row',
  //           alignItems: 'center',
  //           backgroundColor: colors.tabBarActiveTint,
  //           paddingHorizontal: 16,
  //           paddingVertical: 10,
  //           borderRadius: 20,
  //           shadowColor: '#000',
  //           shadowOffset: { width: 0, height: 2 },
  //           shadowOpacity: 0.2,
  //           shadowRadius: 4,
  //           elevation: 4,
  //         }}
  //       >
  //         <Ionicons name="today-outline" size={16} color="white" />
  //         <Text
  //           style={{
  //             color: 'white',
  //             fontSize: 13,
  //             fontWeight: '600',
  //             marginLeft: 6,
  //           }}
  //         >
  //           Hoje
  //         </Text>
  //       </TouchableOpacity>
  //     </Animated.View>
  //   </View>
  // );
// }
