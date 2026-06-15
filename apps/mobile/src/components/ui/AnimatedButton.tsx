import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radii } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { isDark } = useTheme();
  const theme = isDark ? Colors.dark : Colors.light;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.border;
    if (variant === 'primary') return theme.primary;
    if (variant === 'secondary') return theme.secondary;
    if (variant === 'danger') return theme.danger;
    if (variant === 'outline') return 'transparent';
    return theme.primary;
  };

  const getTextColor = () => {
    if (disabled) return theme.textSecondary;
    if (variant === 'outline') return theme.primary;
    return '#FFFFFF';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        disabled={disabled}
        style={[
          styles.button,
          { backgroundColor: getBackgroundColor() },
          variant === 'outline' && { borderWidth: 2, borderColor: theme.primary },
          style,
        ]}
      >
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: Radii.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
