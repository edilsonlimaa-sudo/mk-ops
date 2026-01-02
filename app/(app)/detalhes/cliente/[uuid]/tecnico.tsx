import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useClienteContext } from './ClienteContext';

export default function TecnicoTab() {
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
            {cliente.tipo && <InfoRow label="Tipo" value={cliente.tipo} />}
            {cliente.ip && <InfoRow label="IP" value={cliente.ip} />}
            {cliente.mac && <InfoRow label="MAC" value={cliente.mac} />}
            {cliente.pool_name && <InfoRow label="Pool" value={cliente.pool_name} />}
            {cliente.simultaneo && <InfoRow label="Simultâneo" value={cliente.simultaneo} />}
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
              <InfoRow label="Equipamento" value={cliente.equipamento} />
            )}
            {cliente.onu_ont && <InfoRow label="ONU/ONT" value={cliente.onu_ont} />}
            {cliente.porta_olt && <InfoRow label="Porta OLT" value={cliente.porta_olt} />}
            {cliente.porta_splitter && <InfoRow label="Porta Splitter" value={cliente.porta_splitter} />}
            {cliente.switch && cliente.switch !== 'nenhum' && (
              <InfoRow label="Switch" value={cliente.switch} />
            )}
            {cliente.armario_olt && <InfoRow label="Armário OLT" value={cliente.armario_olt} />}
            {cliente.caixa_herm && <InfoRow label="Caixa Hermética" value={cliente.caixa_herm} />}
            {cliente.comodato && cliente.comodato !== 'nao' && (
              <InfoRow label="Comodato" value="Sim" />
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
            {cliente.login && <InfoRow label="Login" value={cliente.login} />}
            {cliente.senha && <InfoRow label="Senha" value={cliente.senha} />}
            {cliente.altsenha && <InfoRow label="Senha Alternativa" value={cliente.altsenha} />}
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
                <InfoRow label="Títulos em Aberto" value={cliente.tit_abertos} />
              )}
              {cliente.tit_vencidos !== '0' && (
                <InfoRow label="Títulos Vencidos" value={cliente.tit_vencidos} />
              )}
            </View>
          </View>
        )}
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
