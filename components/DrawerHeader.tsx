import { ClientSearchModal } from '@/components/ClientSearchModal';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/stores/useUserStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

export function DrawerProfileButton() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const userName = useUserStore((state) => state.currentUser?.nome);

  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      className="w-9 h-9 rounded-full bg-blue-500 items-center justify-center active:opacity-70">
      <Text className="text-white text-sm font-bold">
        {initials}
      </Text>
    </Pressable>
  );
}

export function DrawerSearchButton() {
  const { colors } = useTheme();
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setSearchModalVisible(true)}
        className="w-9 h-9 items-center justify-center active:opacity-70">
        <Ionicons name="search" size={22} color={colors.headerText} />
      </Pressable>

      <ClientSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        initialSearchQuery=""
      />
    </>
  );
}

