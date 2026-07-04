import { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../api/client';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, TouchableOpacity } from 'react-native';
import * as Localization from 'expo-localization';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';
import { Colors } from '../../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const timezone = Localization.getCalendars()[0]?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await api.post('/auth/login', { email, password, timezone });
      if (res.data.success) {
        await login(res.data.data.user, res.data.data.accessToken, res.data.data.refreshToken);
        router.replace('/(tabs)/dashboard');
      }
    } catch (e: any) {
      console.log('Login Error:', e);
      let errorMsg = 'Please check your connection and ensure the API is running.';
      if (e.response?.data?.message) {
        errorMsg = Array.isArray(e.response.data.message) 
          ? e.response.data.message.join(', ') 
          : e.response.data.message;
      } else if (e.message) {
        errorMsg = e.message;
      }
      Alert.alert('Login Failed', errorMsg, [{ text: 'OK' }], { cancelable: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#EEF2FF', '#E0E7FF', '#C7D2FE']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../../assets/images/logo.png')} 
                style={{ width: 56, height: 56 }} 
                resizeMode="contain" 
              />
            </View>
            <Typography variant="h1" color="primary" align="center" style={styles.title}>
              FamilyCare TV
            </Typography>
            <Typography variant="body" color="secondary" align="center" style={styles.subtitle}>
              Care for your loved ones,{'\n'}all in one place.
            </Typography>
          </View>

          <Card style={styles.card}>
            <Input
              placeholder="name@example.com"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              placeholder="Enter your password"
              label="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
            
            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={() => Alert.alert('Reset Password', 'Password reset instructions will be sent to your email.', [{ text: 'OK' }], { cancelable: true })}
            >
              <Typography variant="caption" color="primary" weight="medium">
                Forgot Password?
              </Typography>
            </TouchableOpacity>
            <Button 
              title="Sign In" 
              onPress={handleLogin} 
              isLoading={isLoading}
              style={styles.signInButton}
            />

            <Button 
              title="Create Account" 
              variant="ghost"
              onPress={() => router.push('/(auth)/register')} 
            />
          </Card>

          <View style={styles.footer}>
            <Typography variant="caption" color="secondary" align="center">
              Secure • Private • Family Focused
            </Typography>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    padding: 32,
  },
  signInButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 16,
  },
  footer: {
    marginTop: 48,
    alignItems: 'center',
  }
});
