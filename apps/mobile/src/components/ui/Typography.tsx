import React from 'react';
import { Text, TextProps, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: 'default' | 'secondary' | 'primary' | 'success' | 'danger' | 'accent';
  weight?: 'normal' | 'medium' | 'semiBold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({
  variant = 'body',
  color = 'default',
  weight = 'normal',
  align = 'auto',
  style,
  children,
  ...props
}: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  let fontColor = colors.text;
  if (color === 'secondary') fontColor = colors.textSecondary;
  if (color === 'primary') fontColor = colors.primary;
  if (color === 'success') fontColor = colors.success;
  if (color === 'danger') fontColor = colors.danger;
  if (color === 'accent') fontColor = colors.accent;

  return (
    <Text
      style={[
        styles[variant],
        { color: fontColor, textAlign: align },
        weight !== 'normal' && { fontFamily: Fonts[weight] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
