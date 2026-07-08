import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from '../api/client';
import { useRouter } from 'expo-router';

let Notifications: typeof NotificationsType | null = null;

try {
  Notifications = require('expo-notifications');
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.log('Failed to load expo-notifications (expected in Expo Go SDK 53+):', e);
}

// Stub for diagnostics to prevent errors from existing assignments
const _diagnostics: any = {};

function diagLog(msg: string) {
  if (__DEV__) {
    console.log(`[PUSH] ${msg}`);
  }
}

export function usePushNotifications(userId?: string) {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<NotificationsType.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  async function registerForPushNotificationsAsync() {
    let token;

    diagLog('=== PUSH REGISTRATION START ===');
    diagLog(`Platform: ${Platform.OS}`);
    diagLog(`Is physical device: ${Device.isDevice}`);
    diagLog(`Notifications module loaded: ${!!Notifications}`);

    if (!Notifications) {
      diagLog('ERROR: Notifications module is null - aborting registration');
      return undefined;
    }

    if (Platform.OS === 'android') {
      diagLog('Setting up Android notification channels...');
      const channels = [
        { id: 'default', name: 'Default', importance: Notifications.AndroidImportance.DEFAULT },
        { id: 'medication', name: 'Medication', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 250, 250, 250] },
        { id: 'appointments', name: 'Appointments', importance: Notifications.AndroidImportance.HIGH },
        { id: 'tasks', name: 'Tasks', importance: Notifications.AndroidImportance.DEFAULT },
        { id: 'kids', name: 'Kids', importance: Notifications.AndroidImportance.DEFAULT },
        { id: 'pets', name: 'Pets', importance: Notifications.AndroidImportance.DEFAULT },
        { id: 'bible', name: 'Bible', importance: Notifications.AndroidImportance.LOW },
        { id: 'emergency', name: 'Emergency', importance: Notifications.AndroidImportance.MAX, vibrationPattern: [0, 500, 500, 500] },
        { id: 'general', name: 'General', importance: Notifications.AndroidImportance.DEFAULT },
      ];

      for (const channel of channels) {
        Notifications.setNotificationChannelAsync(channel.id, {
          name: channel.name,
          importance: channel.importance,
          vibrationPattern: channel.vibrationPattern || [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      diagLog(`Android channels configured: ${channels.map(c => c.id).join(', ')}`);
    }

    if (Device.isDevice) {
      try {
        // Step 1: Check permissions
        diagLog('Checking notification permissions...');
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        diagLog(`Existing permission status: ${existingStatus}`);
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          diagLog('Requesting notification permissions...');
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          diagLog(`New permission status after request: ${finalStatus}`);
        }
        _diagnostics.permissionStatus = finalStatus;

        if (finalStatus !== 'granted') {
          diagLog(`ERROR: Permission NOT granted (status: ${finalStatus}) - aborting`);
          return;
        }
        diagLog('✅ Permission GRANTED');

        // Step 2: Get Expo Push Token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_PROJECT_ID;
        diagLog(`Project ID for token request: ${projectId || 'UNDEFINED/MISSING'}`);
        
        if (!projectId) {
          diagLog('⚠️ WARNING: projectId is undefined! Token request may fail.');
        }

        diagLog('Requesting Expo Push Token...');
        token = await Notifications.getExpoPushTokenAsync({
          projectId, 
        });
        diagLog(`✅ Expo Push Token received: ${token?.data || 'EMPTY'}`);
        _diagnostics.expoPushToken = token?.data || '';
      } catch (e: any) {
        diagLog(`❌ ERROR getting push token: ${e?.message || String(e)}`);
        diagLog(`Error stack: ${e?.stack || 'no stack'}`);
        _diagnostics.permissionStatus = 'error';
      }
    } else {
      diagLog('⚠️ Not a physical device - push notifications not available');
    }

    return token?.data;
  }

  useEffect(() => {
    if (!userId) {
      diagLog('No userId provided - skipping push registration');
      return;
    }

    diagLog(`Push registration triggered for userId: ${userId}`);

    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        diagLog(`Uploading token to backend: ${token}`);
        
        // Step 3: Send to backend
        try {
          const response = await api.patch('/users/me/push-token', { pushToken: token });
          const responseData = JSON.stringify(response.data);
          diagLog(`✅ Backend upload SUCCESS. Response: ${responseData}`);
          _diagnostics.tokenUploaded = true;
          _diagnostics.lastSyncTime = new Date().toISOString();
          _diagnostics.lastUploadResponse = responseData;
        } catch (uploadError: any) {
          const errMsg = uploadError?.response?.data 
            ? JSON.stringify(uploadError.response.data) 
            : uploadError?.message || String(uploadError);
          diagLog(`❌ Backend upload FAILED: ${errMsg}`);
          diagLog(`Upload error status: ${uploadError?.response?.status || 'no status'}`);
          _diagnostics.tokenUploaded = false;
          _diagnostics.lastUploadResponse = `ERROR: ${errMsg}`;
        }
      } else {
        diagLog('⚠️ No token generated - nothing to upload to backend');
      }
    });

    try {
      if (Notifications) {
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
          diagLog(`📩 PUSH RECEIVED: ${notification.request.content.title} - ${notification.request.content.body}`);
          setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          diagLog(`👆 PUSH TAPPED: ${response.notification.request.content.title}`);
          const data = response.notification.request.content.data;
          const type = data?.type || response.notification.request.content.title || '';
          
          if (typeof type !== 'string') return;
          const typeUpper = type.toUpperCase();

          if (typeUpper.includes('MEDICATION')) {
            router.push('/(tabs)/dashboard');
          } else if (typeUpper.includes('APPOINTMENT')) {
            router.push('/(tabs)/calendar');
          } else if (typeUpper.includes('TASK')) {
            router.push('/(tabs)/tasks');
          } else if (typeUpper.includes('HOMEWORK') || typeUpper.includes('KID')) {
            router.push('/(tabs)/kids');
          } else if (typeUpper.includes('PET')) {
            router.push('/(tabs)/pets');
          } else if (typeUpper.includes('BIBLE')) {
            router.push('/(tabs)/dashboard');
          } else {
            router.push('/(tabs)/notifications');
          }
        });
      }
    } catch (e) {
      diagLog(`Push notification listeners error: ${e}`);
    }

    return () => {
      try {
        if (Notifications) {
          if (notificationListener.current) {
            notificationListener.current.remove();
          }
          if (responseListener.current) {
            responseListener.current.remove();
          }
        }
      } catch (e) {
        // ignore
      }
    };
  }, [userId]);

  return { expoPushToken, notification };
}
