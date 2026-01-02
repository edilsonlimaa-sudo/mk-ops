import { ScrollView, Text, View } from 'react-native';
import { useClienteContext } from './ClienteContext';

export default function ObservacoesTab() {
  const { cliente } = useClienteContext();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Observações */}
        {cliente.obs && (
          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Observações
            </Text>
            <Text className="text-gray-700 text-sm">{cliente.obs}</Text>
          </View>
        )}

        {cliente.observacao && (
          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Observação Adicional
            </Text>
            <Text className="text-gray-700 text-sm">{cliente.observacao}</Text>
          </View>
        )}

        {cliente.rem_obs && (
          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Observação de Remessa
            </Text>
            <Text className="text-gray-700 text-sm">{cliente.rem_obs}</Text>
          </View>
        )}

        {/* Tags */}
        {cliente.tags && (
          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-2">
              Tags
            </Text>
            <Text className="text-gray-700 text-sm">{cliente.tags}</Text>
          </View>
        )}

        {/* Datas e Registro */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Datas e Registro
          </Text>
          
          {cliente.cadastro && <InfoRow label="Cadastrado em" value={cliente.cadastro} />}
          {cliente.last_update && <InfoRow label="Última Atualização" value={cliente.last_update} />}
          {cliente.data_ins && <InfoRow label="Data de Instalação" value={cliente.data_ins} />}
          {cliente.data_bloq && <InfoRow label="Data de Bloqueio" value={cliente.data_bloq} />}
          {cliente.data_desbloq && <InfoRow label="Data de Desbloqueio" value={cliente.data_desbloq} />}
          {cliente.data_desativacao && (
            <InfoRow label="Data de Desativação" value={cliente.data_desativacao} />
          )}
        </View>

        {/* Outros Controles */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Outros Controles
          </Text>
          
          {cliente.vendedor && <InfoRow label="Vendedor" value={cliente.vendedor} />}
          {cliente.tecnico && <InfoRow label="Técnico" value={cliente.tecnico} />}
          {cliente.grupo && <InfoRow label="Grupo" value={cliente.grupo} />}
          {cliente.codigo && <InfoRow label="Código" value={cliente.codigo} />}
          {cliente.termo && <InfoRow label="Termo" value={cliente.termo} />}
        </View>

        {/* IDs e UUIDs */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Identificadores
          </Text>
          
          <InfoRow label="ID" value={cliente.id} />
          <InfoRow label="UUID Cliente" value={cliente.uuid_cliente} />
          {cliente.uuid && <InfoRow label="UUID" value={cliente.uuid} />}
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
