import { ResetMacModal } from '@/components/cliente/ResetMacModal';
import QuickActionModal from '@/components/instalacao/modals/QuickActionModal';
import { EditableInfoRow } from '@/components/ui/info-row';
import { InfoSection } from '@/components/ui/info-section';
import { QuickActionButton } from '@/components/ui/quick-action-button';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useUpdateClient } from '@/hooks/cliente';
import { useClienteContext } from '@/lib/cliente/ClienteContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

function GeralTab() {
    const { cliente, openEditModal, refetch, isFetching } = useClienteContext();
    const { colors } = useTheme();
    const [quickActionModalVisible, setQuickActionModalVisible] = useState(false);
    const [quickActionOptions, setQuickActionOptions] = useState<Array<{ label: string; value: string; icon: string; action: () => void }>>([]);
    const [quickActionModalTitle, setQuickActionModalTitle] = useState('');
    const [resetMacModalVisible, setResetMacModalVisible] = useState(false);
    const updateClientMutation = useUpdateClient();

    // Handlers para Quick Actions
    const handleLigar = () => {
        const telefones = [
            cliente.celular && { label: 'Celular', numero: cliente.celular },
            cliente.fone && { label: 'Telefone', numero: cliente.fone },
            cliente.celular2 && { label: 'Celular 2', numero: cliente.celular2 },
        ].filter(Boolean) as Array<{ label: string; numero: string }>;

        if (telefones.length === 1) {
            const numeroLimpo = telefones[0].numero.replace(/\D/g, '');
            Linking.openURL(`tel:${numeroLimpo}`).catch(() => {
                Toast.show({ type: 'error', text1: 'Erro ao ligar', position: 'top', topOffset: 60 });
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
                        Linking.openURL(`tel:${numeroLimpo}`).catch(() => {
                            Toast.show({ type: 'error', text1: 'Erro ao ligar', position: 'top', topOffset: 60 });
                        });
                        setQuickActionModalVisible(false);
                    },
                }))
            );
            setQuickActionModalVisible(true);
        }
    };

    const handleWhatsApp = () => {
        const celulares = [
            cliente.celular && { label: 'Celular', numero: cliente.celular },
            cliente.fone && { label: 'Telefone', numero: cliente.fone },
            cliente.celular2 && { label: 'Celular 2', numero: cliente.celular2 },
        ].filter(Boolean) as Array<{ label: string; numero: string }>;

        if (celulares.length === 1) {
            const numeroLimpo = celulares[0].numero.replace(/\D/g, '');
            const numeroCompleto = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
            Linking.openURL(`https://wa.me/${numeroCompleto}`).catch(() => {
                Toast.show({ type: 'error', text1: 'Erro ao abrir WhatsApp', position: 'top', topOffset: 60 });
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
                        Linking.openURL(`https://wa.me/${numeroCompleto}`).catch(() => {
                            Toast.show({ type: 'error', text1: 'Erro ao abrir WhatsApp', position: 'top', topOffset: 60 });
                        });
                        setQuickActionModalVisible(false);
                    },
                }))
            );
            setQuickActionModalVisible(true);
        }
    };

    const handleNavegar = () => {
        const temCoordenadas = cliente.coordenadas && cliente.coordenadas !== '-38.5748,-3.741162,0';
        const temEndereco = cliente.endereco;

        const navegarPorCoordenadas = () => {
            try {
                const parts = cliente.coordenadas!.split(',');
                if (parts.length < 2) {
                    Toast.show({ type: 'error', text1: 'Coordenadas inválidas', position: 'top', topOffset: 60 });
                    return;
                }
                const firstValue = parseFloat(parts[0]?.trim() || '');
                const secondValue = parseFloat(parts[1]?.trim() || '');
                if (isNaN(firstValue) || isNaN(secondValue)) {
                    Toast.show({ type: 'error', text1: 'Coordenadas inválidas', position: 'top', topOffset: 60 });
                    return;
                }
                const lat = Math.abs(firstValue) < Math.abs(secondValue) ? firstValue : secondValue;
                const lng = Math.abs(firstValue) < Math.abs(secondValue) ? secondValue : firstValue;
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`).catch(() => {
                    Toast.show({ type: 'error', text1: 'Erro ao abrir mapa', position: 'top', topOffset: 60 });
                });
            } catch {
                Toast.show({ type: 'error', text1: 'Erro ao abrir mapa', position: 'top', topOffset: 60 });
            }
        };

        const navegarPorEndereco = () => {
            const enderecoCompleto = [cliente.endereco, cliente.numero, cliente.bairro, cliente.cidade, cliente.estado]
                .filter(Boolean)
                .join(', ');
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`).catch(() => {
                Toast.show({ type: 'error', text1: 'Erro ao abrir mapa', position: 'top', topOffset: 60 });
            });
        };

        if (temCoordenadas && temEndereco) {
            setQuickActionModalTitle('Navegar para');
            setQuickActionOptions([
                {
                    label: 'Por Coordenadas GPS',
                    value: cliente.coordenadas || '',
                    icon: 'navigate',
                    action: () => { navegarPorCoordenadas(); setQuickActionModalVisible(false); },
                },
                {
                    label: 'Por Endereço',
                    value: [cliente.endereco, cliente.numero, cliente.bairro].filter(Boolean).join(', '),
                    icon: 'location',
                    action: () => { navegarPorEndereco(); setQuickActionModalVisible(false); },
                },
            ]);
            setQuickActionModalVisible(true);
        } else if (temCoordenadas) {
            navegarPorCoordenadas();
        } else if (temEndereco) {
            navegarPorEndereco();
        }
    };

    const temTelefone = cliente.celular || cliente.fone || cliente.celular2;
    const temLocalizacao = cliente.coordenadas || cliente.endereco;


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
                {/* AÇÕES RÁPIDAS */}
                <View className="flex-row mb-4 gap-2">
                    {temTelefone && (
                        <QuickActionButton
                            icon="call"
                            label="Ligar"
                            color="green"
                            onPress={handleLigar}
                        />
                    )}
                    {temTelefone && (
                        <QuickActionButton
                            icon="logo-whatsapp"
                            label="WhatsApp"
                            color="emerald"
                            onPress={handleWhatsApp}
                        />
                    )}
                    {temLocalizacao && (
                        <QuickActionButton
                            icon="navigate"
                            label="Navegar"
                            color="purple"
                            onPress={handleNavegar}
                        />
                    )}
                </View>

                {/* Informações Básicas */}
                <InfoSection title="Informações Básicas" icon="person-outline" color="blue">
                    <EditableInfoRow label="Nome" value={cliente.nome} editable={false} />
                    {cliente.cpf_cnpj && <EditableInfoRow label="CPF/CNPJ" value={cliente.cpf_cnpj} editable={false} />}
                    {cliente.rg && <EditableInfoRow label="RG" value={cliente.rg} editable={false} />}
                    {cliente.nascimento && <EditableInfoRow label="Nascimento" value={cliente.nascimento} editable={false} />}
                    {cliente.estado_civil && <EditableInfoRow label="Estado Civil" value={cliente.estado_civil} editable={false} />}
                    {cliente.cadastro && <EditableInfoRow label="Cadastrado em" value={cliente.cadastro} editable={false} />}
                </InfoSection>

                {/* Contato */}
                <InfoSection title="Contato" icon="call-outline" color="purple">
                    {cliente.celular && <EditableInfoRow label="Celular" value={cliente.celular} onEdit={() => openEditModal('celular', cliente.celular || '', 'Celular')} />}
                    {cliente.fone && <EditableInfoRow label="Telefone" value={cliente.fone} onEdit={() => openEditModal('fone', cliente.fone || '', 'Telefone')} />}
                    {cliente.email && <EditableInfoRow label="Email" value={cliente.email} onEdit={() => openEditModal('email', cliente.email || '', 'Email')} />}
                </InfoSection>

                {/* Plano e Status */}
                <InfoSection title="Plano e Status" icon="wifi-outline" color="indigo">
                    {cliente.plano && <EditableInfoRow label="Plano" value={cliente.plano} editable={false} />}
                    {cliente.venc && <EditableInfoRow label="Vencimento" value={cliente.venc} editable={false} />}
                    {cliente.contrato && <EditableInfoRow label="Contrato" value={cliente.contrato} editable={false} />}
                    <EditableInfoRow
                        label="Cliente Ativado"
                        value={cliente.cli_ativado === 's' ? 'Sim' : 'Não'}
                        editable={false}
                    />
                    <EditableInfoRow
                        label="Bloqueado"
                        value={cliente.bloqueado === 'sim' ? 'Sim' : 'Não'}
                        editable={false}
                    />
                    {cliente.status_corte && (
                        <EditableInfoRow label="Status de Corte" value={cliente.status_corte} editable={false} />
                    )}
                </InfoSection>

                {/* Conexão e Rede */}
                <InfoSection title="Conexão e Rede" icon="wifi-outline" color="cyan">
                    {cliente.login && <EditableInfoRow label="Login" value={cliente.login} editable={false} />}
                    {cliente.senha && <EditableInfoRow label="Senha" value={cliente.senha} editable={false} />}
                    {cliente.tipo && <EditableInfoRow label="Tipo" value={cliente.tipo} editable={false} />}
                    {cliente.ip && <EditableInfoRow label="IP" value={cliente.ip} editable={false} />}
                    
                    {/* MAC Address - Card destacado com botão de Reset */}
                    <TouchableOpacity
                        onPress={() => cliente.mac && setResetMacModalVisible(true)}
                        disabled={!cliente.mac}
                        className="flex-row justify-between items-center py-3 px-3 -mx-3 rounded-lg bg-blue-50 border border-blue-100 active:bg-blue-100"
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="wifi" size={16} color="#3b82f6" />
                            <Text className="text-gray-600 text-sm font-medium">MAC Address</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            {cliente.mac ? (
                                <>
                                    <Text className="text-gray-900 text-sm font-medium font-mono">
                                        {cliente.mac}
                                    </Text>
                                    <Ionicons name="refresh" size={18} color="#3b82f6" />
                                </>
                            ) : (
                                <>
                                    <Text className="text-gray-500 text-sm italic">
                                        Não definido
                                    </Text>
                                    <Ionicons name="time-outline" size={18} color="#9ca3af" />
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                    
                    {cliente.pool_name && <EditableInfoRow label="Pool" value={cliente.pool_name} editable={false} />}
                    {cliente.simultaneo && <EditableInfoRow label="Simultâneo" value={cliente.simultaneo} editable={false} />}
                </InfoSection>

                {/* Equipamentos */}
                <InfoSection title="Equipamentos" icon="hardware-chip-outline" color="orange">
                    {cliente.equipamento && cliente.equipamento !== 'nenhum' && (
                        <EditableInfoRow label="Equipamento" value={cliente.equipamento} editable={false} />
                    )}
                    {cliente.onu_ont && <EditableInfoRow label="ONU/ONT" value={cliente.onu_ont} editable={false} />}
                    {cliente.armario_olt && <EditableInfoRow label="Armário OLT" value={cliente.armario_olt} editable={false} />}
                    {cliente.porta_olt && <EditableInfoRow label="Porta OLT" value={cliente.porta_olt} editable={false} />}
                    {cliente.porta_splitter && <EditableInfoRow label="Porta Splitter" value={cliente.porta_splitter} editable={false} />}
                    {cliente.switch && cliente.switch !== 'nenhum' && (
                        <EditableInfoRow label="Switch" value={cliente.switch} editable={false} />
                    )}
                    {cliente.caixa_herm && <EditableInfoRow label="CTO/Caixa Hermética" value={cliente.caixa_herm} onEdit={() => openEditModal('caixa_herm', cliente.caixa_herm || '', 'CTO/Caixa Hermética')} />}
                    {cliente.comodato && cliente.comodato !== 'nao' && (
                        <EditableInfoRow label="Comodato" value={cliente.comodato} editable={false} />
                    )}
                </InfoSection>
            </View>

            {/* Modal de Seleção de Quick Actions */}
            <QuickActionModal
                visible={quickActionModalVisible}
                title={quickActionModalTitle}
                options={quickActionOptions}
                onClose={() => setQuickActionModalVisible(false)}
            />

            {/* Modal de Reset MAC */}
            <ResetMacModal
                visible={resetMacModalVisible}
                onClose={() => setResetMacModalVisible(false)}
                clienteNome={cliente.nome}
                macAtual={cliente.mac}
                updateClientMutation={updateClientMutation}
                clienteUuid={cliente.uuid_cliente}
                onSuccess={() => {
                    // Apenas fecha o modal - usuário fará pull-to-refresh manual quando quiser
                }}
            />
        </ScrollView>
        </ThemedView>
    );
}

GeralTab.displayName = 'GeralTab';
export default GeralTab;


