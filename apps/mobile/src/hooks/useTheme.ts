import { create } from 'zustand';
import { useColorScheme } from 'react-native';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false, // Default to light mode or use system preference
  toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
  setTheme: (isDark: boolean) => set({ isDark }),
}));

export const useTheme = () => {
  const store = useThemeStore();
  const systemColorScheme = useColorScheme();
  
  // You can optionally sync with system preference here
  return {
    isDark: store.isDark,
    toggleTheme: store.toggleTheme,
    setTheme: store.setTheme
  };
};
