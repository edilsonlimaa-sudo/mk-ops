import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export interface TodayFabRef {
  show: () => void;
  hide: () => void;
}

interface TodayFabProps {
  onPress: () => void;
}

export const TodayFab = forwardRef<TodayFabRef, TodayFabProps>(
  function TodayFab({ onPress }, ref) {
    const [visible, setVisible] = useState(false);

    useImperativeHandle(ref, () => ({
      show: () => setVisible(true),
      hide: () => setVisible(false),
    }));

    if (!visible) return null;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.fab}
      >
        <Ionicons name="today-outline" size={24} color="#ffffff" />
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});
