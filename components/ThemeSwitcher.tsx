import { useTheme } from '@/contexts/ThemeContext';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * Componente de exemplo para trocar o tema.
 * Pode ser usado em uma tela de configurações.
 */
export function ThemeSwitcher() {
  const { mode, setMode, theme } = useTheme();

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
        Tema atual: {theme}
      </Text>
      
      <TouchableOpacity
        onPress={() => setMode('light')}
        style={{
          padding: 12,
          backgroundColor: mode === 'light' ? '#3b82f6' : '#e5e7eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: mode === 'light' ? '#fff' : '#000' }}>
          ☀️ Modo Claro
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode('dark')}
        style={{
          padding: 12,
          backgroundColor: mode === 'dark' ? '#3b82f6' : '#e5e7eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: mode === 'dark' ? '#fff' : '#000' }}>
          🌙 Modo Escuro
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode('auto')}
        style={{
          padding: 12,
          backgroundColor: mode === 'auto' ? '#3b82f6' : '#e5e7eb',
          borderRadius: 8,
        }}
      >
        <Text style={{ color: mode === 'auto' ? '#fff' : '#000' }}>
          🔄 Automático (Sistema)
        </Text>
      </TouchableOpacity>
    </View>
  );
}
