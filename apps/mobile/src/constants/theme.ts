/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1E293B', // Slate 800
    background: '#F8FAFC', // Slate 50
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#F1F5F9', // Slate 100
    textSecondary: '#64748B', // Slate 500
    primary: '#0D9488', // Calm Teal
    secondary: '#3B82F6', // Soft Blue
    accent: '#F43F5E', // Rose/Red
    border: '#E2E8F0', // Slate 200
    danger: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
    primary: '#14B8A6', // Lighter Teal
    secondary: '#60A5FA', // Lighter Blue
    accent: '#FB7185', // Lighter Rose
    border: '#334155',
    danger: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  default: {
    sans: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 8,
  input: 12,
  button: 16,
  card: 24,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
