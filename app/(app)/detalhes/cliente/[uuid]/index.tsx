import QuickActionModal from '@/components/instalacao/modals/QuickActionModal';
import { useClienteContext } from '@/lib/cliente/ClienteContext';
import { EditableInfoRow } from '@/lib/cliente/SharedComponents';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

function GeralTab() {
    const { cliente, refetch, isFetching } = useClienteContext();
    const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
    const [quickActionOptions, setQuickActionOptions] = useState<Array<{ label: string; value: string; icon: string; action: () => void }>>([]);
    const [quickActionModalTitle, setQuickActionModalTitle] = useState('');


    return (
        <ScrollView 
            className="flex-1 bg-gray-50" 
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={isFetching} onRefresh={refetch} />
            }
        >
            <View className="p-4">
                {/* AÇÕES RÁPIDAS */}
                <View className="flex-row mb-4 gap-2">
                    {/* Ligar */}
                    {(cliente.celular || cliente.fone || cliente.celular2) && (
                        <TouchableOpacity
                            onPress={() => {
                                const telefones = [
                                    cliente.celular && { label: 'Celular', numero: cliente.celular },
                                    cliente.fone && { label: 'Telefone', numero: cliente.fone },
                                    cliente.celular2 && { label: 'Celular 2', numero: cliente.celular2 },
                                ].filter(Boolean) as Array<{ label: string; numero: string }>;

                                if (telefones.length === 1) {
                                    const numeroLimpo = telefones[0].numero.replace(/\D/g, '');
                                    const url = `tel:${numeroLimpo}`;
                                    Linking.openURL(url).catch(() => {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Erro ao ligar',
                                            position: 'top',
                                            topOffset: 60,
                                        });
                                    });
                                } else {
                                    setQuickActionModalTitle('Selecionar Telefone');
                                    setQuickActionOptions(
                                        telefones.map(t => ({
                                            label: t.label,
                                            value: t.numero,
                                            icon: 'call',
                                            action: () => {
                                                const numeroLimpo = t.numero.replace(/\D/g, '');
                                                const url = `tel:${numeroLimpo}`;
                                                Linking.openURL(url).catch(() => {
                                                    Toast.show({
                                                        type: 'error',
                                                        text1: 'Erro ao ligar',
                                                        position: 'top',
                                                        topOffset: 60,
                                                    });
                                                });
                                                setQuickActionModalVisible(false);
                                            },
                                        }))
                                    );
                                    setQuickActionModalVisible(true);
                                }
                            }}
                            className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-green-100 active:scale-95"
                            style={{ transform: [{ scale: 1 }] }}
                        >
                            <View className="items-center">
                                <View className="bg-green-500 w-10 h-10 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="call" size={18} color="white" />
                                </View>
                                <Text className="text-green-700 font-bold text-xs">Ligar</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* WhatsApp */}
                    {(cliente.celular || cliente.fone || cliente.celular2) && (
                        <TouchableOpacity
                            onPress={() => {
                                const celulares = [
                                    cliente.celular && { label: 'Celular', numero: cliente.celular },
                                    cliente.fone && { label: 'Telefone', numero: cliente.fone },
                                    cliente.celular2 && { label: 'Celular 2', numero: cliente.celular2 },
                                ].filter(Boolean) as Array<{ label: string; numero: string }>;

                                if (celulares.length === 1) {
                                    const numeroLimpo = celulares[0].numero.replace(/\D/g, '');
                                    const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
                                    const url = `https://wa.me/${numeroCompleto}`;
                                    Linking.openURL(url).catch(() => {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Erro ao abrir WhatsApp',
                                            position: 'top',
                                            topOffset: 60,
                                        });
                                    });
                                } else {
                                    setQuickActionModalTitle('Selecionar Número para WhatsApp');
                                    setQuickActionOptions(
                                        celulares.map(c => ({
                                            label: c.label,
                                            value: c.numero,
                                            icon: 'logo-whatsapp',
                                            action: () => {
                                                const numeroLimpo = c.numero.replace(/\D/g, '');
                                                const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
                                                const url = `https://wa.me/${numeroCompleto}`;
                                                Linking.openURL(url).catch(() => {
                                                    Toast.show({
                                                        type: 'error',
                                                        text1: 'Erro ao abrir WhatsApp',
                                                        position: 'top',
                                                        topOffset: 60,
                                                    });
                                                });
                                                setQuickActionModalVisible(false);
                                            },
                                        }))
                                    );
                                    setQuickActionModalVisible(true);
                                }
                            }}
                            className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-emerald-100 active:scale-95"
                            style={{ transform: [{ scale: 1 }] }}
                        >
                            <View className="items-center">
                                <View className="bg-emerald-500 w-10 h-10 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="logo-whatsapp" size={18} color="white" />
                                </View>
                                <Text className="text-emerald-700 font-bold text-xs">WhatsApp</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {/* Navegar */}
                    {(cliente.coordenadas || cliente.endereco) && (
                        <TouchableOpacity
                            onPress={() => {
                                const temCoordenadas = cliente.coordenadas && cliente.coordenadas !== '-38.5748,-3.741162,0';
                                const temEndereco = cliente.endereco;

                                const navegarPorCoordenadas = () => {
                                    try {
                                        const parts = cliente.coordenadas!.split(',');
                                        if (parts.length < 2) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Coordenadas inválidas',
                                                position: 'top',
                                                topOffset: 60,
                                            });
                                            return;
                                        }

                                        const firstValue = parseFloat(parts[0]?.trim() || '');
                                        const secondValue = parseFloat(parts[1]?.trim() || '');

                                        if (isNaN(firstValue) || isNaN(secondValue)) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Coordenadas inválidas',
                                                position: 'top',
                                                topOffset: 60,
                                            });
                                            return;
                                        }

                                        const lat = Math.abs(firstValue) < Math.abs(secondValue) ? firstValue : secondValue;
                                        const lng = Math.abs(firstValue) < Math.abs(secondValue) ? secondValue : firstValue;

                                        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                                        Linking.openURL(url).catch(() => {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Erro ao abrir mapa',
                                                position: 'top',
                                                topOffset: 60,
                                            });
                                        });
                                    } catch (error) {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Erro ao abrir mapa',
                                            position: 'top',
                                            topOffset: 60,
                                        });
                                    }
                                };

                                const navegarPorEndereco = () => {
                                    const enderecoCompleto = [
                                        cliente.endereco,
                                        cliente.numero,
                                        cliente.bairro,
                                        cliente.cidade,
                                        cliente.estado,
                                    ]
                                        .filter(Boolean)
                                        .join(', ');

                                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
                                    Linking.openURL(url).catch(() => {
                                        Toast.show({
                                            type: 'error',
                                            text1: 'Erro ao abrir mapa',
                                            position: 'top',
                                            topOffset: 60,
                                        });
                                    });
                                };

                                if (temCoordenadas && temEndereco) {
                                    setQuickActionModalTitle('Navegar para');
                                    setQuickActionOptions([
                                        {
                                            label: 'Por Coordenadas GPS',
                                            value: cliente.coordenadas || '',
                                            icon: 'navigate',
                                            action: () => {
                                                navegarPorCoordenadas();
                                                setQuickActionModalVisible(false);
                                            },
                                        },
                                        {
                                            label: 'Por Endereço',
                                            value: [cliente.endereco, cliente.numero, cliente.bairro].filter(Boolean).join(', '),
                                            icon: 'location',
                                            action: () => {
                                                navegarPorEndereco();
                                                setQuickActionModalVisible(false);
                                            },
                                        },
                                    ]);
                                    setQuickActionModalVisible(true);
                                } else if (temCoordenadas) {
                                    navegarPorCoordenadas();
                                } else if (temEndereco) {
                                    navegarPorEndereco();
                                }
                            }}
                            className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-purple-100 active:scale-95"
                            style={{ transform: [{ scale: 1 }] }}
                        >
                            <View className="items-center">
                                <View className="bg-purple-500 w-10 h-10 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="navigate" size={18} color="white" />
                                </View>
                                <Text className="text-purple-700 font-bold text-xs">Navegar</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Informações Básicas */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Ionicons name="person-outline" size={20} color="#3b82f6" />
                        </View>
                        <Text className="text-base text-gray-900 font-bold flex-1">Informações Básicas</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3">
                        <EditableInfoRow label="Nome" value={cliente.nome} field="nome" editable={false} />
                        {cliente.cpf_cnpj && <EditableInfoRow label="CPF/CNPJ" value={cliente.cpf_cnpj} field="cpf_cnpj" editable={false} />}
                        {cliente.rg && <EditableInfoRow label="RG" value={cliente.rg} field="rg" editable={false} />}
                        {cliente.nascimento && <EditableInfoRow label="Nascimento" value={cliente.nascimento} field="nascimento" editable={false} />}
                        {cliente.estado_civil && <EditableInfoRow label="Estado Civil" value={cliente.estado_civil} field="estado_civil" editable={false} />}
                        {cliente.cadastro && <EditableInfoRow label="Cadastrado em" value={cliente.cadastro} field="cadastro" editable={false} />}
                    </View>
                </View>

                {/* Contato */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Ionicons name="call-outline" size={20} color="#9333ea" />
                        </View>
                        <Text className="text-base text-gray-900 font-bold flex-1">Contato</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3">
                        {cliente.celular && <EditableInfoRow label="Celular" value={cliente.celular} field="celular" />}
                        {cliente.fone && <EditableInfoRow label="Telefone" value={cliente.fone} field="fone" />}
                        {cliente.email && <EditableInfoRow label="Email" value={cliente.email} field="email" />}
                    </View>
                </View>

                {/* Plano e Status */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-indigo-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Ionicons name="wifi-outline" size={20} color="#6366f1" />
                        </View>
                        <Text className="text-base text-gray-900 font-bold flex-1">Plano e Status</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3">
                        {cliente.plano && <EditableInfoRow label="Plano" value={cliente.plano} field="plano" editable={false} />}
                        {cliente.venc && <EditableInfoRow label="Vencimento" value={cliente.venc} field="venc" editable={false} />}
                        {cliente.contrato && <EditableInfoRow label="Contrato" value={cliente.contrato} field="contrato" editable={false} />}
                        <EditableInfoRow
                            label="Cliente Ativado"
                            value={cliente.cli_ativado === 's' ? 'Sim' : 'Não'}
                            field="cli_ativado"
                            editable={false}
                        />
                        <EditableInfoRow
                            label="Bloqueado"
                            value={cliente.bloqueado === 'sim' ? 'Sim' : 'Não'}
                            field="bloqueado"
                            editable={false}
                        />
                        {cliente.status_corte && (
                            <EditableInfoRow label="Status de Corte" value={cliente.status_corte} field="status_corte" editable={false} />
                        )}
                    </View>
                </View>

                {/* Conexão e Rede */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-cyan-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Ionicons name="wifi-outline" size={20} color="#06b6d4" />
                        </View>
                        <Text className="text-base text-gray-900 font-bold flex-1">Conexão e Rede</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3">
                        {cliente.login && <EditableInfoRow label="Login" value={cliente.login} field="login" editable={false} />}
                        {cliente.senha && <EditableInfoRow label="Senha" value={cliente.senha} field="senha" editable={false} />}
                        {cliente.tipo && <EditableInfoRow label="Tipo" value={cliente.tipo} field="tipo" editable={false} />}
                        {cliente.ip && <EditableInfoRow label="IP" value={cliente.ip} field="ip" editable={false} />}
                        {cliente.mac && <EditableInfoRow label="MAC" value={cliente.mac} field="mac" editable={false} />}
                        {cliente.pool_name && <EditableInfoRow label="Pool" value={cliente.pool_name} field="pool_name" editable={false} />}
                        {cliente.simultaneo && <EditableInfoRow label="Simultâneo" value={cliente.simultaneo} field="simultaneo" editable={false} />}
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
                            <EditableInfoRow label="Equipamento" value={cliente.equipamento} field="equipamento" editable={false} />
                        )}
                        {cliente.onu_ont && <EditableInfoRow label="ONU/ONT" value={cliente.onu_ont} field="onu_ont" editable={false} />}
                        {cliente.armario_olt && <EditableInfoRow label="Armário OLT" value={cliente.armario_olt} field="armario_olt" editable={false} />}
                        {cliente.porta_olt && <EditableInfoRow label="Porta OLT" value={cliente.porta_olt} field="porta_olt" editable={false} />}
                        {cliente.porta_splitter && <EditableInfoRow label="Porta Splitter" value={cliente.porta_splitter} field="porta_splitter" editable={false} />}
                        {cliente.switch && cliente.switch !== 'nenhum' && (
                            <EditableInfoRow label="Switch" value={cliente.switch} field="switch" editable={false} />
                        )}
                        {cliente.caixa_herm && <EditableInfoRow label="CTO/Caixa Hermética" value={cliente.caixa_herm} field="caixa_herm" />}
                        {cliente.comodato && cliente.comodato !== 'nao' && (
                            <EditableInfoRow label="Comodato" value={cliente.comodato} field="comodato" editable={false} />
                        )}
                    </View>
                </View>
            </View>

            {/* Modal de Seleção de Quick Actions */}
            <QuickActionModal
                visible={quickActionModalVisible}
                title={quickActionModalTitle}
                options={quickActionOptions}
                onClose={() => setQuickActionModalVisible(false)}
            />
        </ScrollView>
    );
}

GeralTab.displayName = 'GeralTab';
export default GeralTab;


