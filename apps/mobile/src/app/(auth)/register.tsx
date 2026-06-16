import { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../api/client';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';
import { Colors } from '../../constants/theme';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleRegister = async () => {
    if (!consent) {
      Alert.alert('Privacy Policy', 'You must agree to the Privacy Policy to register.', [{ text: 'OK' }], { cancelable: true });
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords Mismatch', 'Your passwords do not match.', [{ text: 'OK' }], { cancelable: true });
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { 
        firstName, 
        lastName, 
        email, 
        phone, 
        gender, 
        password,
        consent
      });
      if (res.data.success) {
        await login(res.data.data.user, res.data.data.accessToken, res.data.data.refreshToken);
        router.replace('/(tabs)/dashboard');
      }
    } catch (e: any) {
      console.log('Registration Error:', e);
      let errorMsg = 'Please try again. Make sure the API is running.';
      if (e.response?.data?.message) {
        errorMsg = Array.isArray(e.response.data.message) 
          ? e.response.data.message.join(', ') 
          : e.response.data.message;
      } else if (e.message) {
        errorMsg = e.message;
      }
      Alert.alert('Registration Failed', errorMsg, [{ text: 'OK' }], { cancelable: true });
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
              Join FamilyCare TV
            </Typography>
            <Typography variant="body" color="secondary" align="center" style={styles.subtitle}>
              Track health, medications, appointments, and daily care.
            </Typography>
          </View>

          <Card style={styles.card}>
            <View style={styles.row}>
              <Input
                placeholder="First Name"
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Input
                placeholder="Last Name"
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
            <Input
              placeholder="name@example.com"
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              placeholder="Phone Number"
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Input
              placeholder="Gender (e.g. Male, Female)"
              label="Gender"
              value={gender}
              onChangeText={setGender}
            />
            <Input
              placeholder="Create a password"
              label="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
            <Input
              placeholder="Confirm your password"
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />
            
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setConsent(!consent)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, consent && styles.checkboxChecked]}>
                {consent && <Check size={14} color="#FFF" />}
              </View>
              <Typography variant="caption" color="secondary" style={styles.checkboxText}>
                I consent to the Privacy Policy and Terms of Service.
              </Typography>
            </TouchableOpacity>
            
            <Button 
              title="Create Account" 
              onPress={handleRegister} 
              isLoading={isLoading}
              style={styles.registerButton}
            />

            <Button 
              title="Already have an account? Sign In" 
              variant="ghost"
              onPress={() => router.push('/(auth)/login')} 
            />
          </Card>

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
    shadowColor: '#14B8A6',
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
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
  },
  checkboxText: {
    flex: 1,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 16,
  },
});
