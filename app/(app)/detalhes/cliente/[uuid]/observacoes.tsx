import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useClienteContext } from './ClienteContext';

export default function ObservacoesTab() {
  const { cliente } = useClienteContext();

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Observações */}
        {(cliente.obs || cliente.observacao || cliente.rem_obs) && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
            <View className="flex-row items-center mb-4">
              <View className="bg-yellow-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="document-text-outline" size={20} color="#eab308" />
              </View>
              <Text className="text-base text-gray-900 font-bold flex-1">Observações</Text>
            </View>

            {cliente.obs && (
              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                  Observações
                </Text>
                <Text className="text-gray-700 text-sm">{cliente.obs}</Text>
              </View>
            )}

            {cliente.observacao && (
              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                  Observação Adicional
                </Text>
                <Text className="text-gray-700 text-sm">{cliente.observacao}</Text>
              </View>
            )}

            {cliente.rem_obs && (
              <View className="bg-gray-50 rounded-xl p-3">
                <Text className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                  Observação de Remessa
                </Text>
                <Text className="text-gray-700 text-sm">{cliente.rem_obs}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tags */}
        {cliente.tags && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
            <View className="flex-row items-center mb-4">
              <View className="bg-pink-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="pricetag-outline" size={20} color="#ec4899" />
              </View>
              <Text className="text-base text-gray-900 font-bold flex-1">Tags</Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-3">
              <Text className="text-gray-700 text-sm">{cliente.tags}</Text>
            </View>
          </View>
        )}

        {/* Datas e Registro */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            </View>
            <Text className="text-base text-gray-900 font-bold flex-1">Datas e Registro</Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            {cliente.cadastro && <InfoRow label="Cadastrado em" value={cliente.cadastro} />}
            {cliente.last_update && <InfoRow label="Última Atualização" value={cliente.last_update} />}
            {cliente.data_ins && <InfoRow label="Data de Instalação" value={cliente.data_ins} />}
            {cliente.data_bloq && <InfoRow label="Data de Bloqueio" value={cliente.data_bloq} />}
            {cliente.data_desbloq && <InfoRow label="Data de Desbloqueio" value={cliente.data_desbloq} />}
            {cliente.data_desativacao && (
              <InfoRow label="Data de Desativação" value={cliente.data_desativacao} />
            )}
          </View>
        </View>

        {/* Outros Controles */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="bg-teal-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="settings-outline" size={20} color="#14b8a6" />
            </View>
            <Text className="text-base text-gray-900 font-bold flex-1">Outros Controles</Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            {cliente.vendedor && <InfoRow label="Vendedor" value={cliente.vendedor} />}
            {cliente.tecnico && <InfoRow label="Técnico" value={cliente.tecnico} />}
            {cliente.grupo && <InfoRow label="Grupo" value={cliente.grupo} />}
            {cliente.codigo && <InfoRow label="Código" value={cliente.codigo} />}
            {cliente.termo && <InfoRow label="Termo" value={cliente.termo} />}
          </View>
        </View>

        {/* IDs e UUIDs */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="bg-gray-200 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="finger-print-outline" size={20} color="#6b7280" />
            </View>
            <Text className="text-base text-gray-900 font-bold flex-1">Identificadores</Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            <InfoRow label="ID" value={cliente.id} />
            <InfoRow label="UUID Cliente" value={cliente.uuid_cliente} />
            {cliente.uuid && <InfoRow label="UUID" value={cliente.uuid} />}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-gray-100">
      <Text className="text-gray-600 text-sm">{label}</Text>
      <Text className="text-gray-900 text-sm font-medium flex-1 text-right ml-4">
        {value}
      </Text>
    </View>
  );
}
