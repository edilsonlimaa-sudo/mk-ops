import { useTheme } from '@/contexts/ThemeContext';
import {
  areMkAuthCredentialsFormatValid,
  getMkAuthClientIdFormatHint,
  getMkAuthClientSecretFormatHint,
  validateMkAuthClientId,
  validateMkAuthClientSecret,
} from '@/lib/onboarding/mkAuthCredentials';
import {
  onboardingValidationService,
  RequiredPermission,
  ValidationResultType,
} from '@/services/api/auth/onboarding-validation.service';
import { useOnboardingStore } from '@/stores/onboarding/useOnboardingStore';
import { useSetupStore } from '@/stores/onboarding/useSetupStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ValidationPhase = 'idle' | 'credentials' | 'permissions' | 'success' | 'error';
type EditingField = 'url' | 'clientId' | 'clientSecret' | null;

export default function ConnectionTest() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, setServerUrl: updateServerUrl, setCredentials } = useSetupStore();
  const { completeSetup } = useOnboardingStore();

  // Usar dados da store (sem valores default falsos)
  const [serverUrl, setServerUrl] = useState(data.serverUrl || '');
  const [clientId, setClientId] = useState(data.clientId || '');
  const [clientSecret, setClientSecret] = useState(data.clientSecret || '');

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [tempValue, setTempValue] = useState('');

  // Estado de validação
  const [phase, setPhase] = useState<ValidationPhase>('idle');
  const [errorType, setErrorType] = useState<ValidationResultType | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  
  // Progresso de permissões
  const [permissionProgress, setPermissionProgress] = useState({ current: 0, total: 0 });
  const [currentPermission, setCurrentPermission] = useState<RequiredPermission | null>(null);
  const [missingPermissions, setMissingPermissions] = useState<RequiredPermission[]>([]);

  const testConnection = async () => {
    setPhase('credentials');
    setErrorMessage('');
    setErrorDetails('');
    setErrorType(null);
    setMissingPermissions([]);

    const credentials = {
      serverUrl,
      clientId,
      clientSecret,
    };

    console.log('🚀 [4-validation] Iniciando validação com:', { serverUrl, clientId: clientId.substring(0, 5) + '...' });

    try {
      // Fase 1: Validar credenciais
      console.log('🔐 [4-validation] Fase 1: Validando credenciais...');
      const credentialsResult = await onboardingValidationService.validateCredentials(credentials);
      console.log('🔐 [4-validation] Resultado credenciais:', credentialsResult);

      if (!credentialsResult.success) {
        console.log('❌ [4-validation] Credenciais inválidas:', credentialsResult.type, credentialsResult.message);
        setPhase('error');
        setErrorType(credentialsResult.type);
        setErrorMessage(credentialsResult.message);
        setErrorDetails(credentialsResult.details || '');
        return;
      }

      // Fase 2: Validar permissões
      console.log('🔑 [4-validation] Fase 2: Validando permissões...');
      setPhase('permissions');
      
      const permissionsResult = await onboardingValidationService.validatePermissions(
        credentials,
        (current, total, permission) => {
          console.log(`🔑 [4-validation] Permissão ${current}/${total}: ${permission.description}`);
          setPermissionProgress({ current, total });
          setCurrentPermission(permission);
        }
      );
      console.log('🔑 [4-validation] Resultado permissões:', permissionsResult);

      if (!permissionsResult.success) {
        setPhase('error');
        setErrorMessage(permissionsResult.message);
        return;
      }

      if (!permissionsResult.allGranted) {
        setPhase('error');
        setErrorType('unknown-error');
        setErrorMessage('Algumas permissões não estão configuradas.');
        setMissingPermissions(permissionsResult.missingPermissions);
        return;
      }

      // Sucesso! Salvar dados na store
      updateServerUrl(serverUrl);
      setCredentials(clientId, clientSecret);
      
      setPhase('success');
      completeSetup();
      
      setTimeout(() => {
        router.replace('/(onboarding)/success');
      }, 1500);

    } catch (error) {
      setPhase('error');
      setErrorMessage('Erro inesperado ao validar configurações.');
      setErrorDetails((error as Error).message);
    }
  };

  const startEditing = (field: EditingField) => {
    setEditingField(field);
    if (field === 'url') {
      setTempValue(serverUrl);
    } else if (field === 'clientId') {
      setTempValue(clientId);
    } else if (field === 'clientSecret') {
      setTempValue(clientSecret);
    }
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValue('');
  };

  const saveEditing = () => {
    if (!tempValue.trim()) {
      Alert.alert('Erro', 'O campo não pode estar vazio.');
      return;
    }

    if (editingField === 'clientId') {
      const check = validateMkAuthClientId(tempValue);
      if (check !== true) {
        Alert.alert('Formato inválido', check);
        return;
      }
    } else if (editingField === 'clientSecret') {
      const check = validateMkAuthClientSecret(tempValue);
      if (check !== true) {
        Alert.alert('Formato inválido', check);
        return;
      }
    }

    if (editingField === 'url') {
      setServerUrl(tempValue.trim());
    } else if (editingField === 'clientId') {
      setClientId(tempValue.trim());
    } else if (editingField === 'clientSecret') {
      setClientSecret(tempValue.trim());
    }

    setEditingField(null);
    setTempValue('');

    // Reset status se estava em erro
    if (phase === 'error') {
      setPhase('idle');
      setErrorMessage('');
      setErrorDetails('');
      setMissingPermissions([]);
    }
  };

  // Helpers para UI
  const isValidating = phase === 'credentials' || phase === 'permissions';
  const statusColor = phase === 'success' ? '#10b981' : phase === 'error' ? '#ef4444' : '#f59e0b';
  const credentialsFormatOk = areMkAuthCredentialsFormatValid(clientId, clientSecret);
  const clientIdEditHint = editingField === 'clientId' ? getMkAuthClientIdFormatHint(tempValue) : null;
  const clientSecretEditHint = editingField === 'clientSecret' ? getMkAuthClientSecretFormatHint(tempValue) : null;

  const getTitle = () => {
    switch (phase) {
      case 'credentials': return 'Validando Credenciais...';
      case 'permissions': return 'Verificando Permissões...';
      case 'success': return 'Configuração Válida!';
      case 'error': return 'Falha na Validação';
      default: return 'Validar Configuração';
    }
  };

  const getSubtitle = () => {
    switch (phase) {
      case 'credentials': return 'Conectando ao servidor MK-Auth...';
      case 'permissions': 
        return currentPermission 
          ? `${permissionProgress.current}/${permissionProgress.total}: ${currentPermission.description}`
          : 'Verificando permissões da API...';
      case 'success': return 'Redirecionando para o aplicativo...';
      case 'error': return 'Verifique os dados e tente novamente';
      default: return 'Revise suas configurações antes de testar';
    }
  };

  return (
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
            {/* Ícone e badge */}
            <View className="items-center mb-5">
              <View
                className="w-20 h-20 rounded-3xl items-center justify-center mb-3"
                style={{ backgroundColor: statusColor + '15' }}
              >
                {isValidating ? (
                  <ActivityIndicator color={statusColor} size="large" />
                ) : (
                  <Text className="text-5xl">
                    {phase === 'success' ? '✓' : phase === 'error' ? '✕' : '🔌'}
                  </Text>
                )}
              </View>

              {/* Badge de contexto */}
              <View
                style={{ backgroundColor: statusColor + '10' }}
                className="rounded-full px-3 py-1"
              >
                <Text
                  style={{ color: statusColor }}
                  className="text-xs font-medium"
                >
                  Passo 4 de 4 • Validação
                </Text>
              </View>
            </View>

            {/* Título dentro do card */}
            <Text
              style={{ color: colors.cardTextPrimary }}
              className="text-xl font-bold mb-2 text-center"
            >
              {getTitle()}
            </Text>

            <Text
              style={{ color: colors.cardTextSecondary }}
              className="text-sm mb-6 text-center leading-5"
            >
              {getSubtitle()}
            </Text>

            {/* Informações configuradas */}
            <View className="mb-6">
              {/* URL do Servidor */}
              <View className="mb-3">
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-1.5">
                  URL do Servidor
                </Text>
                {editingField === 'url' ? (
                  <View 
                    style={{
                      backgroundColor: colors.screenBackground,
                      borderColor: '#10b981',
                      borderWidth: 2,
                    }}
                    className="rounded-lg flex-row items-center"
                  >
                    <TextInput
                      value={tempValue}
                      onChangeText={setTempValue}
                      style={{
                        color: colors.cardTextPrimary,
                        flex: 1,
                      }}
                      className="p-4 text-sm"
                      placeholder="https://exemplo.mkauth.com.br"
                      placeholderTextColor={colors.cardTextSecondary}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      autoFocus
                      onSubmitEditing={saveEditing}
                      returnKeyType="done"
                    />
                    <View className="flex-row pr-2">
                      <TouchableOpacity
                        onPress={cancelEditing}
                        className="p-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={{ color: '#ef4444' }} className="text-xl">✕</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={saveEditing}
                        className="p-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={{ color: '#10b981' }} className="text-xl">✓</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: colors.screenBackground,
                      borderColor: colors.cardBorder,
                    }}
                    className="border rounded-lg p-3 flex-row items-center justify-between"
                  >
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm flex-1" numberOfLines={1}>
                      {serverUrl}
                    </Text>
                    <TouchableOpacity
                      onPress={() => startEditing('url')}
                      className="ml-2"
                      disabled={editingField !== null || isValidating}
                    >
                      <Text style={{ color: (editingField !== null || isValidating) ? colors.cardTextSecondary : '#3b82f6' }} className="text-xs font-medium">
                        Alterar
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Client ID */}
              <View className="mb-3">
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-1.5">
                  Client ID
                </Text>
                {editingField === 'clientId' ? (
                  <View>
                    <View
                      style={{
                        backgroundColor: colors.screenBackground,
                        borderColor: clientIdEditHint ? '#ef4444' : '#10b981',
                        borderWidth: 2,
                      }}
                      className="rounded-lg flex-row items-center"
                    >
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={{
                          color: colors.cardTextPrimary,
                          flex: 1,
                        }}
                        className="p-4 text-sm font-mono"
                        placeholder="Client_Id_xxxxxxxxxxxx"
                        placeholderTextColor={colors.cardTextSecondary}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus
                        onSubmitEditing={saveEditing}
                        returnKeyType="done"
                      />
                      <View className="flex-row pr-2">
                        <TouchableOpacity
                          onPress={cancelEditing}
                          className="p-2"
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={{ color: '#ef4444' }} className="text-xl">✕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={saveEditing}
                          className="p-2"
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={{ color: '#10b981' }} className="text-xl">✓</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {clientIdEditHint ? (
                      <Text className="text-red-500 text-xs mt-1.5 ml-0.5">{clientIdEditHint}</Text>
                    ) : null}
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: colors.screenBackground,
                      borderColor: colors.cardBorder,
                    }}
                    className="border rounded-lg p-3 flex-row items-center justify-between"
                  >
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm flex-1 font-mono" numberOfLines={1}>
                      {clientId}
                    </Text>
                    <TouchableOpacity
                      onPress={() => startEditing('clientId')}
                      className="ml-2"
                      disabled={editingField !== null || isValidating}
                    >
                      <Text style={{ color: (editingField !== null || isValidating) ? colors.cardTextSecondary : '#3b82f6' }} className="text-xs font-medium">
                        Alterar
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Client Secret */}
              <View>
                <Text style={{ color: colors.cardTextSecondary }} className="text-xs mb-1.5">
                  Client Secret
                </Text>
                {editingField === 'clientSecret' ? (
                  <View>
                    <View
                      style={{
                        backgroundColor: colors.screenBackground,
                        borderColor: clientSecretEditHint ? '#ef4444' : '#10b981',
                        borderWidth: 2,
                      }}
                      className="rounded-lg flex-row items-center"
                    >
                      <TextInput
                        value={tempValue}
                        onChangeText={setTempValue}
                        style={{
                          color: colors.cardTextPrimary,
                          flex: 1,
                        }}
                        className="p-4 text-sm font-mono"
                        placeholder="Client_Secret_xxxxxxxxxxxx"
                        placeholderTextColor={colors.cardTextSecondary}
                        autoCapitalize="none"
                        autoCorrect={false}
                        secureTextEntry
                        autoFocus
                        onSubmitEditing={saveEditing}
                        returnKeyType="done"
                      />
                      <View className="flex-row pr-2">
                        <TouchableOpacity
                          onPress={cancelEditing}
                          className="p-2"
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={{ color: '#ef4444' }} className="text-xl">✕</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={saveEditing}
                          className="p-2"
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Text style={{ color: '#10b981' }} className="text-xl">✓</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {clientSecretEditHint ? (
                      <Text className="text-red-500 text-xs mt-1.5 ml-0.5">{clientSecretEditHint}</Text>
                    ) : null}
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: colors.screenBackground,
                      borderColor: colors.cardBorder,
                    }}
                    className="border rounded-lg p-3 flex-row items-center justify-between"
                  >
                    <Text style={{ color: colors.cardTextPrimary }} className="text-sm flex-1 font-mono" numberOfLines={1}>
                      {'•'.repeat(clientSecret.length)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => startEditing('clientSecret')}
                      className="ml-2"
                      disabled={editingField !== null || isValidating}
                    >
                      <Text style={{ color: (editingField !== null || isValidating) ? colors.cardTextSecondary : '#3b82f6' }} className="text-xs font-medium">
                        Alterar
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {/* Mensagem de erro */}
            {phase === 'error' && (
              <View className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                <Text style={{ color: '#ef4444' }} className="text-sm font-medium mb-1">
                  {errorMessage}
                </Text>
                {errorDetails ? (
                  <Text style={{ color: '#ef4444' }} className="text-xs opacity-80">
                    {errorDetails}
                  </Text>
                ) : null}
                
                {/* Lista de permissões faltando */}
                {missingPermissions.length > 0 && (
                  <View className="mt-3 pt-3 border-t border-red-500/20">
                    <Text style={{ color: '#ef4444' }} className="text-xs font-medium mb-2">
                      Permissões necessárias:
                    </Text>
                    <ScrollView style={{ maxHeight: 120 }} nestedScrollEnabled>
                      {missingPermissions.map((perm, index) => (
                        <View key={index} className="flex-row items-center mb-1">
                          <Text style={{ color: '#ef4444' }} className="text-xs">
                            • {perm.controller} ({perm.method}): {perm.description}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Barra de progresso de permissões */}
            {phase === 'permissions' && (
              <View className="mb-4">
                <View 
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: colors.cardBorder }}
                >
                  <View 
                    className="h-full rounded-full"
                    style={{ 
                      backgroundColor: '#f59e0b',
                      width: `${(permissionProgress.current / permissionProgress.total) * 100}%` 
                    }}
                  />
                </View>
              </View>
            )}

            {/* Mensagem de sucesso */}
            {phase === 'success' && (
              <View className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                <Text style={{ color: '#10b981' }} className="text-xs leading-5">
                  ✓ Todas as validações passaram! Redirecionando...
                </Text>
              </View>
            )}

            {/* Botão de ação */}
            {phase !== 'success' && (
              <TouchableOpacity
                style={{
                  backgroundColor: isValidating ? colors.cardBorder : phase === 'error' ? '#ef4444' : '#10b981',
                  opacity: isValidating ? 0.7 : 1,
                }}
                className="rounded-xl py-3 items-center flex-row justify-center mt-3"
                onPress={testConnection}
                disabled={isValidating || !serverUrl || !credentialsFormatOk}
                activeOpacity={0.8}
              >
                {isValidating && (
                  <ActivityIndicator color="#ffffff" size="small" style={{ marginRight: 10 }} />
                )}
                <Text className="text-white font-semibold text-base">
                  {isValidating 
                    ? (phase === 'credentials' ? 'Validando Credenciais...' : 'Verificando Permissões...') 
                    : phase === 'error' 
                      ? '🔄 Tentar Novamente' 
                      : '✓ Validar Configuração'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
    </KeyboardAwareScrollView>
  );
}
