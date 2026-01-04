import { EditModal } from '@/components/instalacao/EditModal';
import { EditableInfoRow, InfoRow } from '@/components/instalacao/InfoRows';
import { useEditaInstalacao, useInstalacaoDetail } from '@/hooks/instalacao';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ClienteInstalacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const editaInstalacaoMutation = useEditaInstalacao();

  // Estados para modais de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<'email' | 'telefone' | 'celular' | 'endereco' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado' | 'cep' | 'coordenadas' | 'vencimento' | 'endereco_res' | 'numero_res' | 'complemento_res' | 'bairro_res' | 'cidade_res' | 'estado_res' | 'cep_res' | 'cpf' | 'rg' | null>(null);
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
      endereco_res: 'Endereço de Correspondência',
      numero_res: 'Número (Correspondência)',
      complemento_res: 'Complemento (Correspondência)',
      bairro_res: 'Bairro (Correspondência)',
      cidade_res: 'Cidade (Correspondência)',
      estado_res: 'Estado (Correspondência)',
      cep_res: 'CEP (Correspondência)',
      cpf: 'CPF',
      rg: 'RG',
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

  const formatarNome = (nome: string) => {
    if (!nome) return '';
    return nome
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };

  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: 'Dados do Cliente',
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: '#9333ea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* HERO SECTION - Nome do Cliente */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Cliente</Text>
                  <Text className="text-gray-900 text-base font-bold" numberOfLines={2}>
                    {formatarNome(instalacao.nome)}
                  </Text>
                </View>
              </View>

              {instalacao.codigo && (
                <View className="bg-gray-50 rounded-xl px-3 py-2 mt-2">
                  <Text className="text-xs text-gray-500 font-medium">Código do Cliente</Text>
                  <Text className="text-gray-900 text-sm font-semibold mt-0.5">#{instalacao.codigo}</Text>
                </View>
              )}
            </View>

            {/* DADOS PESSOAIS */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="id-card-outline" size={20} color="#9333ea" />
                </View>
                <Text className="text-base text-gray-900 font-bold flex-1">Dados Pessoais</Text>
              </View>

              <View className="gap-3">
                {/* Documentos */}
                {(instalacao.cpf || instalacao.rg) && (
                  <View className="bg-gray-50 rounded-xl p-3">
                    <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Documentos</Text>
                    {instalacao.cpf && (
                      <EditableInfoRow
                        label="CPF"
                        value={instalacao.cpf}
                        onEdit={() => abrirEdicao('cpf', instalacao.cpf || '')}
                        editable={isEditable}
                      />
                    )}
                    {instalacao.rg && (
                      <View className="pt-2">
                        <EditableInfoRow
                          label="RG"
                          value={instalacao.rg}
                          onEdit={() => abrirEdicao('rg', instalacao.rg || '')}
                          editable={isEditable}
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Dados Pessoais */}
                {(instalacao.naturalidade || instalacao.data_nasc) && (
                  <View className="bg-gray-50 rounded-xl p-3">
                    <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Informações Pessoais</Text>
                    {instalacao.naturalidade && (
                      <InfoRow label="Naturalidade" value={instalacao.naturalidade} />
                    )}
                    {instalacao.data_nasc && (
                      <View className={instalacao.naturalidade ? "pt-2" : ""}>
                        <InfoRow label="Data de Nascimento" value={new Date(instalacao.data_nasc).toLocaleDateString('pt-BR')} />
                      </View>
                    )}
                  </View>
                )}

                {/* Contato */}
                <View className="bg-gray-50 rounded-xl p-3">
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Contato</Text>

                  <EditableInfoRow
                    label="E-mail"
                    value={instalacao.email || 'Não informado'}
                    onEdit={() => abrirEdicao('email', instalacao.email || '')}
                    editable={isEditable}
                  />

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Telefone"
                      value={instalacao.telefone || 'Não informado'}
                      onEdit={() => abrirEdicao('telefone', instalacao.telefone || '')}
                      editable={isEditable}
                    />
                  </View>

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Celular"
                      value={instalacao.celular || 'Não informado'}
                      onEdit={() => abrirEdicao('celular', instalacao.celular || '')}
                      editable={isEditable}
                    />
                  </View>

                  {instalacao.celular2 && (
                    <View className="pt-2">
                      <InfoRow label="Celular 2" value={instalacao.celular2} />
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* ENDEREÇO RESIDENCIAL E Instalação */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
              <View className="flex-row items-center mb-4">
                <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="home-outline" size={20} color="#10b981" />
                </View>
                <Text className="text-base text-gray-900 font-bold flex-1">Endereço Residencial e Instalação</Text>
              </View>

              <View className="gap-3">
                <View className="bg-gray-50 rounded-xl p-3">
                  <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Localização</Text>

                  <EditableInfoRow
                    label="CEP"
                    value={instalacao.cep || 'Não informado'}
                    onEdit={() => abrirEdicao('cep', instalacao.cep || '')}
                    editable={isEditable}
                  />

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Endereço"
                      value={instalacao.endereco || 'Não informado'}
                      onEdit={() => abrirEdicao('endereco', instalacao.endereco || '')}
                      editable={isEditable}
                    />
                  </View>

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Número"
                      value={instalacao.numero || 'Não informado'}
                      onEdit={() => abrirEdicao('numero', instalacao.numero || '')}
                      editable={isEditable}
                    />
                  </View>

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Bairro"
                      value={instalacao.bairro || 'Não informado'}
                      onEdit={() => abrirEdicao('bairro', instalacao.bairro || '')}
                      editable={isEditable}
                    />
                  </View>

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Complemento"
                      value={instalacao.complemento || 'Não informado'}
                      onEdit={() => abrirEdicao('complemento', instalacao.complemento || '')}
                      editable={isEditable}
                    />
                  </View>

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Cidade"
                      value={instalacao.cidade || 'Não informado'}
                      onEdit={() => abrirEdicao('cidade', instalacao.cidade || '')}
                      editable={isEditable}
                    />
                  </View>

                  <View className="pt-2">
                    <EditableInfoRow
                      label="Estado"
                      value={instalacao.estado || 'Não informado'}
                      onEdit={() => abrirEdicao('estado', instalacao.estado || '')}
                      editable={isEditable}
                    />
                  </View>
                </View>

                {(instalacao.coordenadas || instalacao.dot_ref) && (
                  <View className="bg-gray-50 rounded-xl p-3">
                    <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Referências</Text>

                    {instalacao.coordenadas && (
                      <EditableInfoRow
                        label="Coordenadas GPS"
                        value={instalacao.coordenadas}
                        onEdit={() => abrirEdicao('coordenadas', instalacao.coordenadas || '')}
                        editable={isEditable}
                      />
                    )}

                    {instalacao.dot_ref && (
                      <View className={instalacao.coordenadas ? "pt-2" : ""}>
                        <InfoRow label="Ponto de Referência" value={instalacao.dot_ref} />
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* ENDEREÇO DE CORRESPONDÊNCIA */}
            {(instalacao.endereco_res || instalacao.cep_res || instalacao.bairro_res || instalacao.cidade_res) && (
              <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                <View className="flex-row items-center mb-4">
                  <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                    <Ionicons name="mail-outline" size={20} color="#f97316" />
                  </View>
                  <Text className="text-base text-gray-900 font-bold flex-1">Endereço de Correspondência</Text>
                </View>

                <View className="bg-gray-50 rounded-xl p-3">
                  {instalacao.cep_res && (
                    <EditableInfoRow
                      label="CEP"
                      value={instalacao.cep_res}
                      onEdit={() => abrirEdicao('cep_res', instalacao.cep_res || '')}
                      editable={isEditable}
                    />
                  )}

                  {instalacao.endereco_res && (
                    <View className={instalacao.cep_res ? "pt-2" : ""}>
                      <EditableInfoRow
                        label="Endereço"
                        value={instalacao.endereco_res}
                        onEdit={() => abrirEdicao('endereco_res', instalacao.endereco_res || '')}
                        editable={isEditable}
                      />
                    </View>
                  )}

                  {instalacao.numero_res && (
                    <View className="pt-2">
                      <EditableInfoRow
                        label="Número"
                        value={instalacao.numero_res}
                        onEdit={() => abrirEdicao('numero_res', instalacao.numero_res || '')}
                        editable={isEditable}
                      />
                    </View>
                  )}

                  {instalacao.bairro_res && (
                    <View className="pt-2">
                      <EditableInfoRow
                        label="Bairro"
                        value={instalacao.bairro_res}
                        onEdit={() => abrirEdicao('bairro_res', instalacao.bairro_res || '')}
                        editable={isEditable}
                      />
                    </View>
                  )}

                  {instalacao.complemento_res && (
                    <View className="pt-2">
                      <EditableInfoRow
                        label="Complemento"
                        value={instalacao.complemento_res}
                        onEdit={() => abrirEdicao('complemento_res', instalacao.complemento_res || '')}
                        editable={isEditable}
                      />
                    </View>
                  )}

                  {instalacao.cidade_res && (
                    <View className="pt-2">
                      <EditableInfoRow
                        label="Cidade"
                        value={instalacao.cidade_res}
                        onEdit={() => abrirEdicao('cidade_res', instalacao.cidade_res || '')}
                        editable={isEditable}
                      />
                    </View>
                  )}

                  {instalacao.estado_res && (
                    <View className="pt-2">
                      <EditableInfoRow
                        label="Estado"
                        value={instalacao.estado_res}
                        onEdit={() => abrirEdicao('estado_res', instalacao.estado_res || '')}
                        editable={isEditable}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* FINANCEIRO DO CLIENTE */}
            <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
              <View className="flex-row items-center mb-4">
                <View className="bg-amber-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                  <Ionicons name="wallet-outline" size={20} color="#f59e0b" />
                </View>
                <Text className="text-base text-gray-900 font-bold flex-1">Financeiro do Cliente</Text>
              </View>

              <View className="bg-gray-50 rounded-xl p-3">
                {instalacao.vendedor && (
                  <InfoRow label="Vendedor" value={instalacao.vendedor} />
                )}

                <View className={instalacao.vendedor ? "pt-2" : ""}>
                  <EditableInfoRow
                    label="Vencimento"
                    value={instalacao.vencimento || 'Não informado'}
                    onEdit={() => abrirEdicao('vencimento', instalacao.vencimento || '')}
                    editable={isEditable}
                  />
                </View>

                {instalacao.contrato && (
                  <View className="pt-2">
                    <InfoRow label="Contrato" value={instalacao.contrato} />
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modal de Edição de Texto */}
        <EditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          title={`Editar ${getFieldLabel()}`}
          value={editValue}
          onChange={setEditValue}
          onSave={salvarEdicao}
          placeholder={`Digite ${getFieldLabel().toLowerCase()}`}
          keyboardType={editField === 'email' ? 'email-address' : editField === 'telefone' || editField === 'celular' ? 'phone-pad' : 'default'}
          isPending={editaInstalacaoMutation.isPending}
          saveButtonColor="bg-purple-600"
        />
      </SafeAreaView>
    </>
  );
}