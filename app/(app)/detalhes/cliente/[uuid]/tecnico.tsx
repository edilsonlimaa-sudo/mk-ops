import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useClienteContext } from './ClienteContext';
import { EditableInfoRow } from './SharedComponents';

function TecnicoTab() {
  const { cliente } = useClienteContext();

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Conexão e Rede */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="bg-cyan-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="wifi-outline" size={20} color="#06b6d4" />
            </View>
            <Text className="text-base text-gray-900 font-bold flex-1">Conexão e Rede</Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            {cliente.tipo && <EditableInfoRow label="Tipo" value={cliente.tipo} field="tipo" />}
            {cliente.ip && <EditableInfoRow label="IP" value={cliente.ip} field="ip" />}
            {cliente.mac && <EditableInfoRow label="MAC" value={cliente.mac} field="mac" />}
            {cliente.pool_name && <EditableInfoRow label="Pool" value={cliente.pool_name} field="pool_name" />}
            {cliente.simultaneo && <EditableInfoRow label="Simultâneo" value={cliente.simultaneo} field="simultaneo" />}
          </View>
        </View>

        {/* Equipamentos */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="hardware-chip-outline" size={20} color="#f97316" />
            </View>
            <Text className="text-base text-gray-900 font-bold flex-1">Equipamentos</Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            {cliente.equipamento && cliente.equipamento !== 'nenhum' && (
              <EditableInfoRow label="Equipamento" value={cliente.equipamento} field="equipamento" />
            )}
            {cliente.onu_ont && <EditableInfoRow label="ONU/ONT" value={cliente.onu_ont} field="onu_ont" />}
            {cliente.porta_olt && <EditableInfoRow label="Porta OLT" value={cliente.porta_olt} field="porta_olt" />}
            {cliente.porta_splitter && <EditableInfoRow label="Porta Splitter" value={cliente.porta_splitter} field="porta_splitter" />}
            {cliente.switch && cliente.switch !== 'nenhum' && (
              <EditableInfoRow label="Switch" value={cliente.switch} field="switch" />
            )}
            {cliente.armario_olt && <EditableInfoRow label="Armário OLT" value={cliente.armario_olt} field="armario_olt" />}
            {cliente.caixa_herm && <EditableInfoRow label="Caixa Hermética" value={cliente.caixa_herm} field="caixa_herm" />}
            {cliente.comodato && cliente.comodato !== 'nao' && (
              <EditableInfoRow label="Comodato" value={cliente.comodato} field="comodato" editable={false} />
            )}
          </View>
        </View>

        {/* Autenticação */}
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
          <View className="flex-row items-center mb-4">
            <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Ionicons name="key-outline" size={20} color="#9333ea" />
            </View>
            <Text className="text-base text-gray-900 font-bold flex-1">Autenticação</Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            {cliente.login && <EditableInfoRow label="Login" value={cliente.login} field="login" />}
            {cliente.senha && <EditableInfoRow label="Senha" value={cliente.senha} field="senha" />}
            {cliente.altsenha && <EditableInfoRow label="Senha Alternativa" value={cliente.altsenha} field="altsenha" />}
          </View>
        </View>

        {/* Financeiro */}
        {(cliente.tit_abertos !== '0' || cliente.tit_vencidos !== '0') && (
          <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
            <View className="flex-row items-center mb-4">
              <View className="bg-amber-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="wallet-outline" size={20} color="#f59e0b" />
              </View>
              <Text className="text-base text-gray-900 font-bold flex-1">Status Financeiro</Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-3">
              {cliente.tit_abertos !== '0' && (
                <EditableInfoRow label="Títulos em Aberto" value={cliente.tit_abertos} field="tit_abertos" editable={false} />
              )}
              {cliente.tit_vencidos !== '0' && (
                <EditableInfoRow label="Títulos Vencidos" value={cliente.tit_vencidos} field="tit_vencidos" editable={false} />
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

TecnicoTab.displayName = 'TecnicoTab';
export default TecnicoTab;
