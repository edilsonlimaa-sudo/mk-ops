import { EditModal } from '@/components/instalacao/EditModal';
import { EditableInfoRow, InfoRow } from '@/components/ui/info-row';
import { InfoSection } from '@/components/ui/info-section';
import { useTheme } from '@/contexts/ThemeContext';
import { useEditaInstalacao, useInstalacaoDetail } from '@/hooks/instalacao';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function ClienteInstalacaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, theme } = useTheme();
  const editaInstalacaoMutation = useEditaInstalacao();

  // Estados para modais de edição
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<
    | 'email'
    | 'telefone'
    | 'celular'
    | 'endereco'
    | 'numero'
    | 'complemento'
    | 'bairro'
    | 'cidade'
    | 'estado'
    | 'cep'
    | 'coordenadas'
    | 'vencimento'
    | 'endereco_res'
    | 'numero_res'
    | 'complemento_res'
    | 'bairro_res'
    | 'cidade_res'
    | 'estado_res'
    | 'cep_res'
    | 'cpf'
    | 'rg'
    | null
  >(null);
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
        onError: (err) => {
          Toast.show({
            type: 'error',
            text1: 'Erro ao salvar',
            text2: err instanceof Error ? err.message : 'Tente novamente',
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
      <View
        style={{ backgroundColor: colors.screenBackground }}
        className="flex-1 items-center justify-center"
      >
        <Text style={{ color: colors.cardTextSecondary }}>ID da instalação não fornecido</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        style={{ backgroundColor: colors.screenBackground }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.tabBarActiveTint} />
        <Text style={{ color: colors.cardTextSecondary }} className="mt-4">
          Carregando dados do cliente...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{ backgroundColor: colors.screenBackground }}
        className="flex-1 items-center justify-center p-4"
      >
        <Text className="text-red-600 text-lg font-semibold mb-2">Erro ao carregar dados</Text>
        <Text style={{ color: colors.cardTextSecondary }} className="text-center">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Text>
      </View>
    );
  }

  if (!instalacao) {
    return (
      <View
        style={{ backgroundColor: colors.screenBackground }}
        className="flex-1 items-center justify-center"
      >
        <Text style={{ color: colors.cardTextSecondary }}>Dados não encontrados</Text>
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
      .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  };

  return (
    <SafeAreaView
        style={{ backgroundColor: colors.screenBackground }}
        className="flex-1"
        edges={['bottom']}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-4">
            {/* HERO SECTION - Nome do Cliente */}
            <View
              style={{ backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }}
              className="rounded-2xl p-5 mb-4 shadow-sm border"
            >
              <View className="flex-row items-center mb-3">
                <View
                  style={{ backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                >
                  <Ionicons name="person" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text
                    style={{ color: colors.cardTextSecondary }}
                    className="text-xs font-semibold uppercase tracking-wide mb-1"
                  >
                    Cliente
                  </Text>
                  <Text
                    style={{ color: colors.cardTextPrimary }}
                    className="text-base font-bold"
                    numberOfLines={2}
                  >
                    {formatarNome(instalacao.nome)}
                  </Text>
                </View>
              </View>

              {instalacao.codigo && (
                <View
                  style={{ backgroundColor: colors.searchInputBackground }}
                  className="rounded-xl px-3 py-2 mt-2"
                >
                  <Text style={{ color: colors.cardTextSecondary }} className="text-xs font-medium">
                    Código do Cliente
                  </Text>
                  <Text
                    style={{ color: colors.cardTextPrimary }}
                    className="text-sm font-semibold mt-0.5"
                  >
                    #{instalacao.codigo}
                  </Text>
                </View>
              )}
            </View>

            {/* DADOS PESSOAIS */}
            <InfoSection title="Dados Pessoais" icon="id-card-outline" color="blue">
              {instalacao.cpf && (
                <EditableInfoRow
                  label="CPF"
                  value={instalacao.cpf}
                  onEdit={() => abrirEdicao('cpf', instalacao.cpf || '')}
                  editable={isEditable}
                />
              )}
              {instalacao.rg && (
                <EditableInfoRow
                  label="RG"
                  value={instalacao.rg}
                  onEdit={() => abrirEdicao('rg', instalacao.rg || '')}
                  editable={isEditable}
                />
              )}
              {instalacao.naturalidade && (
                <InfoRow label="Naturalidade" value={instalacao.naturalidade} />
              )}
              {instalacao.data_nasc && (
                <InfoRow
                  label="Data de Nascimento"
                  value={new Date(instalacao.data_nasc).toLocaleDateString('pt-BR')}
                />
              )}
            </InfoSection>

            {/* CONTATO */}
            <InfoSection title="Contato" icon="call-outline" color="cyan">
              <EditableInfoRow
                label="E-mail"
                value={instalacao.email || 'Não informado'}
                onEdit={() => abrirEdicao('email', instalacao.email || '')}
                editable={isEditable}
              />
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
              {instalacao.celular2 && <InfoRow label="Celular 2" value={instalacao.celular2} />}
            </InfoSection>

            {/* ENDEREÇO RESIDENCIAL E INSTALAÇÃO */}
            <InfoSection title="Endereço Residencial e Instalação" icon="home-outline" color="green">
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
              {instalacao.coordenadas && (
                <EditableInfoRow
                  label="Coordenadas GPS"
                  value={instalacao.coordenadas}
                  onEdit={() => abrirEdicao('coordenadas', instalacao.coordenadas || '')}
                  editable={isEditable}
                />
              )}
              {instalacao.dot_ref && (
                <InfoRow label="Ponto de Referência" value={instalacao.dot_ref} />
              )}
            </InfoSection>

            {/* ENDEREÇO DE CORRESPONDÊNCIA */}
            {(instalacao.endereco_res ||
              instalacao.cep_res ||
              instalacao.bairro_res ||
              instalacao.cidade_res) && (
              <InfoSection
                title="Endereço de Correspondência"
                icon="mail-outline"
                color="orange"
              >
                {instalacao.cep_res && (
                  <EditableInfoRow
                    label="CEP"
                    value={instalacao.cep_res}
                    onEdit={() => abrirEdicao('cep_res', instalacao.cep_res || '')}
                    editable={isEditable}
                  />
                )}
                {instalacao.endereco_res && (
                  <EditableInfoRow
                    label="Endereço"
                    value={instalacao.endereco_res}
                    onEdit={() => abrirEdicao('endereco_res', instalacao.endereco_res || '')}
                    editable={isEditable}
                  />
                )}
                {instalacao.numero_res && (
                  <EditableInfoRow
                    label="Número"
                    value={instalacao.numero_res}
                    onEdit={() => abrirEdicao('numero_res', instalacao.numero_res || '')}
                    editable={isEditable}
                  />
                )}
                {instalacao.bairro_res && (
                  <EditableInfoRow
                    label="Bairro"
                    value={instalacao.bairro_res}
                    onEdit={() => abrirEdicao('bairro_res', instalacao.bairro_res || '')}
                    editable={isEditable}
                  />
                )}
                {instalacao.complemento_res && (
                  <EditableInfoRow
                    label="Complemento"
                    value={instalacao.complemento_res}
                    onEdit={() => abrirEdicao('complemento_res', instalacao.complemento_res || '')}
                    editable={isEditable}
                  />
                )}
                {instalacao.cidade_res && (
                  <EditableInfoRow
                    label="Cidade"
                    value={instalacao.cidade_res}
                    onEdit={() => abrirEdicao('cidade_res', instalacao.cidade_res || '')}
                    editable={isEditable}
                  />
                )}
                {instalacao.estado_res && (
                  <EditableInfoRow
                    label="Estado"
                    value={instalacao.estado_res}
                    onEdit={() => abrirEdicao('estado_res', instalacao.estado_res || '')}
                    editable={isEditable}
                  />
                )}
              </InfoSection>
            )}

            {/* FINANCEIRO DO CLIENTE */}
            <InfoSection title="Financeiro do Cliente" icon="wallet-outline" color="yellow">
              {instalacao.vendedor && <InfoRow label="Vendedor" value={instalacao.vendedor} />}
              <EditableInfoRow
                label="Vencimento"
                value={instalacao.vencimento || 'Não informado'}
                onEdit={() => abrirEdicao('vencimento', instalacao.vencimento || '')}
                editable={isEditable}
              />
              {instalacao.contrato && <InfoRow label="Contrato" value={instalacao.contrato} />}
            </InfoSection>
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
          keyboardType={
            editField === 'email'
              ? 'email-address'
              : editField === 'telefone' || editField === 'celular'
                ? 'phone-pad'
                : 'default'
          }
          isPending={editaInstalacaoMutation.isPending}
          saveButtonColor="bg-blue-600"
        />
      </SafeAreaView>
  );
}