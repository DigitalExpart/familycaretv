import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  View,
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const API_BASE_URL = 'https://carefree-endurance-production-7621.up.railway.app';

export default function ConnectRokuScreen() {
  const [pairingCode, setPairingCode] = useState('');
  const [email, setEmail] = useState('demo@familycare.tv');
  const [password, setPassword] = useState('demo1234');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle Login to get Auth Token
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Logging in...');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const json = await response.json();

      if (response.ok && (json.accessToken || json.token)) {
        const userToken = json.accessToken || json.token;
        setToken(userToken);
        setStatusMessage('Login successful! Enter TV pairing code below.');
      } else {
        setStatusMessage(`Login failed: ${json.message || 'Invalid credentials'}`);
      }
    } catch (error: any) {
      setStatusMessage(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect Roku Device Code
  const handleConnectRoku = async () => {
    const cleanCode = pairingCode.trim().toUpperCase();
    if (cleanCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the code shown on your Roku TV screen (e.g. 83D4B3B6).');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Linking Roku TV to your account...');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/roku/link-device`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          code: cleanCode,
          deviceName: 'Living Room Roku TV'
        })
      });

      const json = await response.json();

      if (response.ok || json.success || json.linked) {
        setStatusMessage('SUCCESS! Roku TV connected! Check your TV screen.');
        Alert.alert('Roku Connected!', 'Your Roku TV has been activated successfully!');
      } else {
        setStatusMessage(`Linking error: ${json.message || JSON.stringify(json)}`);
      }
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.logoIcon}>📺</ThemedText>
          <ThemedText type="title" style={styles.title}>FamilyCare TV</ThemedText>
          <ThemedText style={styles.subtitle}>Connect Roku TV to your Family Account</ThemedText>
        </ThemedView>

        {/* Status Message */}
        {statusMessage ? (
          <ThemedView style={styles.statusCard}>
            <ThemedText style={styles.statusText}>{statusMessage}</ThemedText>
          </ThemedView>
        ) : null}

        {/* Pairing Code Card */}
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>Enter TV Code</ThemedText>
          <ThemedText style={styles.instructionText}>
            Look at your Roku TV screen and enter the code shown:
          </ThemedText>

          <TextInput
            style={styles.codeInput}
            placeholder="e.g. 83D4B3B6"
            placeholderTextColor="#8E8EA0"
            value={pairingCode}
            onChangeText={(text) => setPairingCode(text.toUpperCase())}
            maxLength={10}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleConnectRoku}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>Connect Roku TV</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>

        {/* Authentication Card (if login needed) */}
        {!token && (
          <ThemedView style={styles.cardSecondary}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>Account Authentication</ThemedText>
            <ThemedText style={styles.smallText}>Log in to link TV to your profile</ThemedText>

            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#8E8EA0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8E8EA0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.secondaryButton} onPress={handleLogin}>
              <ThemedText style={styles.secondaryButtonText}>Log In First</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    padding: 24,
    alignItems: 'center',
    gap: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: '#00A89D',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  statusCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00A89D',
  },
  statusText: {
    color: '#E2E8F0',
    fontSize: 14,
  },
  card: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardSecondary: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    marginBottom: 6,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  codeInput: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderColor: '#00A89D',
    borderWidth: 2,
    borderRadius: 12,
    color: '#00A89D',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    paddingVertical: 14,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    color: '#F8FAFC',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    width: '100%',
    backgroundColor: '#00A89D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    borderColor: '#00A89D',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  secondaryButtonText: {
    color: '#00A89D',
    fontSize: 15,
    fontWeight: '600',
  },
  smallText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 4,
  },
});
