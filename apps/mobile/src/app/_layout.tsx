import '../i18n';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '../hooks/useFonts';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const { user, isLoading: isAuthLoading, restoreSession } = useAuthStore();
  const { fontsLoaded, fontError } = useFonts();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      setTimeout(() => setIsSplashFinished(true), 2500); // 2.5s Splash
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (isAuthLoading || (!fontsLoaded && !fontError) || !isSplashFinished) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user) {
      const isRoot = segments.length === 0 || (segments.length === 1 && segments[0] === 'index');
      if (inAuthGroup || isRoot) {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [user, isAuthLoading, fontsLoaded, fontError, isSplashFinished, segments]);

  if (isAuthLoading || (!fontsLoaded && !fontError) || !isSplashFinished) {
    return (
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="index" /></Stack>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
