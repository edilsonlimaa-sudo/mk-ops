import { EditableInfoRow } from '@/components/ui/info-row';
import { InfoSection } from '@/components/ui/info-section';
import { ThemedView } from '@/components/ui/themed-view';
import { useTheme } from '@/contexts/ThemeContext';
import { useClienteContext } from '@/lib/cliente/ClienteContext';
import { RefreshControl, ScrollView, View } from 'react-native';

function ObservacoesTab() {
  const { cliente, openEditModal, refetch, isFetching } = useClienteContext();
  const { colors } = useTheme();

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
        {/* Observações */}
        {(cliente.obs || cliente.observacao || cliente.rem_obs) && (
          <InfoSection title="Observações" icon="document-text-outline" color="yellow" noContentWrapper>
            {cliente.obs && (
              <View className="rounded-xl p-3 mb-3" style={{ backgroundColor: colors.searchInputBackground }}>
                <EditableInfoRow 
                  label="Observações" 
                  value={cliente.obs} 
                  onEdit={() => openEditModal('obs', cliente.obs || '', 'Observações', true)}
                />
              </View>
            )}

            {cliente.observacao && (
              <View className="rounded-xl p-3 mb-3" style={{ backgroundColor: colors.searchInputBackground }}>
                <EditableInfoRow 
                  label="Observação Adicional" 
                  value={cliente.observacao} 
                  onEdit={() => openEditModal('observacao', cliente.observacao || '', 'Observação Adicional', true)}
                />
              </View>
            )}

            {cliente.rem_obs && (
              <View className="rounded-xl p-3" style={{ backgroundColor: colors.searchInputBackground }}>
                <EditableInfoRow 
                  label="Observação de Remessa" 
                  value={cliente.rem_obs} 
                  onEdit={() => openEditModal('rem_obs', cliente.rem_obs || '', 'Observação de Remessa', true)}
                />
              </View>
            )}
          </InfoSection>
        )}

        {/* Tags */}
        {cliente.tags && (
          <InfoSection title="Tags" icon="pricetag-outline" color="pink">
            <EditableInfoRow label="Tags" value={cliente.tags} onEdit={() => openEditModal('tags', cliente.tags || '', 'Tags', true)} />
          </InfoSection>
        )}

        {/* Datas e Registro */}
        <InfoSection title="Datas e Registro" icon="calendar-outline" color="blue">
          {cliente.cadastro && <EditableInfoRow label="Cadastrado em" value={cliente.cadastro} editable={false} />}
          {cliente.last_update && <EditableInfoRow label="Última Atualização" value={cliente.last_update} editable={false} />}
          {cliente.data_ins && <EditableInfoRow label="Data de Instalação" value={cliente.data_ins} onEdit={() => openEditModal('data_ins', cliente.data_ins || '', 'Data de Instalação')} />}
          {cliente.data_bloq && <EditableInfoRow label="Data de Bloqueio" value={cliente.data_bloq} editable={false} />}
          {cliente.data_desbloq && <EditableInfoRow label="Data de Desbloqueio" value={cliente.data_desbloq} editable={false} />}
          {cliente.data_desativacao && (
            <EditableInfoRow label="Data de Desativação" value={cliente.data_desativacao} editable={false} />
          )}
        </InfoSection>

        {/* Outros Controles */}
        <InfoSection title="Outros Controles" icon="settings-outline" color="teal">
          {cliente.vendedor && <EditableInfoRow label="Vendedor" value={cliente.vendedor} onEdit={() => openEditModal('vendedor', cliente.vendedor || '', 'Vendedor')} />}
          {cliente.tecnico && <EditableInfoRow label="Técnico" value={cliente.tecnico} onEdit={() => openEditModal('tecnico', cliente.tecnico || '', 'Técnico')} />}
          {cliente.grupo && <EditableInfoRow label="Grupo" value={cliente.grupo} onEdit={() => openEditModal('grupo', cliente.grupo || '', 'Grupo')} />}
          {cliente.codigo && <EditableInfoRow label="Código" value={cliente.codigo} onEdit={() => openEditModal('codigo', cliente.codigo || '', 'Código')} />}
          {cliente.termo && <EditableInfoRow label="Termo" value={cliente.termo} onEdit={() => openEditModal('termo', cliente.termo || '', 'Termo')} />}
        </InfoSection>

        {/* IDs e UUIDs */}
        <InfoSection title="Identificadores" icon="finger-print-outline" color="gray">
          <EditableInfoRow label="ID" value={cliente.id} editable={false} />
          <EditableInfoRow label="UUID Cliente" value={cliente.uuid_cliente} editable={false} />
          {cliente.uuid && <EditableInfoRow label="UUID" value={cliente.uuid} editable={false} />}
        </InfoSection>
      </View>
    </ScrollView>
    </ThemedView>
  );
}

ObservacoesTab.displayName = 'ObservacoesTab';
export default ObservacoesTab;
