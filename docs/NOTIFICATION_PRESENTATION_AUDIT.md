# Android Notification Presentation Audit

## Issue Description
Push notifications on Android devices were successfully delivered but presented silently, without a heads-up pop-on-screen banner, sound, or vibration. Notifications would appear immediately in the notification shade, but failed to draw the user's active attention over the foreground app or while the screen was locked.

## Root Cause Analysis
This problem stemmed from a combination of Android OS limitations and incomplete push payloads:

1. **Android Channel "Stickiness"**: 
   When an Android notification channel is created, its initial `importance` level is fixed. Even if the importance level is later changed in code, the Android OS retains the originally assigned importance until the app is uninstalled or the channel ID is changed. Channels like `bible` were created with `LOW` importance, and others with `DEFAULT` importance. Thus, notifications sent to these channels did not trigger sounds or banners.
2. **Missing `channelId` in Push Payload**:
   The backend Expo push payload was missing the `channelId` field. When a channel ID is omitted, Android falls back to a default system channel that is often unconfigured or set to low importance by default.
3. **Missing `priority` and `badge`**:
   The payload did not include `priority: 'high'` or `sound: 'default'`, which are critical for instructing the OS (and the push delivery network) that the notification warrants waking the screen and presenting a heads-up banner immediately.

## Fix Implementation

To resolve this issue without requiring users to uninstall and reinstall the application, we've implemented the following fixes across the stack:

### 1. Mobile App (Frontend)
- Updated `usePushNotifications.ts` to append `_v2` to all channel IDs (e.g., `medication_v2`). This forces the Android OS to treat them as entirely new channels and apply the requested `importance` levels.
- Ensured all required channels (`Medication`, `Appointments`, `Tasks`, `Kids`, `Pets`, `Bible`, `Emergency`, `General`) are created with either `AndroidImportance.HIGH` or `AndroidImportance.MAX`.
- Verified that the `Notifications.setNotificationHandler` configures `shouldShowBanner`, `shouldShowList`, `shouldPlaySound`, and `shouldSetBadge` to `true`.

### 2. Backend API
- Updated `expo-push.service.ts` to include `priority: 'high'`, `sound: 'default'`, and `badge: 1` in every push payload.
- Added logic to map the `notification.type` to its corresponding `_v2` `channelId` and include it in the push payload.
- Applied these same payload enhancements to the `sendDirectTestPush` debug functionality.

## Verification
With these changes, the backend now explicitly instructs Android which high-priority channel to use, and the device possesses those high-priority channels configured correctly, ensuring that notifications are presented with a heads-up banner, sound, and vibration.
