import { Platform, Alert } from 'react-native';

// NOTE: expo-notifications was removed from Expo Go in SDK 53.
// To use real notifications, you must build a custom development client (EAS Build).
// We are mocking these functions so the app doesn't crash in Expo Go.

export async function requestNotificationPermissions() {
  console.log("Mock requestNotificationPermissions");
  return true; // Pretend we have permission in Expo Go
}

const dayMap: Record<string, number> = {
  'Sun': 1, 'Mon': 2, 'Tue': 3, 'Wed': 4, 'Thu': 5, 'Fri': 6, 'Sat': 7,
};

export async function scheduleMedicationNotifications(medicationId: string, name: string, daysOfWeek: string[], timesOfDay: string[]) {
  console.log(`Mock scheduling for ${name} on ${daysOfWeek.join(', ')} at ${timesOfDay.join(', ')}`);
  Alert.alert(
    "Development Build Required", 
    "Medication scheduling is saved! However, native push notifications require a custom Development Build (EAS) because Expo Go removed notification support in SDK 53."
  );
}
