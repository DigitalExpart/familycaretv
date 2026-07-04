import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import type * as NotificationsType from 'expo-notifications';
import Constants from 'expo-constants';
import { api } from '../api/client';

let Notifications: typeof NotificationsType | null = null;

try {
  Notifications = require('expo-notifications');
  if (Notifications) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch (e) {
  console.log('Failed to load expo-notifications (expected in Expo Go SDK 53+):', e);
}

export function usePushNotifications(userId?: string) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<NotificationsType.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<NotificationsType.Subscription>();
  const responseListener = useRef<NotificationsType.Subscription>();

  async function registerForPushNotificationsAsync() {
    let token;

    if (!Notifications) return undefined;

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return;
        }
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? process.env.EXPO_PUBLIC_PROJECT_ID;
        token = await Notifications.getExpoPushTokenAsync({
          projectId, 
        });
      } catch (e) {
        console.log('Push notifications not available (expected in Expo Go SDK 53+):', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token?.data;
  }

  useEffect(() => {
    if (!userId) return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // Send to backend
        api.patch('/users/me/push-token', { pushToken: token }).catch(console.error);
      }
    });

    try {
      if (Notifications) {
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
          console.log(response);
        });
      }
    } catch (e) {
      console.log('Push notification listeners not available:', e);
    }

    return () => {
      try {
        if (Notifications) {
          if (notificationListener.current) {
            Notifications.removeNotificationSubscription(notificationListener.current);
          }
          if (responseListener.current) {
            Notifications.removeNotificationSubscription(responseListener.current);
          }
        }
      } catch (e) {
        // ignore
      }
    };
  }, [userId]);

  return { expoPushToken, notification };
}
