import { CoordinatesMapModal } from '@/components/CoordinatesMapModal';
import { EditableInfoRow } from '@/components/ui/info-row';
import { InfoSection } from '@/components/ui/info-section';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useUpdateClient } from '@/hooks/cliente';
import { useClienteContext } from '@/lib/cliente/ClienteContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

function EnderecosTab() {
    const { cliente, openEditModal, refetch, isFetching } = useClienteContext();
    const { colors } = useTheme();
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
        <ThemedView variant="screen" className="flex-1">
        <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: colors.screenBackground }}
            refreshControl={
                <RefreshControl refreshing={isFetching} onRefresh={refetch} />
            }
        >
            <View className="p-4">
                {/* Endereço de Instalação */}
                <InfoSection title="Endereço de Instalação" icon="home-outline" color="green">
                    {cliente.endereco && (
                        <EditableInfoRow
                            label="Endereço"
                            value={cliente.endereco}
                            onEdit={() => openEditModal('endereco', cliente.endereco || '', 'Endereço')}
                        />
                    )}
                    {cliente.numero && <EditableInfoRow label="Número" value={cliente.numero} onEdit={() => openEditModal('numero', cliente.numero || '', 'Número')} />}
                    {cliente.complemento && <EditableInfoRow label="Complemento" value={cliente.complemento} onEdit={() => openEditModal('complemento', cliente.complemento || '', 'Complemento')} />}
                    {cliente.bairro && <EditableInfoRow label="Bairro" value={cliente.bairro} onEdit={() => openEditModal('bairro', cliente.bairro || '', 'Bairro')} />}
                    {cliente.cidade && <EditableInfoRow label="Cidade" value={cliente.cidade} onEdit={() => openEditModal('cidade', cliente.cidade || '', 'Cidade')} />}
                    {cliente.estado && <EditableInfoRow label="Estado" value={cliente.estado} onEdit={() => openEditModal('estado', cliente.estado || '', 'Estado')} />}
                    {cliente.cep && <EditableInfoRow label="CEP" value={cliente.cep} onEdit={() => openEditModal('cep', cliente.cep || '', 'CEP')} />}
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
                </InfoSection>

                {/* Endereço de Cobrança */}
                {(cliente.endereco_res || cliente.nome_res) && (
                    <InfoSection title="Endereço de Cobrança" icon="mail-outline" color="teal">
                        {cliente.nome_res && <EditableInfoRow label="Nome" value={cliente.nome_res} editable={false} />}
                        {cliente.endereco_res && (
                            <EditableInfoRow
                                label="Endereço"
                                value={cliente.endereco_res}
                                editable={false}
                            />
                        )}
                        {cliente.numero_res && <EditableInfoRow label="Número" value={cliente.numero_res} editable={false} />}
                        {cliente.complemento_res && <EditableInfoRow label="Complemento" value={cliente.complemento_res} editable={false} />}
                        {cliente.bairro_res && <EditableInfoRow label="Bairro" value={cliente.bairro_res} editable={false} />}
                        {cliente.cidade_res && <EditableInfoRow label="Cidade" value={cliente.cidade_res} editable={false} />}
                        {cliente.estado_res && <EditableInfoRow label="Estado" value={cliente.estado_res} editable={false} />}
                        {cliente.cep_res && <EditableInfoRow label="CEP" value={cliente.cep_res} editable={false} />}
                    </InfoSection>
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
        </ThemedView>
    );
}

EnderecosTab.displayName = 'EnderecosTab';
export default EnderecosTab;
