import { useClienteContext } from '@/lib/cliente/ClienteContext';
import { EditableInfoRow } from '@/lib/cliente/SharedComponents';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';

function ObservacoesTab() {
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
                <EditableInfoRow 
                  label="Observações" 
                  value={cliente.obs} 
                  field="obs" 
                  multiline={true}
                />
              </View>
            )}

            {cliente.observacao && (
              <View className="bg-gray-50 rounded-xl p-3 mb-3">
                <EditableInfoRow 
                  label="Observação Adicional" 
                  value={cliente.observacao} 
                  field="observacao"
                  multiline={true}
                />
              </View>
            )}

            {cliente.rem_obs && (
              <View className="bg-gray-50 rounded-xl p-3">
                <EditableInfoRow 
                  label="Observação de Remessa" 
                  value={cliente.rem_obs} 
                  field="rem_obs"
                  multiline={true}
                />
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
              <EditableInfoRow label="Tags" value={cliente.tags} field="tags" multiline={true} />
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
            {cliente.cadastro && <EditableInfoRow label="Cadastrado em" value={cliente.cadastro} field="cadastro" editable={false} />}
            {cliente.last_update && <EditableInfoRow label="Última Atualização" value={cliente.last_update} field="last_update" editable={false} />}
            {cliente.data_ins && <EditableInfoRow label="Data de Instalação" value={cliente.data_ins} field="data_ins" />}
            {cliente.data_bloq && <EditableInfoRow label="Data de Bloqueio" value={cliente.data_bloq} field="data_bloq" editable={false} />}
            {cliente.data_desbloq && <EditableInfoRow label="Data de Desbloqueio" value={cliente.data_desbloq} field="data_desbloq" editable={false} />}
            {cliente.data_desativacao && (
              <EditableInfoRow label="Data de Desativação" value={cliente.data_desativacao} field="data_desativacao" editable={false} />
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
            {cliente.vendedor && <EditableInfoRow label="Vendedor" value={cliente.vendedor} field="vendedor" />}
            {cliente.tecnico && <EditableInfoRow label="Técnico" value={cliente.tecnico} field="tecnico" />}
            {cliente.grupo && <EditableInfoRow label="Grupo" value={cliente.grupo} field="grupo" />}
            {cliente.codigo && <EditableInfoRow label="Código" value={cliente.codigo} field="codigo" />}
            {cliente.termo && <EditableInfoRow label="Termo" value={cliente.termo} field="termo" />}
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
            <EditableInfoRow label="ID" value={cliente.id} field="id" editable={false} />
            <EditableInfoRow label="UUID Cliente" value={cliente.uuid_cliente} field="uuid_cliente" editable={false} />
            {cliente.uuid && <EditableInfoRow label="UUID" value={cliente.uuid} field="uuid" editable={false} />}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

ObservacoesTab.displayName = 'ObservacoesTab';
export default ObservacoesTab;
