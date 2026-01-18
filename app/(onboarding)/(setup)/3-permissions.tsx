import { useTheme } from '@/contexts/ThemeContext';
import { useSetupStore } from '@/stores/onboarding/useSetupStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REQUIRED_PERMISSIONS = [
  {
    controller: 'Chamado',
    methods: ['GET', 'PUT'],
    description: 'Listar e atualizar chamados'
  },
  {
    controller: 'Cliente',
    methods: ['GET', 'PUT'],
    description: 'Visualizar dados de clientes'
  },
  {
    controller: 'Funcionarios',
    methods: ['GET'],
    description: 'Listar funcionários disponíveis'
  },
  {
    controller: 'Instalacao',
    methods: ['GET', 'PUT'],
    description: 'Gerenciar instalações'
  },
  {
    controller: 'Plano',
    methods: ['GET'],
    description: 'Consultar planos disponíveis'
  },
  {
    controller: 'Usuario',
    methods: ['GET'],
    description: 'Informações do usuário autenticado'
  },
];

export default function Step5Permissions() {
  const { colors } = useTheme();
  const router = useRouter();
  const { completeStep } = useSetupStore();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const insets = useSafeAreaInsets();

  // Estados para animação do mockup
  const [selectedMethods, setSelectedMethods] = useState<{ [key: string]: string[] }>({});
  const [buttonClicked, setButtonClicked] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Animação de pulse no botão de ajuda
  const helpButtonPulse = useRef(new Animated.Value(1)).current;

  // Inicia animação de pulse quando a tela carrega
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(helpButtonPulse, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(helpButtonPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, []);

  // Animações de entrada do mockup
  const mockupFadeAnim = useRef(new Animated.Value(0)).current;
  const mockupScaleAnim = useRef(new Animated.Value(0.95)).current;

  // Animações do cursor
  const cursorOpacity = useRef(new Animated.Value(0)).current;
  const cursorTranslateX = useRef(new Animated.Value(0)).current;
  const cursorTranslateY = useRef(new Animated.Value(0)).current;
  const cursorScale = useRef(new Animated.Value(1)).current;

  // Animação de scroll do mockup
  const mockupScrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Animação do mockup quando modal abre
  useEffect(() => {
    if (!showHelpModal) return;

    // Reset e fade in
    mockupFadeAnim.setValue(0);
    mockupScaleAnim.setValue(0.95);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(mockupFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(mockupScaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 100);

    // Animação completa do mockup
    const runAnimation = () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];

      // Reset completo
      setSelectedMethods({});
      setButtonClicked(false);

      // Reset cursor
      cursorOpacity.setValue(0);
      cursorTranslateX.setValue(0);
      cursorTranslateY.setValue(0);

      // Reset scroll
      mockupScrollY.setValue(0);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }

      const animationStartDelay = 2000;

      // Coordenadas base: barra nav (40) + p-4 top (16) + header (20) + mb-3 (12) = 88px
      // Para cada controller: título (20) + mb-2 (8) + linha verbos (16) + marginBottom (12) = 56px por controller
      // X: p-4 left (16) + ml-2 (8) + metade checkbox (7) = 31px para GET
      // X para PUT: GET item (~50px) + gap (6px) + POST item (~50px) + gap (6px) + metade PUT (~25px) = ~130px

      // Cursor aparece no GET do Chamado
      const t0 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateX, {
            toValue: 31,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 116,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationStartDelay);
      timeoutsRef.current.push(t0);

      // Marca GET de Chamado
      const t1 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({ 'Chamado': ['GET'] });
        }, 150);
      }, animationStartDelay + 400);
      timeoutsRef.current.push(t1);

      // Vai para PUT de Chamado
      const t2 = setTimeout(() => {
        Animated.timing(cursorTranslateX, {
          toValue: 130,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, animationStartDelay + 900);
      timeoutsRef.current.push(t2);

      // Marca PUT de Chamado
      const t3 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({ 'Chamado': ['GET', 'PUT'] });
        }, 150);
      }, animationStartDelay + 1300);
      timeoutsRef.current.push(t3);

      // Vai para GET de Cliente
      const t4 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 31,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 172,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationStartDelay + 1900);
      timeoutsRef.current.push(t4);

      // Marca GET de Cliente
      const t5 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({
            'Chamado': ['GET', 'PUT'],
            'Cliente': ['GET']
          });
        }, 150);
      }, animationStartDelay + 2400);
      timeoutsRef.current.push(t5);

      // Vai para PUT de Cliente
      const t6 = setTimeout(() => {
        Animated.timing(cursorTranslateX, {
          toValue: 130,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, animationStartDelay + 2900);
      timeoutsRef.current.push(t6);

      // Marca PUT de Cliente
      const t7 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({
            'Chamado': ['GET', 'PUT'],
            'Cliente': ['GET', 'PUT']
          });
        }, 150);
      }, animationStartDelay + 3300);
      timeoutsRef.current.push(t7);

      // Scroll down quando vai para Funcionarios (3º controller)
      const t7_scroll = setTimeout(() => {
        const scrollToY = 80; // Scroll mais para mostrar Funcionarios bem visível
        Animated.timing(mockupScrollY, {
          toValue: scrollToY,
          duration: 500,
          useNativeDriver: false,
        }).start();
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: scrollToY, animated: true });
        }
      }, animationStartDelay + 3700);
      timeoutsRef.current.push(t7_scroll);

      // Vai para GET de Funcionarios (compensando scroll de 80px)
      const t8 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 31,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 148, // 228 - 80 (compensando scroll)
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationStartDelay + 3900);
      timeoutsRef.current.push(t8);

      // Marca GET de Funcionarios
      const t9 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({
            'Chamado': ['GET', 'PUT'],
            'Cliente': ['GET', 'PUT'],
            'Funcionarios': ['GET']
          });
        }, 150);
      }, animationStartDelay + 4400);
      timeoutsRef.current.push(t9);

      // Vai para GET de Instalacao (compensando scroll de 80px)
      const t10 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 31,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 204, // 284 - 80 (compensando scroll)
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationStartDelay + 5000);
      timeoutsRef.current.push(t10);

      // Marca GET de Instalacao
      const t11 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({
            'Chamado': ['GET', 'PUT'],
            'Cliente': ['GET', 'PUT'],
            'Funcionarios': ['GET'],
            'Instalacao': ['GET']
          });
        }, 150);
      }, animationStartDelay + 5500);
      timeoutsRef.current.push(t11);

      // Vai para PUT de Instalacao (Y já está correto em 204)
      const t12 = setTimeout(() => {
        Animated.timing(cursorTranslateX, {
          toValue: 130,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, animationStartDelay + 6100);
      timeoutsRef.current.push(t12);

      // Marca PUT de Instalacao
      const t13 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({
            'Chamado': ['GET', 'PUT'],
            'Cliente': ['GET', 'PUT'],
            'Funcionarios': ['GET'],
            'Instalacao': ['GET', 'PUT']
          });
        }, 150);
      }, animationStartDelay + 6500);
      timeoutsRef.current.push(t13);

      // Scroll down mais um pouco quando vai para Plano (5º controller)
      const t13_scroll = setTimeout(() => {
        const scrollToY = 180; // Scroll maior para mostrar Plano e Usuario
        Animated.timing(mockupScrollY, {
          toValue: scrollToY,
          duration: 500,
          useNativeDriver: false,
        }).start();
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: scrollToY, animated: true });
        }
      }, animationStartDelay + 6800);
      timeoutsRef.current.push(t13_scroll);

      // Vai para GET de Plano (compensando scroll de 180px)
      const t14 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 31,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 160, // 340 - 180 (compensando scroll total)
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationStartDelay + 7100);
      timeoutsRef.current.push(t14);

      // Marca GET de Plano
      const t15 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({
            'Chamado': ['GET', 'PUT'],
            'Cliente': ['GET', 'PUT'],
            'Funcionarios': ['GET'],
            'Instalacao': ['GET', 'PUT'],
            'Plano': ['GET']
          });
        }, 150);
      }, animationStartDelay + 7600);
      timeoutsRef.current.push(t15);

      // Vai para GET de Usuario (compensando scroll de 180px)
      const t16 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 31,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 216, // 396 - 180 (compensando scroll total)
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationStartDelay + 8200);
      timeoutsRef.current.push(t16);

      // Marca GET de Usuario
      const t17 = setTimeout(() => {
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        setTimeout(() => {
          setSelectedMethods({
            'Chamado': ['GET', 'PUT'],
            'Cliente': ['GET', 'PUT'],
            'Funcionarios': ['GET'],
            'Instalacao': ['GET', 'PUT'],
            'Plano': ['GET'],
            'Usuario': ['GET']
          });
        }, 150);
      }, animationStartDelay + 8700);
      timeoutsRef.current.push(t17);

      // Scroll final para mostrar o botão Gravar
      const t17_scroll = setTimeout(() => {
        const scrollToY = 240; // Scroll para mostrar o botão
        Animated.timing(mockupScrollY, {
          toValue: scrollToY,
          duration: 500,
          useNativeDriver: false,
        }).start();
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: scrollToY, animated: true });
        }
      }, animationStartDelay + 9100);
      timeoutsRef.current.push(t17_scroll);

      // Vai para o botão Gravar (centro do botão)
      const t17_button = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 150, // Centro horizontal aproximado do botão
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 200, // Posição Y do centro do botão (40 barra + 144 conteúdo + 16 centro)
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, animationStartDelay + 9500);
      timeoutsRef.current.push(t17_button);

      // Clica no botão Gravar
      const t17_click = setTimeout(() => {
        // Ativa efeito visual no botão
        setButtonClicked(true);
        
        Animated.sequence([
          Animated.timing(cursorScale, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(cursorScale, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Desativa efeito visual após 200ms
        setTimeout(() => setButtonClicked(false), 200);
      }, animationStartDelay + 10100);
      timeoutsRef.current.push(t17_click);

      // Cursor desaparece
      const t18 = setTimeout(() => {
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, animationStartDelay + 10500);
      timeoutsRef.current.push(t18);

      // Reinicia
      const t19 = setTimeout(() => runAnimation(), animationStartDelay + 12000);
      timeoutsRef.current.push(t19);
    };

    runAnimation();

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [showHelpModal]);

  const handleFinish = () => {
    // Alerta lembrando de clicar em "Gravar" no painel
    Alert.alert(
      '⚠️ Atenção importante!',
      'Não esqueça de clicar no botão "Gravar" no final da página "Api do usuario" do painel MK-Auth.\n\nSem isso, as permissões não serão salvas!',
      [
        {
          text: 'Voltar',
          style: 'cancel',
        },
        {
          text: 'Já cliquei em Gravar',
          style: 'default',
          onPress: () => {
            // Marca step como completo
            completeStep(3);
            // Navegar para tela de teste de conexão
            router.push('/(onboarding)/(setup)/4-validation');
          },
        },
      ]
    );
  };

  return (
    <>
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor: colors.screenBackground }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        paddingBottom: insets.bottom || 24,
      }}
      keyboardShouldPersistTaps="always"
      enableOnAndroid={true}
      extraScrollHeight={20}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="border rounded-2xl p-6 w-full max-w-md"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        }}
      >
        <View className="items-center mb-4">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
            style={{ backgroundColor: '#8b5cf615' }}
          >
            <Text className="text-4xl">🔐</Text>
          </View>

          <View className="rounded-full px-3 py-1" style={{ backgroundColor: '#8b5cf615' }}>
            <Text className="text-xs font-medium" style={{ color: '#8b5cf6' }}>
              Passo 3 de 4 • Permissões
            </Text>
          </View>
        </View>

        <Text className="text-xl font-bold mb-2 text-center" style={{ color: colors.cardTextPrimary }}>
          Permissões Necessárias
        </Text>

        <Text className="text-sm mb-6 text-center" style={{ color: colors.cardTextSecondary }}>
          Ative no painel MK-Auth para o app funcionar
        </Text>

        {/* Lista compacta de permissões */}
        <View className="mb-3 rounded-lg overflow-hidden" style={{ borderColor: colors.cardBorder, borderWidth: 1 }}>
          {REQUIRED_PERMISSIONS.map((perm, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.screenBackground,
                borderColor: colors.cardBorder,
                borderTopWidth: index === 0 ? 0 : 1,
              }}
              className="px-3 py-2 flex-row items-center justify-between"
            >
              <Text style={{ color: colors.cardTextPrimary }} className="text-xs font-semibold">
                {perm.controller}
              </Text>
              <View className="flex-row gap-1">
                {perm.methods.map((method, idx) => (
                  <Text
                    key={idx}
                    style={{ color: method === 'GET' ? '#10b981' : '#3b82f6', fontSize: 10 }}
                    className="font-bold"
                  >
                    {method}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleFinish}
          className="py-3 rounded-xl items-center mt-3"
          style={{ backgroundColor: '#8b5cf6' }}
          activeOpacity={0.8}
        >
          <Text className="text-base font-semibold" style={{ color: '#ffffff' }}>
            Avançar
          </Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: helpButtonPulse }], marginTop: 16 }}>
          <TouchableOpacity
            className="items-center py-2 px-4"
            onPress={() => setShowHelpModal(true)}
          >
            <Text style={{ color: '#8b5cf6' }} className="text-xs font-medium">
              💡 Como ativar?
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAwareScrollView>

  <Modal
    visible={showHelpModal}
    transparent={true}
    animationType="fade"
    onRequestClose={() => setShowHelpModal(false)}
  >
    <View className="flex-1 justify-center items-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <View
        style={{ backgroundColor: colors.cardBackground }}
        className="w-full rounded-2xl p-6 max-h-[85%]"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cabeçalho do modal */}
          <View className="items-center mb-4">
            <Text style={{ color: colors.cardTextPrimary }} className="text-xl font-bold mb-2">
              Como Ativar Permissões
            </Text>
            <Text style={{ color: colors.cardTextSecondary }} className="text-sm text-center">
              Na tela "Api do usuario", marque os controllers e métodos necessários
            </Text>
          </View>

          {/* Mockup animado */}
          <Animated.View
            style={{
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
              opacity: mockupFadeAnim,
              transform: [{ scale: mockupScaleAnim }],
              height: 250, // Altura reduzida pela metade
            }}
            className="rounded-xl border-2 overflow-hidden mb-6"
          >
            {/* Barra de navegador */}
            <View style={{ backgroundColor: colors.screenBackground, borderBottomColor: colors.cardBorder }} className="px-3 py-2 flex-row items-center border-b">
              <View className="flex-row space-x-1 mr-3">
                <View className="w-2 h-2 rounded-full bg-red-400" />
                <View className="w-2 h-2 rounded-full bg-yellow-400" />
                <View className="w-2 h-2 rounded-full bg-green-400" />
              </View>
              <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="flex-1 rounded px-2 py-1 border">
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs">🔒 .../provedor/api-usuario</Text>
              </View>
            </View>

            {/* Conteúdo do mockup com ScrollView */}
            <ScrollView
              ref={scrollViewRef}
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            >
              <View className="p-4">
                {/* Header */}
                <View className="mb-3">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-bold">
                    Selecione os Controllers e Métodos
                  </Text>
                </View>

                {/* Lista de controllers */}
                <View>
                  {['Chamado', 'Cliente', 'Funcionarios', 'Instalacao', 'Plano', 'Usuario'].map((controller, idx) => {
                    return (
                      <View key={idx} style={{ marginBottom: 12 }}>
                        {/* Controller label (não clicável) */}
                        <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-bold mb-2">
                          {controller}
                        </Text>

                        {/* Métodos sempre visíveis (horizontal) */}
                      <View className="ml-2 flex-row flex-wrap gap-2">
                        {['GET', 'POST', 'PUT', 'DELETE'].map((method, midx) => {
                          const isMethodSelected = selectedMethods[controller]?.includes(method);

                          return (
                            <View
                              key={midx}
                              style={{
                                backgroundColor: isMethodSelected ? '#10b981' + '20' : colors.screenBackground,
                                borderColor: isMethodSelected ? '#10b981' : colors.cardBorder,
                                borderWidth: 1.5,
                              }}
                              className="px-2 py-0.5 rounded"
                            >
                              <Text
                                style={{
                                  color: isMethodSelected ? '#10b981' : colors.cardTextSecondary,
                                  fontWeight: isMethodSelected ? '600' : '400',
                                  fontSize: 11
                                }}
                              >
                                {method}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
                </View>

                {/* Botão Gravar */}
                <View className="pt-4 pb-2">
                  <TouchableOpacity
                    disabled
                    className="py-3 rounded-xl items-center"
                    style={{ 
                      backgroundColor: '#10b981',
                      opacity: buttonClicked ? 0.7 : 1,
                      transform: [{ scale: buttonClicked ? 0.97 : 1 }]
                    }}
                  >
                    <Text className="text-white font-semibold text-sm">
                      Gravar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Cursor animado */}
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                opacity: cursorOpacity,
                transform: [
                  { translateX: cursorTranslateX },
                  { translateY: cursorTranslateY },
                  { scale: cursorScale }
                ],
              }}
              pointerEvents="none"
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: '#8b5cf6',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: '#ffffff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 3,
                  elevation: 5,
                }}
              />
            </Animated.View>
          </Animated.View>

          {/* Steps textuais */}
          <View className="space-y-3 mb-6">
            <View className="flex-row">
              <Text style={{ color: '#8b5cf6' }} className="font-bold mr-2">1.</Text>
              <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                Acesse a tela <Text className="font-semibold">Api do usuario</Text> no painel MK-Auth
              </Text>
            </View>
            <View className="flex-row">
              <Text style={{ color: '#8b5cf6' }} className="font-bold mr-2">2.</Text>
              <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                Marque os métodos <Text className="font-semibold">GET</Text> e <Text className="font-semibold">PUT</Text> para cada controller
              </Text>
            </View>
            <View className="flex-row">
              <Text style={{ color: '#8b5cf6' }} className="font-bold mr-2">3.</Text>
              <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                Clique em <Text className="font-semibold">Gravar</Text> para salvar as permissões
              </Text>
            </View>
            <View className="flex-row">
              <Text style={{ color: '#8b5cf6' }} className="font-bold mr-2">4.</Text>
              <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                As permissões estarão ativas instantaneamente
              </Text>
            </View>
          </View>

          {/* Botão fechar */}
          <TouchableOpacity
            style={{ backgroundColor: '#8b5cf6' }}
            className="rounded-xl py-3 items-center"
            onPress={() => setShowHelpModal(false)}
          >
            <Text className="text-white font-semibold text-base">
              Entendi!
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
  </>
  );
}
