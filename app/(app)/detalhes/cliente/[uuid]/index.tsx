import QuickActionModal from '@/components/instalacao/modals/QuickActionModal';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useClienteContext } from './ClienteContext';

export default function GeralTab() {
    const { cliente } = useClienteContext();
    const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
    const [quickActionOptions, setQuickActionOptions] = useState<Array<{ label: string; value: string; icon: string; action: () => void }>>([]);
    const [quickActionModalTitle, setQuickActionModalTitle] = useState('');


    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
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
                        <InfoRow label="Nome" value={cliente.nome} />
                        {cliente.cpf_cnpj && <InfoRow label="CPF/CNPJ" value={cliente.cpf_cnpj} />}
                        {cliente.rg && <InfoRow label="RG" value={cliente.rg} />}
                        {cliente.nascimento && <InfoRow label="Nascimento" value={cliente.nascimento} />}
                        {cliente.estado_civil && <InfoRow label="Estado Civil" value={cliente.estado_civil} />}
                        {cliente.cadastro && <InfoRow label="Cadastrado em" value={cliente.cadastro} />}
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
                        {cliente.celular && <InfoRow label="Celular" value={cliente.celular} />}
                        {cliente.fone && <InfoRow label="Telefone" value={cliente.fone} />}
                        {cliente.email && <InfoRow label="Email" value={cliente.email} />}
                    </View>
                </View>

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
                        {cliente.coordenadas && cliente.coordenadas !== '-38.5748,-3.741162,0' && (
                            <InfoRow label="Coordenadas GPS" value={cliente.coordenadas} />
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
                            {cliente.nome_res && <InfoRow label="Nome" value={cliente.nome_res} />}
                            {cliente.endereco_res && (
                                <InfoRow
                                    label="Endereço"
                                    value={`${cliente.endereco_res}${cliente.numero_res ? `, ${cliente.numero_res}` : ''}`}
                                />
                            )}
                            {cliente.complemento_res && <InfoRow label="Complemento" value={cliente.complemento_res} />}
                            {cliente.bairro_res && <InfoRow label="Bairro" value={cliente.bairro_res} />}
                            {cliente.cidade_res && cliente.estado_res && (
                                <InfoRow label="Cidade/Estado" value={`${cliente.cidade_res} - ${cliente.estado_res}`} />
                            )}
                            {cliente.cep_res && <InfoRow label="CEP" value={cliente.cep_res} />}
                        </View>
                    </View>
                )}

                {/* Plano e Serviços */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-indigo-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Ionicons name="wifi-outline" size={20} color="#6366f1" />
                        </View>
                        <Text className="text-base text-gray-900 font-bold flex-1">Plano e Serviços</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3">
                        {cliente.plano && <InfoRow label="Plano" value={cliente.plano} />}
                        {cliente.login && <InfoRow label="Login" value={cliente.login} />}
                        {cliente.senha && <InfoRow label="Senha" value={cliente.senha} />}
                        {cliente.venc && <InfoRow label="Vencimento" value={`Dia ${cliente.venc}`} />}
                        {cliente.contrato && <InfoRow label="Contrato" value={cliente.contrato} />}
                        {cliente.tipo && <InfoRow label="Tipo de Conexão" value={cliente.tipo.toUpperCase()} />}
                    </View>
                </View>

                {/* Status */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-md">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-amber-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                            <Ionicons name="shield-checkmark-outline" size={20} color="#f59e0b" />
                        </View>
                        <Text className="text-base text-gray-900 font-bold flex-1">Status</Text>
                    </View>

                    <View className="bg-gray-50 rounded-xl p-3">
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
