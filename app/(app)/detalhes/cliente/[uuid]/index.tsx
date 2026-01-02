import { ScrollView, Text, View } from 'react-native';
import { useClienteContext } from './ClienteContext';

export default function GeralTab() {
  const { cliente } = useClienteContext();

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Informações Básicas */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Informações Básicas
          </Text>
          
          <InfoRow label="Nome" value={cliente.nome} />
          {cliente.cpf_cnpj && <InfoRow label="CPF/CNPJ" value={cliente.cpf_cnpj} />}
          {cliente.rg && <InfoRow label="RG" value={cliente.rg} />}
          {cliente.nascimento && <InfoRow label="Nascimento" value={cliente.nascimento} />}
          {cliente.estado_civil && <InfoRow label="Estado Civil" value={cliente.estado_civil} />}
          {cliente.cadastro && <InfoRow label="Cadastrado em" value={cliente.cadastro} />}
        </View>

        {/* Contato */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Contato
          </Text>
          
          {cliente.celular && <InfoRow label="Celular" value={cliente.celular} />}
          {cliente.fone && <InfoRow label="Telefone" value={cliente.fone} />}
          {cliente.email && <InfoRow label="Email" value={cliente.email} />}
        </View>

        {/* Endereço */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Endereço
          </Text>
          
          {cliente.endereco && (
            <InfoRow
              label="Endereço"
              value={`${cliente.endereco}${cliente.numero ? `, ${cliente.numero}` : ''}`}
            />
          )}
          {cliente.complemento && <InfoRow label="Complemento" value={cliente.complemento} />}
          {cliente.bairro && <InfoRow label="Bairro" value={cliente.bairro} />}
          {cliente.cidade && cliente.estado && (
            <InfoRow label="Cidade/Estado" value={`${cliente.cidade} - ${cliente.estado}`} />
          )}
          {cliente.cep && <InfoRow label="CEP" value={cliente.cep} />}
        </View>

        {/* Plano e Serviços */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Plano e Serviços
          </Text>
          
          {cliente.plano && <InfoRow label="Plano" value={cliente.plano} />}
          {cliente.login && <InfoRow label="Login" value={cliente.login} />}
          {cliente.senha && <InfoRow label="Senha" value={cliente.senha} />}
          {cliente.venc && <InfoRow label="Vencimento" value={`Dia ${cliente.venc}`} />}
          {cliente.contrato && <InfoRow label="Contrato" value={cliente.contrato} />}
          {cliente.tipo && <InfoRow label="Tipo de Conexão" value={cliente.tipo.toUpperCase()} />}
        </View>

        {/* Status */}
        <View className="bg-white rounded-lg p-4 mb-3">
          <Text className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Status
          </Text>
          
          <InfoRow 
            label="Cliente Ativado" 
            value={cliente.cli_ativado === 's' ? 'Sim' : 'Não'} 
          />
          <InfoRow 
            label="Bloqueado" 
            value={cliente.bloqueado === 'sim' ? 'Sim' : 'Não'} 
          />
          {cliente.status_corte && (
            <InfoRow label="Status de Corte" value={cliente.status_corte} />
          )}
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
