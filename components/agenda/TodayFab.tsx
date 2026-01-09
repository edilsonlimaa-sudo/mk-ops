import { forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

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
      show: () => setVisible((prev) => prev ? prev : true),
      hide: () => setVisible((prev) => prev ? false : prev),
    }));

    if (!visible) return null;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.fab}
      >
        <Text style={styles.text}>Hoje</Text>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
