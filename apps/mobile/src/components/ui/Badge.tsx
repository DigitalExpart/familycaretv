import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface BadgeProps {
  count: number;
  color?: string;
  size?: number;
}

export const Badge: React.FC<BadgeProps> = ({ count, color, size = 18 }) => {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;
  
  if (count <= 0) return null;

  return (
    <View style={[
      styles.badge, 
      { backgroundColor: color || theme.accent, minWidth: size, height: size, borderRadius: size / 2 }
    ]}>
      <Text style={[styles.text, { fontSize: size * 0.6 }]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'absolute',
    top: -4,
    right: -8,
    zIndex: 10,
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
