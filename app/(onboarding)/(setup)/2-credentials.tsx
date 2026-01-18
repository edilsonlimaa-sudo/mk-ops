import { useTheme } from '@/contexts/ThemeContext';
import { useSetupStore } from '@/stores/onboarding/useSetupStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Animated, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FormData = {
  clientId: string;
  clientSecret: string;
};

export default function Step4Credentials() {
  const { colors } = useTheme();
  const router = useRouter();
  const { setCredentials, completeStep, data } = useSetupStore();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Estados para animação do mockup de LOGIN
  const [showLogin, setShowLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  
  // Estados para animação do mockup de MENU
  const [menuOpen, setMenuOpen] = useState(false);
  const [provedorExpanded, setProvedorExpanded] = useState(false);
  const [highlightProvedor, setHighlightProvedor] = useState(false);
  const [highlightApiUsuario, setHighlightApiUsuario] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Animações de entrada do mockup
  const mockupFadeAnim = useRef(new Animated.Value(0)).current;
  const mockupScaleAnim = useRef(new Animated.Value(0.95)).current;

  // Animações do cursor
  const cursorOpacity = useRef(new Animated.Value(0)).current;
  const cursorTranslateX = useRef(new Animated.Value(20)).current;
  const cursorTranslateY = useRef(new Animated.Value(20)).current;
  const cursorScale = useRef(new Animated.Value(1)).current;
  
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      clientId: data.clientId || '',
      clientSecret: data.clientSecret || '',
    },
  });

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
      setShowLogin(true);
      setUsername('');
      setPassword('');
      setIsButtonPressed(false);
      setMenuOpen(false);
      setProvedorExpanded(false);
      setHighlightProvedor(false);
      setHighlightApiUsuario(false);
      
      // Reset cursor
      cursorOpacity.setValue(0);
      cursorTranslateX.setValue(20);
      cursorTranslateY.setValue(20);
      
      // === FASE 1: LOGIN ===
      const usernameText = 'admin';
      const passwordText = '••••••••';
      const loginStartDelay = 2500;
      
      // Digita o username
      for (let i = 0; i <= usernameText.length; i++) {
        const timeout = setTimeout(() => {
          setUsername(usernameText.slice(0, i));
        }, loginStartDelay + i * 150);
        timeoutsRef.current.push(timeout);
      }
      
      // Depois digita a senha
      const passwordStartDelay = loginStartDelay + (usernameText.length + 1) * 150 + 300;
      for (let i = 0; i <= passwordText.length; i++) {
        const timeout = setTimeout(() => {
          setPassword(passwordText.slice(0, i));
        }, passwordStartDelay + i * 100);
        timeoutsRef.current.push(timeout);
      }
      
      // Clica no botão
      const buttonDelay = passwordStartDelay + (passwordText.length + 1) * 100 + 300;
      const buttonTimeout = setTimeout(() => {
        setIsButtonPressed(true);
      }, buttonDelay);
      timeoutsRef.current.push(buttonTimeout);
      
      // === TRANSIÇÃO LOGIN -> MENU ===
      const menuTransitionDelay = buttonDelay + 800;
      const transitionTimeout = setTimeout(() => {
        setShowLogin(false);
      }, menuTransitionDelay);
      timeoutsRef.current.push(transitionTimeout);
      
      // === FASE 2: NAVEGAÇÃO NO MENU ===
      const menuStartDelay = menuTransitionDelay + 400;
      
      // Cursor aparece
      const t0 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateX, {
            toValue: 20,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 30,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, menuStartDelay);
      timeoutsRef.current.push(t0);

      // Clique no menu
      const t0_5 = setTimeout(() => {
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
      }, menuStartDelay + 300);
      timeoutsRef.current.push(t0_5);
      
      // Abre menu
      const t1 = setTimeout(() => setMenuOpen(true), menuStartDelay + 400);
      timeoutsRef.current.push(t1);
      
      // Cursor vai para Provedor
      const t1_5 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 80,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 100,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }, menuStartDelay + 1000);
      timeoutsRef.current.push(t1_5);
      
      // Destaca Provedor e clique
      const t2 = setTimeout(() => {
        setHighlightProvedor(true);
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
        setTimeout(() => setProvedorExpanded(true), 200);
      }, menuStartDelay + 1600);
      timeoutsRef.current.push(t2);
      
      // Remove destaque Provedor
      const t3 = setTimeout(() => setHighlightProvedor(false), menuStartDelay + 2800);
      timeoutsRef.current.push(t3);
      
      // Cursor vai para Api do usuario
      const t3_5 = setTimeout(() => {
        Animated.parallel([
          Animated.timing(cursorTranslateX, {
            toValue: 80,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cursorTranslateY, {
            toValue: 150,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, menuStartDelay + 2900);
      timeoutsRef.current.push(t3_5);
      
      // Destaca Api do usuario
      const t4 = setTimeout(() => {
        setHighlightApiUsuario(true);
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
      }, menuStartDelay + 3200);
      timeoutsRef.current.push(t4);
      
      // Cursor desaparece
      const t5 = setTimeout(() => {
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, menuStartDelay + 5100);
      timeoutsRef.current.push(t5);
      
      // Reinicia
      const t6 = setTimeout(() => runAnimation(), menuStartDelay + 6000);
      timeoutsRef.current.push(t6);
    };

    runAnimation();

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [showHelpModal]);

  const onSubmit = (data: FormData) => {
    // Salva credenciais na store
    setCredentials(data.clientId, data.clientSecret);
    completeStep(2);
    
    router.push('/(onboarding)/(setup)/3-permissions');
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
            {/* Ícone ilustrativo */}
            <View className="items-center mb-4">
              <View 
                className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
                style={{ backgroundColor: '#10b981' + '15' }}
              >
                <Text className="text-4xl">🔑</Text>
              </View>
              
              {/* Badge de contexto */}
              <View className="bg-green-500/10 rounded-full px-3 py-1">
                <Text style={{ color: '#10b981' }} className="text-xs font-medium">
                  Passo 2 de 4 • Credenciais
                </Text>
              </View>
            </View>

            {/* Título dentro do card */}
            <Text 
              style={{ color: colors.cardTextPrimary }} 
              className="text-xl font-bold mb-2 text-center"
            >
              Credenciais da API
            </Text>

            <Text 
              style={{ color: colors.cardTextSecondary }} 
              className="text-sm mb-6 text-center"
            >
              Cole o Client ID e Client Secret do seu painel MK-Auth
            </Text>

            {/* Client ID Input */}
            <View className="mb-4">
              <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold mb-2 ml-1">
                CLIENT ID
              </Text>
              
              <Controller
                control={control}
                name="clientId"
                rules={{
                  required: 'Por favor, informe o Client ID',
                  minLength: {
                    value: 10,
                    message: 'Client ID muito curto. Verifique se copiou corretamente.'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{ 
                      backgroundColor: colors.screenBackground,
                      borderColor: errors.clientId ? '#ef4444' : colors.cardBorder,
                      color: colors.cardTextPrimary,
                    }}
                    className="border-2 rounded-xl px-4 py-4 text-sm"
                    placeholder="Client_Id_xxxxxxxxxxxx"
                    placeholderTextColor={colors.cardTextSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}
              />

              {errors.clientId && (
                <Text className="text-red-500 text-xs mt-2 ml-1">
                  {errors.clientId.message}
                </Text>
              )}
            </View>

            {/* Client Secret Input */}
            <View className="mb-4">
              <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold mb-2 ml-1">
                CLIENT SECRET
              </Text>
              
              <Controller
                control={control}
                name="clientSecret"
                rules={{
                  required: 'Por favor, informe o Client Secret',
                  minLength: {
                    value: 10,
                    message: 'Client Secret muito curto. Verifique se copiou corretamente.'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{ 
                      backgroundColor: colors.screenBackground,
                      borderColor: errors.clientSecret ? '#ef4444' : colors.cardBorder,
                      color: colors.cardTextPrimary,
                    }}
                    className="border-2 rounded-xl px-4 py-4 text-sm"
                    placeholder="Client_Secret_xxxxxxxxxxxx"
                    placeholderTextColor={colors.cardTextSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                  />
                )}
              />

              {errors.clientSecret && (
                <Text className="text-red-500 text-xs mt-2 ml-1">
                  {errors.clientSecret.message}
                </Text>
              )}
            </View>

            {/* Botão Avançar */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              className="py-3 rounded-xl items-center mt-3"
              style={{ backgroundColor: '#10b981' }}
              activeOpacity={0.8}
            >
              <Text className="text-base font-semibold" style={{ color: '#ffffff' }}>
                Avançar
              </Text>
            </TouchableOpacity>

            {/* CTA de ajuda com pulse */}
            <Animated.View style={{ transform: [{ scale: helpButtonPulse }], marginTop: 16 }}>
              <TouchableOpacity 
                className="items-center py-3 px-4"
                onPress={() => setShowHelpModal(true)}
              >
                <Text style={{ color: '#10b981' }} className="text-sm font-medium">
                  💡 Como encontrar essas credenciais?
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
    </KeyboardAwareScrollView>

      {/* Modal de Ajuda */}
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
                  Onde encontrar?
                </Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm text-center">
                  Siga o passo a passo abaixo no seu painel MK-Auth
                </Text>
              </View>

              {/* Mockup animado: Login → Menu → Api do usuario */}
              <Animated.View 
                style={{ 
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                  opacity: mockupFadeAnim,
                  transform: [{ scale: mockupScaleAnim }],
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
                    <Text style={{ color: colors.cardTextSecondary }} className="text-xs">🔒 seuservidor.com.br/mk-auth</Text>
                  </View>
                </View>

                {/* FASE 1: Tela de Login */}
                {showLogin && (
                  <View className="p-4" style={{ height: 330 }}>
                    {/* Logo/Header */}
                    <View className="items-center mb-6 mt-2">
                      <View style={{ backgroundColor: '#3b82f6' }} className="w-12 h-12 rounded-lg items-center justify-center mb-2">
                        <Text className="text-white text-xl font-bold">MK</Text>
                      </View>
                      <Text style={{ color: colors.cardTextPrimary }} className="font-semibold">MK-Auth</Text>
                    </View>

                    {/* Form de login mockup */}
                    <View className="space-y-3">
                      <View>
                        <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-1">Usuário</Text>
                        <View style={{ backgroundColor: colors.screenBackground, borderColor: colors.cardBorder }} className="border rounded-lg px-3 py-2">
                          <Text style={{ color: colors.cardTextPrimary }} className="text-sm">
                            {username}
                            {username && username.length < 5 && <Text style={{ color: '#3b82f6' }}>|</Text>}
                          </Text>
                        </View>
                      </View>
                      
                      <View>
                        <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-1">Senha</Text>
                        <View style={{ backgroundColor: colors.screenBackground, borderColor: colors.cardBorder }} className="border rounded-lg px-3 py-2">
                          <Text style={{ color: colors.cardTextPrimary }} className="text-sm">
                            {password}
                            {password && password.length < 8 && <Text style={{ color: '#3b82f6' }}>|</Text>}
                          </Text>
                        </View>
                      </View>

                      <View 
                        style={{ 
                          backgroundColor: '#3b82f6',
                          transform: [{ scale: isButtonPressed ? 0.95 : 1 }],
                          opacity: isButtonPressed ? 0.8 : 1
                        }} 
                        className="rounded-lg py-2 mt-2"
                      >
                        <Text className="text-white text-center font-semibold">Entrar →</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* FASE 2: Menu lateral e navegação */}
                {!showLogin && (
                  <>
                    {/* Header do painel */}
                    <View style={{ backgroundColor: '#3b82f6' }} className="p-2 flex-row items-center">
                      <TouchableOpacity className="mr-2">
                        <View className="w-5 h-4 justify-between">
                          <View className="h-0.5 bg-white rounded" />
                          <View className="h-0.5 bg-white rounded" />
                          <View className="h-0.5 bg-white rounded" />
                        </View>
                      </TouchableOpacity>
                      <Text className="text-white font-semibold text-sm">MK-Auth Admin</Text>
                    </View>

                    {/* Conteúdo com menu lateral */}
                    <View className="flex-row" style={{ height: 300 }}>
                      {/* Menu lateral */}
                      <View 
                        style={{ 
                          backgroundColor: colors.screenBackground,
                          width: menuOpen ? 180 : 0,
                          borderRightColor: colors.cardBorder
                        }} 
                        className="border-r overflow-hidden"
                      >
                        <View className="p-3 space-y-1">
                          {/* Dashboard */}
                          <View 
                            style={{ backgroundColor: colors.cardBackground }} 
                            className="px-3 py-2 rounded-lg"
                          >
                            <Text style={{ color: colors.cardTextPrimary }} className="text-sm">📊 Dashboard</Text>
                          </View>

                          {/* Provedor - highlighted */}
                          <View 
                            style={{ 
                              backgroundColor: highlightProvedor ? '#3b82f6' : colors.cardBackground 
                            }} 
                            className="px-3 py-2 rounded-lg"
                          >
                            <Text 
                              style={{ color: highlightProvedor ? '#ffffff' : colors.cardTextPrimary }} 
                              className="text-sm font-semibold"
                            >
                              📁 Provedor
                            </Text>
                          </View>

                          {/* Api do usuario - submenu */}
                          {provedorExpanded && (
                            <View 
                              style={{ 
                                backgroundColor: highlightApiUsuario ? '#3b82f6' : colors.screenBackground,
                                marginLeft: 12
                              }} 
                              className="px-3 py-2 rounded-lg"
                            >
                              <Text 
                                style={{ color: highlightApiUsuario ? '#ffffff' : colors.cardTextSecondary }} 
                                className="text-xs font-semibold"
                              >
                                🔑 Api do usuario
                              </Text>
                            </View>
                          )}

                          {/* Clientes */}
                          <View 
                            style={{ backgroundColor: colors.cardBackground }} 
                            className="px-3 py-2 rounded-lg"
                          >
                            <Text style={{ color: colors.cardTextPrimary }} className="text-sm">👥 Clientes</Text>
                          </View>

                          {/* Configurações */}
                          <View 
                            style={{ backgroundColor: colors.cardBackground }} 
                            className="px-3 py-2 rounded-lg"
                          >
                            <Text style={{ color: colors.cardTextPrimary }} className="text-sm">⚙️ Configurações</Text>
                          </View>
                        </View>
                      </View>

                      {/* Área de conteúdo */}
                      <View className="flex-1 p-4 justify-center items-center">
                        <Text style={{ color: colors.cardTextSecondary }} className="text-sm text-center">
                          {!menuOpen && '👈 Clique no menu'}
                          {menuOpen && !highlightProvedor && !highlightApiUsuario && 'Selecione uma opção'}
                          {highlightProvedor && 'Clique em Provedor'}
                          {highlightApiUsuario && '✓ Api do usuario'}
                        </Text>
                      </View>
                    </View>

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
                          backgroundColor: '#3b82f6',
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
                  </>
                )}
              </Animated.View>

              {/* Steps textuais */}
              <View className="space-y-3 mb-6">
                <View className="flex-row">
                  <Text style={{ color: '#10b981' }} className="font-bold mr-2">1.</Text>
                  <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                    Faça login no seu painel MK-Auth
                  </Text>
                </View>
                <View className="flex-row">
                  <Text style={{ color: '#10b981' }} className="font-bold mr-2">2.</Text>
                  <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                    Clique no menu lateral e vá em <Text className="font-semibold">Provedor</Text>
                  </Text>
                </View>
                <View className="flex-row">
                  <Text style={{ color: '#10b981' }} className="font-bold mr-2">3.</Text>
                  <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                    Selecione <Text className="font-semibold">Api do usuario</Text>
                  </Text>
                </View>
                <View className="flex-row">
                  <Text style={{ color: '#10b981' }} className="font-bold mr-2">4.</Text>
                  <Text style={{ color: colors.cardTextPrimary }} className="flex-1">
                    Copie o Client ID e Client Secret
                  </Text>
                </View>
              </View>

              {/* Botão fechar */}
              <TouchableOpacity
                style={{ backgroundColor: '#10b981' }}
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
