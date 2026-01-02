import { ScrollView, Text, View } from 'react-native';
import { useClienteContext } from './ClienteContext';

export default function TecnicoTab() {
  const { cliente } = useClienteContext();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Conexão e Rede */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Conexão e Rede
          </Text>
          
          {cliente.tipo && <InfoRow label="Tipo" value={cliente.tipo} />}
          {cliente.ip && <InfoRow label="IP" value={cliente.ip} />}
          {cliente.mac && <InfoRow label="MAC" value={cliente.mac} />}
          {cliente.pool_name && <InfoRow label="Pool" value={cliente.pool_name} />}
          {cliente.simultaneo && <InfoRow label="Simultâneo" value={cliente.simultaneo} />}
        </View>

        {/* Equipamentos */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Equipamentos
          </Text>
          
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

        {/* Localização */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Localização
          </Text>
          
          {cliente.coordenadas && cliente.coordenadas !== '-38.5748,-3.741162,0' && (
            <InfoRow label="Coordenadas GPS" value={cliente.coordenadas} />
          )}
        </View>

        {/* Autenticação */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Autenticação
          </Text>
          
          {cliente.login && <InfoRow label="Login" value={cliente.login} />}
          {cliente.senha && <InfoRow label="Senha" value={cliente.senha} />}
          {cliente.user_ip && <InfoRow label="Último IP" value={cliente.user_ip} />}
          {cliente.user_mac && <InfoRow label="Último MAC" value={cliente.user_mac} />}
        </View>

        {/* Financeiro */}
        {(cliente.tit_abertos !== '0' || cliente.tit_vencidos !== '0') && (
          <View className="bg-white rounded-lg p-4 mb-3">
            <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
              Status Financeiro
            </Text>
            
            {cliente.tit_abertos !== '0' && (
              <InfoRow label="Títulos em Aberto" value={cliente.tit_abertos} />
            )}
            {cliente.tit_vencidos !== '0' && (
              <InfoRow label="Títulos Vencidos" value={cliente.tit_vencidos} />
            )}
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
