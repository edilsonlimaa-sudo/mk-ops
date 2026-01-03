import { CoordinatesMapModal } from '@/components/CoordinatesMapModal';
import { useUpdateClient } from '@/hooks/cliente';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useClienteContext } from './ClienteContext';
import { EditableInfoRow } from './SharedComponents';

function EnderecosTab() {
    const { cliente } = useClienteContext();
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const updateClientMutation = useUpdateClient();

    const handleSaveCoordinates = (coordinates: string) => {
        const payload = {
            uuid: cliente.uuid_cliente,
            coordenadas: coordinates,
        };

        updateClientMutation.mutate(payload, {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Coordenadas atualizadas! 📍',
                    position: 'top',
                    visibilityTime: 2000,
                    topOffset: 60,
                });
                setMapModalVisible(false);
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Erro ao salvar coordenadas',
                    text2: error instanceof Error ? error.message : 'Tente novamente',
                    position: 'top',
                    topOffset: 60,
                });
            },
        });
    };

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <View className="p-4">
                {/* Endereço de Instalação */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Ionicons name="home-outline" size={20} color="#10b981" />
                        </View>
                        <Text className="text-base text-gray-900 font-bold flex-1">Endereço de Instalação</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3">
                        {cliente.endereco && (
                            <EditableInfoRow
                                label="Endereço"
                                value={cliente.endereco}
                                field="endereco"
                            />
                        )}
                        {cliente.numero && <EditableInfoRow label="Número" value={cliente.numero} field="numero" />}
                        {cliente.complemento && <EditableInfoRow label="Complemento" value={cliente.complemento} field="complemento" />}
                        {cliente.bairro && <EditableInfoRow label="Bairro" value={cliente.bairro} field="bairro" />}
                        {cliente.cidade && <EditableInfoRow label="Cidade" value={cliente.cidade} field="cidade" />}
                        {cliente.estado && <EditableInfoRow label="Estado" value={cliente.estado} field="estado" />}
                        {cliente.cep && <EditableInfoRow label="CEP" value={cliente.cep} field="cep" />}
                        {cliente.coordenadas && cliente.coordenadas !== '-38.5748,-3.741162,0' && (
                            <TouchableOpacity
                                onPress={() => setMapModalVisible(true)}
                                className="flex-row justify-between items-center py-3 px-3 -mx-3 rounded-lg bg-blue-50 border border-blue-100 active:bg-blue-100"
                            >
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="location" size={16} color="#3b82f6" />
                                    <Text className="text-gray-600 text-sm font-medium">Localização</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-gray-900 text-sm font-medium">
                                        {cliente.coordenadas}
                                    </Text>
                                    <Ionicons name="map" size={18} color="#3b82f6" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Endereço de Cobrança */}
                {(cliente.endereco_res || cliente.nome_res) && (
                    <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-teal-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                                <Ionicons name="mail-outline" size={20} color="#14b8a6" />
                            </View>
                            <Text className="text-base text-gray-900 font-bold flex-1">Endereço de Cobrança</Text>
                        </View>

                        <View className="bg-gray-50 rounded-xl p-3">
                            {cliente.nome_res && <EditableInfoRow label="Nome" value={cliente.nome_res} field="nome_res" editable={false} />}
                            {cliente.endereco_res && (
                                <EditableInfoRow
                                    label="Endereço"
                                    value={cliente.endereco_res}
                                    field="endereco_res"
                                    editable={false}
                                />
                            )}
                            {cliente.numero_res && <EditableInfoRow label="Número" value={cliente.numero_res} field="numero_res" editable={false} />}
                            {cliente.complemento_res && <EditableInfoRow label="Complemento" value={cliente.complemento_res} field="complemento_res" editable={false} />}
                            {cliente.bairro_res && <EditableInfoRow label="Bairro" value={cliente.bairro_res} field="bairro_res" editable={false} />}
                            {cliente.cidade_res && <EditableInfoRow label="Cidade" value={cliente.cidade_res} field="cidade_res" editable={false} />}
                            {cliente.estado_res && <EditableInfoRow label="Estado" value={cliente.estado_res} field="estado_res" editable={false} />}
                            {cliente.cep_res && <EditableInfoRow label="CEP" value={cliente.cep_res} field="cep_res" editable={false} />}
                        </View>
                    </View>
                )}
            </View>

            <CoordinatesMapModal
                visible={mapModalVisible}
                onClose={() => setMapModalVisible(false)}
                onSave={handleSaveCoordinates}
                initialCoordinates={cliente.coordenadas}
                isSaving={updateClientMutation.isPending}
            />
        </ScrollView>
    );
}

EnderecosTab.displayName = 'EnderecosTab';
export default EnderecosTab;
