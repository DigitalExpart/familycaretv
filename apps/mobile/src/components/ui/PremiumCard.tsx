import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity } from 'react-native';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface PremiumCardProps extends ViewProps {
  onPress?: () => void;
  noPadding?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ 
  children, 
  style, 
  onPress,
  noPadding = false,
  ...props 
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const cardStyle = [
    styles.card,
    { 
      backgroundColor: theme.backgroundElement,
      shadowColor: isDark ? '#000' : '#64748B',
      padding: noPadding ? 0 : 20,
    },
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        style={cardStyle} 
        onPress={onPress}
        {...props as any}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
});
