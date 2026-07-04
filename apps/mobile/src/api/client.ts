import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

const debuggerHost = Constants.expoConfig?.hostUri;
let localIp = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

// If running in Android emulator and the resolved IP is localhost loopback, we must use 10.0.2.2
if (Platform.OS === 'android' && (localIp === 'localhost' || localIp === '127.0.0.1')) {
  localIp = '10.0.2.2';
}

const LIVE_API_URL = 'https://carefree-endurance-production-7621.up.railway.app';
const defaultApiUrl = `http://${localIp}:3000`;

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || LIVE_API_URL,
});

// Automatically add token to headers
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically handle 401 responses and 403 plan limits
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Clear token if it's expired or invalid
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        
        // Force UI to log out immediately
        try {
          const { useAuthStore } = require('../store/auth.store');
          useAuthStore.getState().logout();
        } catch (e) {
          console.error('Failed to logout from store', e);
        }
      } else if (error.response.status === 403 && typeof error.response.data?.message === 'string') {
        // Handle plan limit reached or general forbidden
        Alert.alert(
          'Plan Limit Reached', 
          error.response.data.message + '\n\nPlease subscribe to a higher plan to add more.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Upgrade Plan', 
              onPress: () => {
                const { router } = require('expo-router');
                router.push('/profile');
              } 
            }
          ]
        );
      }
    }
    return Promise.reject(error);
  }
);
