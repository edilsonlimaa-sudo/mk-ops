import { useTheme } from '@/contexts/ThemeContext';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Aviso() {
  const { colors } = useTheme();
  const router = useRouter();
  const { startSetup } = useOnboardingStore();
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Ícone com bounce dramático
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        tension: 20,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Bounce sutil infinito
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Textos com slide dramático
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 25,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Cards com delay e slide
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(cardFadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          tension: 30,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 900);
  }, []);

  const handleNext = () => {
    startSetup();
    router.replace('/(onboarding)/(setup)/1-server');
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    setShowSecurityModal(true);
  };

  const handleConfirmSkip = () => {
    setShowSecurityModal(false);
    // Fecha o app (funciona no Android, no iOS volta ao home)
    BackHandler.exitApp();
  };

  const handleContinueSetup = () => {
    setShowSecurityModal(false);
    startSetup();
    router.push('/(onboarding)/(setup)/1-server');
  };

  return (
    <SafeAreaView 
      style={{ backgroundColor: colors.screenBackground }} 
      className="flex-1"
      edges={['top', 'bottom']}
    >
      {/* Header com Pular */}
      <View className="flex-row justify-end items-center pt-4 px-6">
        <TouchableOpacity onPress={handleSkip} className="px-4 py-2">
          <Text style={{ color: colors.cardTextSecondary }} className="text-base font-medium">
            Pular
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Central */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Ícone */}
        <Animated.View
          style={{
            transform: [
              { scale: scaleAnim },
              { translateY: bounceAnim },
            ],
          }}
        >
          <View 
            className="w-24 h-24 rounded-3xl items-center justify-center mb-8"
            style={{
              backgroundColor: '#2563eb',
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-5xl">🔌</Text>
          </View>
        </Animated.View>

        {/* Título */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text 
            style={{ color: colors.cardTextPrimary }} 
            className="text-3xl font-bold mb-3 text-center"
          >
            Configuração Inicial
          </Text>

          {/* Descrição Principal */}
          <Text 
            style={{ color: colors.cardTextSecondary }} 
            className="text-base leading-6 text-center mb-6"
          >
            Conecte o MK-Ops ao seu servidor{'\n'}
            MK-Auth em <Text className="font-semibold" style={{ color: colors.cardTextPrimary }}>poucos passos</Text>.
          </Text>

          {/* CTA discreto */}
          <TouchableOpacity 
            onPress={() => setShowRequirementsModal(true)}
            className="items-center mb-8"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Text style={{ color: '#2563eb' }} className="text-sm">
                O que eu preciso pra conectar?
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Card animation placeholder */}
        <Animated.View 
          style={{
            opacity: cardFadeAnim,
            transform: [{ translateY: cardSlideAnim }],
          }}
          className="w-full mb-6"
        >
        </Animated.View>
      </View>

      {/* Navegação */}
      <Animated.View 
        style={{
          opacity: fadeAnim,
        }}
        className="pb-6 px-6"
      >
        {/* Botões em linha */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className="py-3 px-4"
            onPress={handleSkip}
          >
            <Text style={{ color: colors.cardTextSecondary }} className="text-base">
              Não quero configurar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 px-4"
            onPress={handleNext}
          >
            <Text style={{ color: '#2563eb' }} className="text-base font-semibold">
              Começar Configuração →
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Modal de Requisitos */}
      <Modal
        visible={showRequirementsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRequirementsModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View 
            style={{ backgroundColor: colors.cardBackground }}
            className="w-full rounded-2xl p-6 max-h-[80%]"
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Ícone */}
              <View className="items-center mb-4">
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#2563eb' + '20' }}
                >
                  <Text className="text-4xl">📋</Text>
                </View>
              </View>

              {/* Título */}
              <Text style={{ color: colors.cardTextPrimary }} className="text-2xl font-bold text-center mb-3">
                O que você vai precisar
              </Text>

              <Text style={{ color: colors.cardTextSecondary }} className="text-sm text-center mb-6">
                Para conectar o MK-Ops ao seu servidor
              </Text>

              {/* 1. Acesso ao Painel */}
              <View 
                style={{ 
                  backgroundColor: colors.screenBackground,
                  borderColor: colors.cardBorder,
                }}
                className="rounded-xl p-5 mb-4 border"
              >
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: '#2563eb' + '15' }}
                  >
                    <Text className="text-xl">🖥️</Text>
                  </View>
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold flex-1">
                    Acesso ao painel MK-Auth
                  </Text>
                </View>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 ml-[52px]">
                  Você vai precisar estar logado no painel web.
                </Text>
              </View>

              {/* 2. URL do Servidor */}
              <View 
                style={{ 
                  backgroundColor: colors.screenBackground,
                  borderColor: colors.cardBorder,
                }}
                className="rounded-xl p-5 mb-4 border"
              >
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: '#2563eb' + '15' }}
                  >
                    <Text className="text-xl">🌐</Text>
                  </View>
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold flex-1">
                    URL do seu servidor
                  </Text>
                </View>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 ml-[52px]">
                  O endereço web onde seu MK-Auth está hospedado.
                </Text>
              </View>

              {/* 3. Credenciais da API */}
              <View 
                style={{ 
                  backgroundColor: colors.screenBackground,
                  borderColor: colors.cardBorder,
                }}
                className="rounded-xl p-5 mb-4 border"
              >
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: '#2563eb' + '15' }}
                  >
                    <Text className="text-xl">🔑</Text>
                  </View>
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold flex-1">
                    Client ID e Client Secret
                  </Text>
                </View>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 ml-[52px]">
                  Credenciais para autenticação da API.
                </Text>
              </View>

              {/* 4. Permissões */}
              <View 
                style={{ 
                  backgroundColor: colors.screenBackground,
                  borderColor: colors.cardBorder,
                }}
                className="rounded-xl p-5 mb-6 border"
              >
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: '#2563eb' + '15' }}
                  >
                    <Text className="text-xl">✓</Text>
                  </View>
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold flex-1">
                    Permissões da API
                  </Text>
                </View>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 ml-[52px]">
                  Permissões específicas para o app funcionar. Podem ser revogadas a qualquer momento no painel MK-Auth.
                </Text>
              </View>

              {/* Tempo estimado */}
              <View className="items-center mb-6">
                <View className="flex-row items-center">
                  <Text className="text-base mr-2">⏱️</Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm">
                    Tempo total: ~2 minutos
                  </Text>
                </View>
              </View>

              {/* Botão */}
              <TouchableOpacity
                className="py-4 rounded-xl"
                style={{ backgroundColor: '#2563eb' }}
                onPress={() => setShowRequirementsModal(false)}
              >
                <Text className="text-white text-center text-base font-semibold">
                  Entendi
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Segurança */}
      <Modal
        visible={showSecurityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSecurityModal(false)}
      >
        <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View 
            style={{ backgroundColor: colors.cardBackground }}
            className="w-full rounded-2xl p-6 max-h-[80%]"
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Ícone */}
              <View className="items-center mb-4">
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#fbbf24' + '20' }}
                >
                  <Text className="text-4xl">😔</Text>
                </View>
              </View>

              {/* Título */}
              <Text style={{ color: colors.cardTextPrimary }} className="text-2xl font-bold text-center mb-3">
                Poxa...
              </Text>

              <Text style={{ color: colors.cardTextSecondary }} className="text-base text-center mb-6 leading-6">
                Sem configurar a conexão, não conseguimos{'\n'}
                te ajudar a <Text className="font-semibold" style={{ color: colors.cardTextPrimary }}>agilizar seu dia a dia</Text> no provedor.
              </Text>

              {/* Card: Entendemos a preocupação */}
              <View 
                style={{ 
                  backgroundColor: colors.screenBackground,
                  borderColor: colors.cardBorder,
                }}
                className="rounded-xl p-5 mb-4 border"
              >
                <View className="flex-row items-start mb-3">
                  <Text className="text-2xl mr-3">🤝</Text>
                  <View className="flex-1">
                    <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold mb-2">
                      Entendemos sua preocupação
                    </Text>
                    <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5">
                      Fornecer credenciais pode parecer arriscado. Mas nossa conexão é{' '}
                      <Text className="font-semibold" style={{ color: colors.cardTextPrimary }}>super segura</Text>.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card: Como funciona */}
              <View 
                style={{ 
                  backgroundColor: colors.screenBackground,
                  borderColor: colors.cardBorder,
                }}
                className="rounded-xl p-5 mb-4 border"
              >
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold mb-3 uppercase">
                  Como funciona:
                </Text>

                <View className="mb-3">
                  <View className="flex-row items-start mb-1">
                    <Text className="text-base mr-2">🔌</Text>
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-semibold flex-1">
                      Usamos a API oficial do MK-Auth
                    </Text>
                  </View>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 ml-6">
                    A mesma que o próprio sistema usa internamente
                  </Text>
                </View>

                <View className="mb-3">
                  <View className="flex-row items-start mb-1">
                    <Text className="text-base mr-2">🔒</Text>
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-semibold flex-1">
                      Zero acesso ao seu banco de dados
                    </Text>
                  </View>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 ml-6">
                    Tudo via API, seguindo as regras de segurança do MK-Auth
                  </Text>
                </View>

                <View>
                  <View className="flex-row items-start mb-1">
                    <Text className="text-base mr-2">📱</Text>
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-semibold flex-1">
                      Suas credenciais ficam no seu celular
                    </Text>
                  </View>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 ml-6">
                    Nunca enviamos para nossos servidores
                  </Text>
                </View>
              </View>

              {/* Observação */}
              <View 
                style={{ backgroundColor: '#3b82f6' + '10', borderColor: '#3b82f6' + '30' }}
                className="rounded-xl p-4 mb-6 border"
              >
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-5 text-center">
                  <Text className="font-semibold" style={{ color: colors.cardTextPrimary }}>Prometemos:</Text>
                  {'\n'}Transparência total e respeito aos seus dados
                </Text>
              </View>

              {/* Botões */}
              <TouchableOpacity
                className="py-4 rounded-xl mb-3"
                style={{ backgroundColor: '#2563eb' }}
                onPress={handleContinueSetup}
              >
                <Text className="text-white text-center text-base font-semibold">
                  Entendi, vamos configurar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3"
                onPress={handleConfirmSkip}
              >
                <Text style={{ color: colors.cardTextSecondary }} className="text-center text-sm">
                  Sair mesmo assim
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
