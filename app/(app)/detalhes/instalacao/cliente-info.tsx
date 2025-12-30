import { useEditaInstalacao, useInstalacaoDetail } from '@/hooks/instalacao';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ClienteInstalacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const editaInstalacaoMutation = useEditaInstalacao();

  // Estados para modais de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'email' | 'telefone' | 'celular' | 'endereco' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado' | 'cep' | 'coordenadas' | 'vencimento' | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: instalacao, isLoading, error } = useInstalacaoDetail(id || '');

  const abrirEdicao = (field: typeof editField, value: string) => {
    setEditField(field);
    setEditValue(value);
    setEditModalVisible(true);
  };

  const getFieldLabel = () => {
    const labels: Record<string, string> = {
      email: 'E-mail',
      vencimento: 'Vencimento',
      telefone: 'Telefone',
      celular: 'Celular',
      endereco: 'Endereço',
      numero: 'Número',
      complemento: 'Complemento',
      bairro: 'Bairro',
      cidade: 'Cidade',
      estado: 'Estado',
      cep: 'CEP',
      coordenadas: 'Coordenadas GPS',
    };
    return labels[editField || ''] || '';
  };

  const salvarEdicao = () => {
    if (!editField) return;

    const dados = { [editField]: editValue };

    editaInstalacaoMutation.mutate(
      { uuid: instalacao!.uuid_solic, dados },
      {
        onSuccess: () => {
          setEditModalVisible(false);
          Toast.show({
            type: 'success',
            text1: 'Alteração salva! ✅',
            position: 'top',
            visibilityTime: 2000,
            topOffset: 60,
          });
        },
        onError: (error) => {
          Toast.show({
            type: 'error',
            text1: 'Erro ao salvar',
            text2: error instanceof Error ? error.message : 'Tente novamente',
            position: 'top',
            topOffset: 60,
          });
        },
      }
    );
  };

  const isEditable = instalacao?.status === 'aberto';

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">ID da instalação não fornecido</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0284c7" />
        <Text className="mt-4 text-gray-600">Carregando dados do cliente...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <Text className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar dados</Text>
        <Text className="text-gray-600 text-center">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Text>
      </View>
    );
  }

  if (!instalacao) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-500">Dados não encontrados</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dados do Cliente',
          headerBackTitle: 'Voltar',
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ScrollView className="flex-1">
        <View className="p-4">
            {/* Dados Pessoais */}
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Dados Pessoais</Text>

              <View className="gap-3">
                <InfoRow label="Nome Completo" value={instalacao.nome} />

                <EditableInfoRow
                  label="E-mail"
                  value={instalacao.email || 'Não informado'}
                  onEdit={() => abrirEdicao('email', instalacao.email || '')}
                  editable={isEditable}
                />

                {instalacao.codigo && (
                  <InfoRow label="Código" value={instalacao.codigo} />
                )}

                {instalacao.cpf && (
                  <InfoRow label="CPF" value={instalacao.cpf} />
                )}

                {instalacao.rg && (
                  <InfoRow label="RG" value={instalacao.rg} />
                )}

                <EditableInfoRow
                  label="Telefone"
                  value={instalacao.telefone || 'Não informado'}
                  onEdit={() => abrirEdicao('telefone', instalacao.telefone || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Celular"
                  value={instalacao.celular || 'Não informado'}
                  onEdit={() => abrirEdicao('celular', instalacao.celular || '')}
                  editable={isEditable}
                />

                {instalacao.opcelular && (
                  <InfoRow label="Operadora" value={instalacao.opcelular} />
                )}

                {instalacao.celular2 && (
                  <InfoRow label="Celular 2" value={instalacao.celular2} />
                )}

                {instalacao.opcelular2 && (
                  <InfoRow label="Operadora 2" value={instalacao.opcelular2} />
                )}

                {instalacao.naturalidade && (
                  <InfoRow label="Naturalidade" value={instalacao.naturalidade} />
                )}

                {instalacao.data_nasc && (
                  <InfoRow label="Data de Nascimento" value={new Date(instalacao.data_nasc).toLocaleDateString('pt-BR')} />
                )}
              </View>
            </View>

            {/* Endereço Residencial e Instalação */}
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Endereço Residencial e Instalação</Text>

              <View className="gap-3">
                <EditableInfoRow
                  label="CEP"
                  value={instalacao.cep || 'Não informado'}
                  onEdit={() => abrirEdicao('cep', instalacao.cep || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Endereço"
                  value={instalacao.endereco || 'Não informado'}
                  onEdit={() => abrirEdicao('endereco', instalacao.endereco || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Número"
                  value={instalacao.numero || 'Não informado'}
                  onEdit={() => abrirEdicao('numero', instalacao.numero || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Bairro"
                  value={instalacao.bairro || 'Não informado'}
                  onEdit={() => abrirEdicao('bairro', instalacao.bairro || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Complemento"
                  value={instalacao.complemento || 'Não informado'}
                  onEdit={() => abrirEdicao('complemento', instalacao.complemento || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Cidade"
                  value={instalacao.cidade || 'Não informado'}
                  onEdit={() => abrirEdicao('cidade', instalacao.cidade || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Estado"
                  value={instalacao.estado || 'Não informado'}
                  onEdit={() => abrirEdicao('estado', instalacao.estado || '')}
                  editable={isEditable}
                />

                <EditableInfoRow
                  label="Coordenadas GPS"
                  value={instalacao.coordenadas || 'Não informado'}
                  onEdit={() => abrirEdicao('coordenadas', instalacao.coordenadas || '')}
                  editable={isEditable}
                />

                {instalacao.dot_ref && (
                  <InfoRow label="Ponto de Referência" value={instalacao.dot_ref} />
                )}
              </View>
            </View>

            {/* Endereço de Correspondência */}
            {(instalacao.endereco_res || instalacao.cep_res || instalacao.bairro_res || instalacao.cidade_res) && (
              <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Endereço de Correspondência</Text>

                <View className="gap-3">
                  {instalacao.cep_res && (
                    <InfoRow label="CEP" value={instalacao.cep_res} />
                  )}

                  {instalacao.endereco_res && (
                    <InfoRow label="Endereço" value={instalacao.endereco_res} />
                  )}

                  {instalacao.numero_res && (
                    <InfoRow label="Número" value={instalacao.numero_res} />
                  )}

                  {instalacao.bairro_res && (
                    <InfoRow label="Bairro" value={instalacao.bairro_res} />
                  )}

                  {instalacao.complemento_res && (
                    <InfoRow label="Complemento" value={instalacao.complemento_res} />
                  )}

                  {instalacao.cidade_res && (
                    <InfoRow label="Cidade" value={instalacao.cidade_res} />
                  )}

                  {instalacao.estado_res && (
                    <InfoRow label="Estado" value={instalacao.estado_res} />
                  )}
                </View>
              </View>
            )}

            {/* Financeiro do Cliente */}
            <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
              <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">Financeiro do Cliente</Text>

              <View className="gap-3">
                {instalacao.vendedor && (
                  <InfoRow label="Vendedor" value={instalacao.vendedor} />
                )}

                <EditableInfoRow
                  label="Vencimento"
                  value={instalacao.vencimento || 'Não informado'}
                  onEdit={() => abrirEdicao('vencimento', instalacao.vencimento || '')}
                  editable={isEditable}
                />

                {instalacao.contrato && (
                  <InfoRow label="Contrato" value={instalacao.contrato} />
                )}
              </View>
            </View>
          </View>
      </ScrollView>

      {/* Modal de Edição de Texto */}
      <Modal
          visible={editModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-800">
                  Editar {getFieldLabel()}
                </Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`Digite ${getFieldLabel().toLowerCase()}`}
                keyboardType={editField === 'email' ? 'email-address' : editField === 'telefone' || editField === 'celular' ? 'phone-pad' : 'default'}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base text-gray-800 mb-4"
                autoFocus
              />

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-lg"
                >
                  <Text className="text-gray-700 font-semibold text-center">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={salvarEdicao}
                  disabled={editaInstalacaoMutation.isPending}
                  className="flex-1 bg-blue-600 py-3 rounded-lg"
                >
                  {editaInstalacaoMutation.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-center">Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// Componente helper para exibir informações com long press para copiar
function InfoRow({ label, value }: { label: string; value: string }) {
  const copiarValor = async () => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: `${label} copiado! 📋`,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 60,
    });
  };

  return (
    <Pressable
      onLongPress={copiarValor}
      delayLongPress={500}
      className="flex-row justify-between py-2 border-b border-gray-100"
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
        }
      ]}
    >
      <Text className="text-gray-600 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm font-medium flex-1 text-right ml-4">
        {value}
      </Text>
    </Pressable>
  );
}

// Componente para campos editáveis
function EditableInfoRow({
  label,
  value,
  onEdit,
  editable = true,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  editable?: boolean;
}) {
  const copiarValor = async () => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: 'success',
      text1: `${label} copiado! 📋`,
      position: 'top',
      visibilityTime: 2000,
      topOffset: 60,
    });
  };

  if (!editable) {
    return <InfoRow label={label} value={value} />;
  }

  return (
    <Pressable
      onLongPress={copiarValor}
      delayLongPress={500}
      className="flex-row justify-between items-center py-2 border-b border-gray-100"
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
        }
      ]}
    >
      <Text className="text-gray-600 text-sm">{label}</Text>
      <TouchableOpacity
        onPress={onEdit}
        className="flex-row items-center gap-2 flex-1 justify-end ml-4"
      >
        <Text className="text-gray-900 text-sm font-medium text-right flex-1">
          {value}
        </Text>
        <Ionicons name="create-outline" size={16} color="#6b7280" />
      </TouchableOpacity>
    </Pressable>
  );
}