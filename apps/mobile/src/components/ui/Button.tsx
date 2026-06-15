import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Colors, Radii } from '../../constants/theme';
import { Typography } from './Typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  isLoading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 1 };
      case 'secondary':
        return { backgroundColor: colors.secondary, borderColor: colors.secondary, borderWidth: 1 };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 };
      case 'ghost':
        return { backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0 };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return colors.text;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getContainerStyle(),
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Typography
          weight="semiBold"
          style={{ color: getTextColor() }}
        >
          {title}
        </Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: Radii.button,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 24,
  },
  disabled: {
    opacity: 0.6,
  },
});
