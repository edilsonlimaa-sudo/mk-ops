import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedHeader } from '@/hooks/ui/useThemedHeader';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { ipMkAuth, logout } = useAuthStore();
  const { currentUser, clearIdentification } = useUserStore();
  const { mode, setMode, colors, theme } = useTheme();
  const headerOptions = useThemedHeader();
  const [showSobre, setShowSobre] = useState(false);
  const [showAjuda, setShowAjuda] = useState(false);
  const [showPerfil, setShowPerfil] = useState(false);
  const [showLimitacoes, setShowLimitacoes] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja desconectar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await clearIdentification();
            await logout();
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...headerOptions,
          headerShown: true,
          title: 'Configurações',
        }}
      />

      <View style={{ backgroundColor: colors.screenBackground }} className="flex-1">
      <ScrollView className="flex-1">
        {/* Perfil do Usuário */}
        {currentUser && (
          <TouchableOpacity
            onPress={() => setShowPerfil(true)}
            activeOpacity={0.7}
            className="m-4 mb-2"
          >
            <View style={styles.profileCard}>
              <View className="flex-row items-center">
                <View style={styles.avatarContainer}>
                  <Text className="text-white text-3xl font-bold">
                    {currentUser.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold mb-1">
                    {currentUser.nome}
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="person-circle-outline" size={14} color="white" />
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm ml-1">
                      @{currentUser.login}
                    </Text>
                  </View>
                  {currentUser.email && (
                    <View className="flex-row items-center">
                      <Ionicons name="mail-outline" size={14} color="white" />
                      <Text style={{ color: 'rgba(255,255,255,0.8)' }} className="text-xs ml-1">
                        {currentUser.email}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={24} color="white" style={{ opacity: 0.7 }} />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Configurações */}
        <View className="mt-6 mx-4">
          <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
            Aparência
          </Text>
          
          {/* Card de tema */}
          <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl overflow-hidden shadow-sm mb-6 border">
            {/* Tema Claro */}
            <TouchableOpacity
              onPress={() => setMode('light')}
              style={{ borderBottomColor: colors.cardBorder }}
              className="flex-row items-center p-4 border-b"
            >
              <View style={{ backgroundColor: mode === 'light' ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : colors.searchInputBackground }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="sunny" size={22} color={mode === 'light' ? '#3b82f6' : colors.cardTextSecondary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: mode === 'light' ? '#3b82f6' : colors.cardTextPrimary }} className="text-base font-semibold">
                  Modo Claro
                </Text>
              </View>
              {mode === 'light' && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
            </TouchableOpacity>

            {/* Tema Escuro */}
            <TouchableOpacity
              onPress={() => setMode('dark')}
              style={{ borderBottomColor: colors.cardBorder }}
              className="flex-row items-center p-4 border-b"
            >
              <View style={{ backgroundColor: mode === 'dark' ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : colors.searchInputBackground }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="moon" size={22} color={mode === 'dark' ? '#3b82f6' : colors.cardTextSecondary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: mode === 'dark' ? '#3b82f6' : colors.cardTextPrimary }} className="text-base font-semibold">
                  Modo Escuro
                </Text>
              </View>
              {mode === 'dark' && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
            </TouchableOpacity>

            {/* Automático */}
            <TouchableOpacity
              onPress={() => setMode('auto')}
              className="flex-row items-center p-4"
            >
              <View style={{ backgroundColor: mode === 'auto' ? (theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : colors.searchInputBackground }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="phone-portrait" size={22} color={mode === 'auto' ? '#3b82f6' : colors.cardTextSecondary} />
              </View>
              <View className="flex-1">
                <Text style={{ color: mode === 'auto' ? '#3b82f6' : colors.cardTextPrimary }} className="text-base font-semibold">
                  Padrão do Sistema
                </Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm">Segue o tema do dispositivo</Text>
              </View>
              {mode === 'auto' && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
            Informações
          </Text>
          
          {/* Card de opções */}
          <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl overflow-hidden shadow-sm border">
            {/* Sobre */}
            <TouchableOpacity
              onPress={() => setShowSobre(true)}
              style={{ borderBottomColor: colors.cardBorder }}
              className="flex-row items-center p-4 border-b"
            >
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="information-circle" size={22} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Sobre</Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm">Informações do aplicativo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
            </TouchableOpacity>

            {/* Ajuda */}
            <TouchableOpacity
              onPress={() => setShowAjuda(true)}
              style={{ borderBottomColor: colors.cardBorder }}
              className="flex-row items-center p-4 border-b"
            >
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="help-circle" size={22} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Ajuda</Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm">Dúvidas e suporte</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
            </TouchableOpacity>

            {/* Limitações da API */}
            <TouchableOpacity
              onPress={() => setShowLimitacoes(true)}
              className="flex-row items-center p-4"
            >
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="warning" size={22} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Limitações da API</Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm">O que pode ou não ser editado</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.cardTextSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Servidor & Conta */}
        <View className="mt-6 mx-4">
          <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
            Servidor & Conta
          </Text>
          
          <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl overflow-hidden shadow-sm border">
            {/* Servidor MK-Auth */}
            <View style={{ borderBottomColor: colors.cardBorder }} className="flex-row items-center p-4 border-b">
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="server" size={22} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Servidor MK-Auth</Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm">{ipMkAuth || 'Não conectado'}</Text>
              </View>
            </View>

            {/* Sair da Conta */}
            <TouchableOpacity
              onPress={handleLogout}
            >
              <View className="flex-row items-center p-4">
                <View style={{ backgroundColor: theme === 'dark' ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="log-out-outline" size={22} color="#dc2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-red-600">Sair da Conta</Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-sm">Desconectar deste servidor</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#dc2626" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Versão */}
        <View className="mt-6 mx-4">
          <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
            Sistema
          </Text>
          
          <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl overflow-hidden shadow-sm border">
            <View className="flex-row items-center p-4">
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : '#ede9fe' }} className="w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="code-slash" size={22} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold">Versão do App</Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm">
                  {appVersion} (Build {buildNumber})
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Espaçamento final */}
        <View className="h-8" />
      </ScrollView>
      </View>

      {/* Modal Sobre */}
      <Modal
        visible={showSobre}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSobre(false)}
      >
        <View style={{ backgroundColor: colors.screenBackground }} className="flex-1">
          {/* Header do Modal */}
          <View style={{ backgroundColor: colors.headerBackground }} className="pt-14 pb-6 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: colors.headerText }} className="text-2xl font-bold">Sobre</Text>
              <TouchableOpacity
                onPress={() => setShowSobre(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={28} color={colors.headerText} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            {/* Logo/Ícone */}
            <View className="items-center mb-6">
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }} className="w-24 h-24 rounded-3xl items-center justify-center mb-4">
                <Ionicons name="phone-portrait" size={48} color="#3b82f6" />
              </View>
              <Text style={{ color: colors.cardTextPrimary }} className="text-2xl font-bold mb-1">MK Auth Mobile</Text>
              <Text style={{ color: colors.cardTextSecondary }} className="text-base">
                v{appVersion} (Build {buildNumber})
              </Text>
            </View>

            {/* Descrição */}
            <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe' }} className="rounded-2xl p-5 mb-6 border">
              <Text style={{ color: colors.cardTextPrimary }} className="text-base leading-6">
                Aplicativo móvel oficial para técnicos gerenciarem atendimentos, 
                conectando-se diretamente ao servidor MK-Auth do seu provedor.
              </Text>
            </View>

            {/* Como Funciona a Integração */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="link" size={24} color="#3b82f6" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Como Funciona</Text>
              </View>
              
              <View style={{ backgroundColor: colors.searchInputBackground }} className="rounded-2xl p-5">
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6 mb-3">
                  O aplicativo se conecta <Text className="font-bold">diretamente</Text> ao servidor 
                  MK-Auth do seu provedor usando as credenciais fornecidas no login.
                </Text>
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6">
                  Todas as consultas e operações são feitas em <Text className="font-bold">tempo real</Text> através 
                  da API REST oficial do MK-Auth, sem intermediários.
                </Text>
              </View>
            </View>

            {/* Segurança e Privacidade */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="shield-checkmark" size={24} color="#10b981" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Segurança & Privacidade</Text>
              </View>
              
              <View className="space-y-3">
                <SecurityItem 
                  icon="lock-closed" 
                  title="Sem Cópia de Dados" 
                  description="Não copiamos, armazenamos ou mantemos backup dos dados do seu MK-Auth. Tudo permanece apenas no seu servidor."
                />
                <SecurityItem 
                  icon="server" 
                  title="Sem Acesso ao Servidor" 
                  description="Não temos acesso ao seu servidor. Apenas o aplicativo instalado no celular do técnico se conecta, usando as credenciais que você fornece."
                />
                <SecurityItem 
                  icon="phone-portrait" 
                  title="Cache Local Temporário" 
                  description="Para funcionar offline, o app mantém um cache temporário no celular do técnico. Esse cache é criptografado e apagado ao fazer logout."
                />
                <SecurityItem 
                  icon="key" 
                  title="Token com Expiração" 
                  description="O token de acesso expira automaticamente. Usamos o sistema de autenticação nativo do MK-Auth, sem alterar suas configurações de segurança."
                />
              </View>
            </View>

            {/* O Que é Armazenado */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="phone-portrait" size={24} color="#f59e0b" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">O Que Fica no Celular</Text>
              </View>
              
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb', borderColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.3)' : '#fde68a' }} className="rounded-2xl p-5 border">
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6 mb-3 font-semibold">
                  Armazenamento Local (no dispositivo):
                </Text>
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6 mb-2">
                  • Credenciais de login (criptografadas){'\n'}
                  • Token de autenticação (temporário){'\n'}
                  • Cache de dados consultados (para modo offline){'\n'}
                  • Identificação do usuário logado
                </Text>
                <Text style={{ color: colors.cardTextSecondary }} className="text-sm leading-6 mt-3 italic">
                  Ao fazer logout, todos esses dados são removidos do dispositivo.
                </Text>
              </View>
            </View>

            {/* Benefícios para o Provedor */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={24} color="#8b5cf6" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Benefícios</Text>
              </View>
              
              <View className="space-y-3">
                <BenefitItem 
                  title="Controle Total" 
                  description="Você mantém 100% do controle sobre os dados e acessos através do seu próprio MK-Auth."
                />
                <BenefitItem 
                  title="Sem Custos de Infraestrutura" 
                  description="Não há servidores nossos envolvidos. Economize com servidores e manutenção."
                />
                <BenefitItem 
                  title="Conformidade LGPD" 
                  description="Os dados dos seus clientes permanecem apenas no seu servidor, facilitando conformidade com LGPD."
                />
                <BenefitItem 
                  title="Produtividade" 
                  description="Técnicos trabalham mais rápido com app nativo, modo offline e interface otimizada para atendimentos."
                />
              </View>
            </View>

            {/* Suporte */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="headset" size={24} color="#ec4899" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Suporte</Text>
              </View>
              
              <TouchableOpacity
                onPress={() => Linking.openURL('mailto:suporte@mkauthmobile.com')}
                style={{ backgroundColor: colors.searchInputBackground }}
                className="rounded-2xl p-5"
              >
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color={colors.cardTextSecondary} />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-sm ml-3">suporte@mkauthmobile.com</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Copyright */}
            <View className="items-center py-8 mb-4">
              <Text style={{ color: colors.cardTextSecondary }} className="text-sm mb-2">
                © 2025 MK Auth Mobile
              </Text>
              <Text style={{ color: colors.cardTextSecondary }} className="text-xs">
                Integração segura e transparente
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Ajuda */}
      <Modal
        visible={showAjuda}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAjuda(false)}
      >
        <View style={{ backgroundColor: colors.screenBackground }} className="flex-1">
          {/* Header do Modal */}
          <View style={{ backgroundColor: colors.headerBackground }} className="pt-14 pb-6 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: colors.headerText }} className="text-2xl font-bold">Ajuda</Text>
              <TouchableOpacity
                onPress={() => setShowAjuda(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={28} color={colors.headerText} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            {/* Guia Rápido */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="rocket" size={24} color="#10b981" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Guia Rápido</Text>
              </View>
              
              <View className="space-y-3">
                <QuickGuideItem
                  icon="calendar"
                  title="Ver seus atendimentos"
                  steps={[
                    "Acesse a aba 'Agenda' na barra inferior",
                    "Visualize chamados e instalações agendados",
                    "Toque em um item para ver detalhes completos"
                  ]}
                />
                <QuickGuideItem
                  icon="search"
                  title="Buscar um cliente"
                  steps={[
                    "Vá para aba 'Clientes'",
                    "Use a barra de busca (nome, CPF, telefone, login)",
                    "Toque no cliente para ver dados completos"
                  ]}
                />
                <QuickGuideItem
                  icon="checkmark-done"
                  title="Fechar um chamado"
                  steps={[
                    "Encontre o chamado na Agenda ou pelo cliente",
                    "Toque para abrir os detalhes",
                    "Role até o final e toque 'Fechar Chamado'",
                    "Confirme a ação"
                  ]}
                />
                <QuickGuideItem
                  icon="construct"
                  title="Finalizar instalação"
                  steps={[
                    "Localize a instalação na Agenda",
                    "Abra os detalhes da instalação",
                    "Toque em 'Fechar Instalação' ao concluir",
                    "Confirme para registrar"
                  ]}
                />
              </View>
            </View>

            {/* Resolução de Problemas */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="construct" size={24} color="#f59e0b" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Problemas Comuns</Text>
              </View>
              
              <View className="space-y-3">
                <TroubleshootItem
                  icon="wifi"
                  problem="Não consigo conectar ao servidor"
                  solution="Verifique se o IP do servidor MK-Auth está correto. Confirme se o servidor está online e acessível. Se o problema persistir, fale com o administrador do sistema."
                />
                <TroubleshootItem
                  icon="refresh-circle"
                  problem="Dados desatualizados"
                  solution="Puxe para baixo nas telas de lista para forçar atualização. Se estiver offline, conecte-se à internet para sincronizar."
                />
                <TroubleshootItem
                  icon="alert-circle"
                  problem="Erro ao fechar chamado/instalação"
                  solution="Verifique sua conexão com a internet. Certifique-se de que você tem as permissões necessárias no MK-Auth. Tente novamente em alguns segundos."
                />
                <TroubleshootItem
                  icon="log-out"
                  problem="Fui desconectado automaticamente"
                  solution="O token de autenticação expira por segurança. Faça login novamente. Se ocorrer com frequência, consulte o administrador sobre a configuração de tempo de sessão."
                />
                <TroubleshootItem
                  icon="search"
                  problem="Cliente não aparece na busca"
                  solution="Verifique se digitou corretamente. Tente buscar por outras informações (CPF, telefone). Se o cliente for novo, pode levar alguns segundos para aparecer após sincronização."
                />
              </View>
            </View>

            {/* Modo Offline */}
            <View className="mb-6">
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#faf5ff', borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : '#e9d5ff' }} className="rounded-2xl p-5 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="cloud-offline" size={24} color="#8b5cf6" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Modo Offline</Text>
                </View>
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6 mb-3">
                  O app funciona parcialmente sem internet:
                </Text>
                <View className="space-y-2">
                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" className="mt-0.5" />
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm ml-2 flex-1">
                      Visualizar dados já consultados (cache local)
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" className="mt-0.5" />
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm ml-2 flex-1">
                      Navegar entre telas e ver detalhes
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="close-circle" size={18} color="#ef4444" className="mt-0.5" />
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm ml-2 flex-1">
                      Buscar novos dados ou fazer atualizações
                    </Text>
                  </View>
                  <View className="flex-row items-start">
                    <Ionicons name="close-circle" size={18} color="#ef4444" className="mt-0.5" />
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm ml-2 flex-1">
                      Fechar chamados ou instalações
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Dicas de Produtividade */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="bulb" size={24} color="#eab308" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Dicas de Produtividade</Text>
              </View>
              
              <View className="space-y-3">
                <ProductivityTip
                  icon="flash"
                  tip="Puxe para baixo em qualquer lista para atualizar os dados rapidamente"
                />
                <ProductivityTip
                  icon="copy"
                  tip="Pressione e segure em telefones, CPFs e outros dados para copiar automaticamente"
                />
                <ProductivityTip
                  icon="swap-horizontal"
                  tip="Se atende múltiplos provedores, use 'Trocar Usuário' ao invés de Sair para manter o servidor salvo"
                />
                <ProductivityTip
                  icon="sync"
                  tip="Consulte dados importantes antes de sair para área sem cobertura - eles ficarão em cache"
                />
                <ProductivityTip
                  icon="time"
                  tip="Acesse o Histórico para revisar atendimentos anteriores e verificar padrões"
                />
                <ProductivityTip
                  icon="bookmark"
                  tip="Mantenha o app atualizado para receber novos recursos e melhorias de performance"
                />
              </View>
            </View>

            {/* Suporte */}
            <View className="mb-6">
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe' }} className="rounded-2xl p-5 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="help-buoy" size={24} color="#3b82f6" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Precisa de Ajuda?</Text>
                </View>
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6 mb-4">
                  Se não encontrou resposta aqui, nossa equipe está pronta para ajudar:
                </Text>
                
                <TouchableOpacity
                  onPress={() => Linking.openURL('mailto:suporte@mkauthmobile.com')}
                  className="bg-blue-500 rounded-xl p-4 active:bg-blue-600"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="mail" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">suporte@mkauthmobile.com</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Espaçamento final */}
            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Perfil Completo */}
      <Modal
        visible={showPerfil}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPerfil(false)}
      >
        <View style={{ backgroundColor: colors.screenBackground }} className="flex-1">
          {/* Header */}
          <View style={{ backgroundColor: colors.headerBackground }} className="pt-14 pb-6 px-6">
            <TouchableOpacity
              onPress={() => setShowPerfil(false)}
              className="absolute top-14 right-6 z-10"
            >
              <Ionicons name="close" size={28} color={colors.headerText} />
            </TouchableOpacity>
            
            <View className="items-center">
              <View style={{
                width: 120,
                height: 120,
                backgroundColor: '#3b82f6',
                borderRadius: 60,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(59, 130, 246, 0.3)',
              }}>
                <Text className="text-white text-5xl font-bold">
                  {currentUser?.nome.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={{ color: colors.cardTextPrimary }} className="text-2xl font-bold mt-4">
                {currentUser?.nome}
              </Text>
              <Text style={{ color: colors.cardTextSecondary }} className="text-base mt-1">
                @{currentUser?.login}
              </Text>
            </View>
          </View>

          {/* Conteúdo */}
          <ScrollView style={{ backgroundColor: colors.screenBackground }} className="flex-1">
            <View className="p-6">
              {/* Card de Resumo */}
              <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl p-5 mb-6 shadow-sm border">
                {/* Login */}
                <View className="mb-4">
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-2">Usuário de Acesso</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="person-circle" size={18} color="#3b82f6" />
                    <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold ml-2">@{currentUser?.login}</Text>
                  </View>
                </View>

                {/* Email */}
                {currentUser?.email && (
                  <View className="mb-4">
                    <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-2">Email</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="mail" size={18} color="#3b82f6" />
                      <Text style={{ color: colors.cardTextPrimary }} className="text-base ml-2">{currentUser.email}</Text>
                    </View>
                  </View>
                )}

                {/* Função */}
                {currentUser?.func && (
                  <View className="mb-4">
                    <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-2">Função</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="briefcase" size={18} color="#3b82f6" />
                      <Text style={{ color: colors.cardTextPrimary }} className="text-base ml-2">{currentUser.func}</Text>
                    </View>
                  </View>
                )}
                
                {/* Status */}
                <View style={{ borderTopColor: colors.cardBorder }} className="pt-4 border-t">
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-2">Status da Conta</Text>
                  <View className="flex-row items-center">
                    <View className={`w-2.5 h-2.5 rounded-full mr-2 ${currentUser?.ativo === 'sim' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <Text className={`text-base font-semibold ${currentUser?.ativo === 'sim' ? 'text-green-600' : 'text-red-600'}`}>
                      {currentUser?.ativo === 'sim' ? 'Ativo' : 'Inativo'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Informações de Acesso */}
              <View className="mb-6">
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
                  Informações de Acesso
                </Text>
                <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl shadow-sm border overflow-hidden">
                  <ProfileInfoItem 
                    icon="time" 
                    label="Último Acesso" 
                    value={currentUser?.ultacesso || 'Não disponível'}
                    colors={colors}
                  />
                  <ProfileInfoItem 
                    icon="calendar" 
                    label="Validade da Conta" 
                    value={currentUser?.validade || 'Não definida'}
                    colors={colors}
                  />
                  <ProfileInfoItem 
                    icon="alarm" 
                    label="Horário Permitido" 
                    value={currentUser?.horario || 'Sem restrições'}
                    showBorder={false}
                    colors={colors}
                  />
                </View>
              </View>

              {/* Segurança */}
              {currentUser?.ga === 'S' && (
                <View className="mb-6">
                  <View style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0' }} className="rounded-2xl p-5 border">
                    <View className="flex-row items-center">
                      <View className="bg-green-500 w-10 h-10 rounded-full items-center justify-center mr-3">
                        <Ionicons name="shield-checkmark" size={22} color="white" />
                      </View>
                      <View className="flex-1">
                        <Text style={{ color: colors.cardTextPrimary }} className="text-base font-semibold mb-1">
                          Autenticação em Duas Etapas
                        </Text>
                        <Text style={{ color: colors.cardTextSecondary }} className="text-sm">
                          Google Authenticator está ativo
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Identificadores */}
              <View className="mb-6">
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
                  Identificadores do Sistema
                </Text>
                <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl shadow-sm border overflow-hidden">
                  <ProfileInfoItem 
                    icon="key" 
                    label="ID de Acesso" 
                    value={currentUser?.idacesso}
                    copyable
                    colors={colors}
                  />
                  <ProfileInfoItem 
                    icon="finger-print" 
                    label="UUID" 
                    value={currentUser?.uuid}
                    mono
                    copyable
                    colors={colors}
                  />
                  <ProfileInfoItem 
                    icon="key-outline" 
                    label="UUID de Acesso" 
                    value={currentUser?.uuid_acesso}
                    mono
                    copyable
                    showBorder={false}
                    colors={colors}
                  />
                </View>
              </View>

              {/* Informação Adicional */}
              {currentUser?.cli_grupos && (
                <View className="mb-6">
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-semibold uppercase tracking-wide mb-3 ml-1">
                    Informações Adicionais
                  </Text>
                  <View style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }} className="rounded-2xl shadow-sm border overflow-hidden">
                    <ProfileInfoItem 
                      icon="people" 
                      label="Grupos" 
                      value={currentUser.cli_grupos}
                      showBorder={false}
                      colors={colors}
                    />
                  </View>
                </View>
              )}

              {/* Nota sobre Dados */}
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe' }} className="rounded-xl p-4 mb-6 border">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#3b82f6" className="mr-2 mt-0.5" />
                  <Text style={{ color: colors.cardTextSecondary }} className="flex-1 text-xs leading-5">
                    Estas informações são provenientes do servidor MK-Auth e refletem suas permissões e configurações de acesso.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal Limitações da API */}
      <Modal
        visible={showLimitacoes}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLimitacoes(false)}
      >
        <View style={{ backgroundColor: colors.screenBackground }} className="flex-1">
          {/* Header do Modal */}
          <View style={{ backgroundColor: colors.headerBackground }} className="pt-14 pb-6 px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: colors.headerText }} className="text-2xl font-bold">Limitações da API</Text>
              <TouchableOpacity
                onPress={() => setShowLimitacoes(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={28} color={colors.headerText} />
              </TouchableOpacity>
            </View>
            <Text style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)' }} className="text-base">
              Entenda o que pode ou não ser editado no aplicativo
            </Text>
          </View>

          <ScrollView className="flex-1 px-6 pt-6">
            {/* Introdução */}
            <View style={{ backgroundColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb', borderColor: theme === 'dark' ? 'rgba(245, 158, 11, 0.3)' : '#fde68a' }} className="rounded-2xl p-5 mb-6 border">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#f59e0b" />
                <View className="flex-1 ml-3">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold mb-2">Por que essas limitações?</Text>
                  <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6">
                    O aplicativo se conecta diretamente à API do MK-Auth instalada no seu servidor. 
                    As funcionalidades disponíveis dependem do que a API permite. Algumas operações 
                    estão restritas pela própria API do sistema.
                  </Text>
                </View>
              </View>
            </View>

            {/* Chamados */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="construct" size={24} color="#ef4444" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Chamados</Text>
              </View>

              {/* O que pode editar */}
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0' }} className="rounded-xl p-4 mb-3 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold ml-2">Pode Editar:</Text>
                </View>
                <View className="space-y-2">
                  <LimitationItem
                    type="allowed"
                    field="Assunto"
                    description="Alterar o título/descrição do chamado"
                  />
                  <LimitationItem
                    type="allowed"
                    field="Prioridade"
                    description="Mudar o nível de prioridade (baixa, média, alta, urgente)"
                  />
                  <LimitationItem
                    type="allowed"
                    field="Status"
                    description="Fechar ou reabrir chamado (operações separadas)"
                  />
                </View>
              </View>

              {/* O que NÃO pode editar */}
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fecaca' }} className="rounded-xl p-4 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold ml-2">NÃO Pode Editar:</Text>
                </View>
                <View className="space-y-2">
                  <LimitationItem
                    type="blocked"
                    field="Data da Visita"
                    description="A API não permite alterar a data agendada"
                    reason="Campo não incluído no endpoint PUT /chamado/editar"
                  />
                  <LimitationItem
                    type="blocked"
                    field="Técnico Designado"
                    description="Não é possível atribuir ou mudar o técnico"
                    reason="Campo 'atendente' fixo como 'API' no código da API"
                  />
                  <LimitationItem
                    type="blocked"
                    field="Cliente"
                    description="Não pode alterar o login/cliente vinculado"
                    reason="Requer criação de novo chamado"
                  />
                  <LimitationItem
                    type="blocked"
                    field="Data de Abertura"
                    description="Data de criação é imutável"
                    reason="Campo automático do sistema"
                  />
                </View>
              </View>
            </View>

            {/* Instalações */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="home" size={24} color="#10b981" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Instalações</Text>
              </View>

              {/* O que pode editar */}
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0' }} className="rounded-xl p-4 mb-3 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold ml-2">Pode Editar:</Text>
                </View>
                <View className="space-y-2">
                  <LimitationItem
                    type="allowed"
                    field="Data da Visita"
                    description="Alterar data e hora agendadas para a visita técnica"
                  />
                  <LimitationItem
                    type="allowed"
                    field="Técnico Responsável"
                    description="Atribuir ou mudar o técnico designado"
                  />
                  <LimitationItem
                    type="allowed"
                    field="Plano"
                    description="Alterar o plano contratado pelo cliente"
                  />
                  <LimitationItem
                    type="allowed"
                    field="Observações"
                    description="Adicionar ou editar notas sobre a instalação"
                  />
                  <LimitationItem
                    type="allowed"
                    field="Contatos"
                    description="Editar e-mail, telefone e celular do cliente"
                  />
                  <LimitationItem
                    type="allowed"
                    field="Fechar Instalação"
                    description="Marcar instalação como concluída"
                  />
                </View>
              </View>

              {/* O que NÃO pode editar */}
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fecaca' }} className="rounded-xl p-4 mb-3 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold ml-2">NÃO Pode Editar:</Text>
                </View>
                <View className="space-y-2">
                  <LimitationItem
                    type="blocked"
                    field="Reabrir Instalação"
                    description="A API não disponibiliza endpoint para reabrir instalações concluídas"
                    reason="Nenhum endpoint disponível para reabertura"
                  />
                </View>
              </View>

              {/* Nota sobre edição */}
              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe' }} className="rounded-xl p-4 border">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#3b82f6" className="mr-2 mt-0.5" />
                  <View className="flex-1">
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-semibold mb-2">
                      API Flexível
                    </Text>
                    <Text style={{ color: colors.cardTextSecondary }} className="text-xs leading-5">
                      A API de instalações permite editar praticamente qualquer campo. 
                      No app, disponibilizamos edição dos campos mais usados no dia a dia. 
                      Para alterações complexas (endereço, dados cadastrais), use o painel web.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Clientes */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="people" size={24} color="#8b5cf6" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Clientes</Text>
              </View>

              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#faf5ff', borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : '#e9d5ff' }} className="rounded-xl p-4 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="eye" size={20} color="#8b5cf6" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold ml-2">Modo Somente Leitura:</Text>
                </View>
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6 mb-3">
                  Todos os dados de clientes são <Text className="font-bold">somente para consulta</Text>. 
                  O app não permite criar, editar ou excluir clientes.
                </Text>
                <View style={{ backgroundColor: colors.cardBackground, borderColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : '#e9d5ff' }} className="rounded-lg p-3 border">
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs">
                    💡 <Text className="font-semibold">Dica:</Text> Use o app para consultar rapidamente 
                    informações durante atendimentos. Para alterações cadastrais, acesse o painel web.
                  </Text>
                </View>
              </View>
            </View>

            {/* Usuários/Funcionários */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="person" size={24} color="#10b981" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Usuários/Funcionários</Text>
              </View>

              <View style={{ backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#f0fdf4', borderColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0' }} className="rounded-xl p-4 border">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="eye" size={20} color="#10b981" />
                  <Text style={{ color: colors.cardTextPrimary }} className="text-base font-bold ml-2">Visualização Limitada:</Text>
                </View>
                <Text style={{ color: colors.cardTextPrimary }} className="text-sm leading-6">
                  Você pode consultar informações básicas de usuários/funcionários, mas 
                  não pode criar, editar permissões ou gerenciar contas. Isso deve ser feito 
                  pelo administrador no painel do MK-Auth.
                </Text>
              </View>
            </View>

            {/* O Que Fazer */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="bulb" size={24} color="#f59e0b" />
                <Text style={{ color: colors.cardTextPrimary }} className="text-lg font-bold ml-2">Como Contornar?</Text>
              </View>

              <View className="space-y-3">
                <WorkaroundItem
                  icon="globe"
                  title="Use o Painel Web"
                  description="Para operações não suportadas no app, acesse o MK-Auth pelo navegador. Lá você tem acesso completo a todas as funcionalidades."
                />
                <WorkaroundItem
                  icon="call"
                  title="Solicite ao Administrador"
                  description="Se precisar de alterações que não pode fazer, entre em contato com o administrador do sistema ou supervisor."
                />
                <WorkaroundItem
                  icon="code-slash"
                  title="Personalize a API"
                  description="Se você tem acesso ao servidor, pode modificar os arquivos .api em /opt/mk-auth/api/ para adicionar funcionalidades. Consulte um desenvolvedor."
                />
              </View>
            </View>

            {/* Nota Final */}
            <View style={{ backgroundColor: colors.searchInputBackground, borderColor: colors.cardBorder }} className="rounded-xl p-4 mb-6 border">
              <View className="flex-row items-start">
                <Ionicons name="shield-checkmark" size={20} color={colors.cardTextSecondary} className="mr-2 mt-0.5" />
                <View className="flex-1">
                  <Text style={{ color: colors.cardTextPrimary }} className="text-sm font-semibold mb-2">
                    Essas limitações são por design
                  </Text>
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs leading-5">
                    O aplicativo foi desenvolvido para operações de campo dos técnicos. Operações 
                    administrativas e alterações sensíveis permanecem restritas ao painel web por 
                    questões de segurança e controle.
                  </Text>
                </View>
              </View>
            </View>

            {/* Espaçamento final */}
            <View className="h-8" />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  largeAvatarContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});

// Componente para Info Row no modal de perfil
function LocalInfoRow({ 
  label, 
  value, 
  icon, 
  mono = false,
  valueColor,
  colors
}: { 
  label: string; 
  value?: string; 
  icon: string; 
  mono?: boolean;
  valueColor?: string;
  colors: typeof Colors.light;
}) {
  return (
    <View className="flex-row items-center">
      <Ionicons name={icon as any} size={18} color={colors.cardTextSecondary} />
      <View className="flex-1 ml-3">
        <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-0.5">{label}</Text>
        <Text 
          style={{ 
            fontFamily: mono ? 'monospace' : undefined,
            color: valueColor || colors.cardTextPrimary,
            fontSize: 14,
          }}
          className="font-medium"
        >
          {value || 'N/A'}
        </Text>
      </View>
    </View>
  );
}

// Componente para Security Item
function SecurityItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string;
}) {
  return (
    <View className="bg-white rounded-xl p-4 border border-gray-200">
      <View className="flex-row items-start mb-2">
        <View className="bg-green-100 w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5">
          <Ionicons name={icon as any} size={16} color="#10b981" />
        </View>
        <Text className="text-base font-semibold text-gray-800 flex-1">{title}</Text>
      </View>
      <Text className="text-sm text-gray-600 leading-5 ml-11">{description}</Text>
    </View>
  );
}

// Componente para Benefit Item
function BenefitItem({ 
  title, 
  description 
}: { 
  title: string; 
  description: string;
}) {
  return (
    <View className="flex-row items-start">
      <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" className="mr-3 mt-0.5" />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800 mb-1">{title}</Text>
        <Text className="text-sm text-gray-600 leading-5">{description}</Text>
      </View>
    </View>
  );
}

// Componente para Quick Guide Item
function QuickGuideItem({ 
  icon, 
  title, 
  steps 
}: { 
  icon: string; 
  title: string; 
  steps: string[];
}) {
  return (
    <View className="bg-green-50 rounded-xl p-4 border border-green-100">
      <View className="flex-row items-center mb-3">
        <View className="bg-green-500 w-8 h-8 rounded-full items-center justify-center mr-3">
          <Ionicons name={icon as any} size={18} color="white" />
        </View>
        <Text className="text-base font-bold text-gray-800 flex-1">{title}</Text>
      </View>
      {steps.map((step, index) => (
        <View key={index} className="flex-row items-start mb-2">
          <View className="bg-green-200 w-6 h-6 rounded-full items-center justify-center mr-2 mt-0.5">
            <Text className="text-green-800 text-xs font-bold">{index + 1}</Text>
          </View>
          <Text className="text-sm text-gray-700 leading-5 flex-1">{step}</Text>
        </View>
      ))}
    </View>
  );
}

// Componente para Troubleshoot Item
function TroubleshootItem({ 
  icon, 
  problem, 
  solution 
}: { 
  icon: string; 
  problem: string; 
  solution: string;
}) {
  return (
    <View className="bg-amber-50 rounded-xl p-4 border border-amber-100">
      <View className="flex-row items-start mb-2">
        <Ionicons name={icon as any} size={20} color="#f59e0b" className="mr-3 mt-0.5" />
        <Text className="text-base font-semibold text-gray-800 flex-1">{problem}</Text>
      </View>
      <Text className="text-sm text-gray-700 leading-5 ml-8">{solution}</Text>
    </View>
  );
}

// Componente para Productivity Tip
function ProductivityTip({ 
  icon, 
  tip 
}: { 
  icon: string; 
  tip: string;
}) {
  return (
    <View className="flex-row items-start bg-yellow-50 rounded-lg p-3 border border-yellow-100">
      <Ionicons name={icon as any} size={18} color="#eab308" className="mr-3 mt-0.5" />
      <Text className="flex-1 text-sm text-gray-700 leading-5">{tip}</Text>
    </View>
  );
}

// Componente para Profile Info Item
function ProfileInfoItem({ 
  icon, 
  label, 
  value, 
  mono = false,
  copyable = false,
  showBorder = true,
  colors
}: { 
  icon: string; 
  label: string; 
  value?: string;
  mono?: boolean;
  copyable?: boolean;
  showBorder?: boolean;
  colors: typeof Colors.light;
}) {
  return (
    <View style={showBorder ? { borderBottomWidth: 1, borderBottomColor: colors.cardBorder } : undefined} className="p-4">
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={20} color={colors.cardTextSecondary} />
        <View className="flex-1 ml-3">
          <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-1">{label}</Text>
          <Text 
            style={{ 
              fontFamily: mono ? 'monospace' : undefined,
              fontSize: 14,
              color: colors.cardTextPrimary,
            }}
            className="font-medium"
          >
            {value || 'Não disponível'}
          </Text>
        </View>
        {copyable && value && (
          <TouchableOpacity className="ml-2">
            <Ionicons name="copy-outline" size={18} color={colors.cardTextSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Componente para Feature Item
function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View className="flex-row items-start mb-3">
      <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
        <Ionicons name={icon as any} size={20} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800 mb-1">{title}</Text>
        <Text className="text-sm text-gray-600 leading-5">{description}</Text>
      </View>
    </View>
  );
}

// Componente para FAQ Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <View className="bg-gray-50 rounded-2xl p-5 mb-3">
      <Text className="text-base font-semibold text-gray-800 mb-2">{question}</Text>
      <Text className="text-sm text-gray-600 leading-6">{answer}</Text>
    </View>
  );
}

// Componente para Tip Item
function TipItem({ icon, tip }: { icon: string; tip: string }) {
  return (
    <View className="flex-row items-start">
      <Ionicons name={icon as any} size={20} color="#10b981" className="mr-3 mt-0.5" />
      <Text className="flex-1 text-sm text-gray-700 leading-6">{tip}</Text>
    </View>
  );
}

// Componente para Limitation Item
function LimitationItem({ 
  type,
  field, 
  description,
  reason
}: { 
  type: 'allowed' | 'blocked';
  field: string; 
  description: string;
  reason?: string;
}) {
  const iconName = type === 'allowed' ? 'checkmark-circle' : 'close-circle';
  const iconColor = type === 'allowed' ? '#10b981' : '#ef4444';
  
  return (
    <View className="mb-3 last:mb-0">
      <View className="flex-row items-start">
        <Ionicons name={iconName} size={16} color={iconColor} className="mr-2 mt-0.5" />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-800">{field}</Text>
          <Text className="text-xs text-gray-600 leading-5 mt-0.5">{description}</Text>
          {reason && (
            <Text className="text-xs text-gray-500 italic mt-1">
              ⚠️ {reason}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// Componente para Workaround Item
function WorkaroundItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string;
}) {
  return (
    <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <View className="flex-row items-start">
        <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center mr-3 mt-0.5">
          <Ionicons name={icon as any} size={18} color="#f59e0b" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-1">{title}</Text>
          <Text className="text-sm text-gray-600 leading-5">{description}</Text>
        </View>
      </View>
    </View>
  );
}
