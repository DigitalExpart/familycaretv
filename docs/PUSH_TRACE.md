# Push Notification Trace Pipeline

This document outlines the exact flow of push notifications from permission grant on the Android device to the final delivery receipt from Expo.

## Pipeline Trace

1. **Permission**
   - **Action**: App asks user for Android Notification permission.
   - **Status**: Displayed in frontend Diagnostics (`Granted` / `Denied`).

   ↓

2. **Token Generation**
   - **Action**: Expo Go/EAS queries FCM/APNs and generates an `ExponentPushToken[...]`.
   - **Status**: Displayed in frontend Diagnostics.

   ↓

3. **Backend Registration**
   - **Action**: Frontend uploads token to `PATCH /users/me/push-token`.
   - **Status**: Backend logs `[PUSH_TOKEN] Received push token registration` and saves it to the `User` record.
   - **Frontend Verification**: Diagnostics screen shows `Backend Token Uploaded: ✅ Yes`.

   ↓

4. **Event Trigger (Medication, Appointment, etc.)**
   - **Action**: User saves an event. Backend creates `Reminder` record.
   - **Cron**: Sweeps `PENDING` reminders every minute, generates `Notification` record.

   ↓

5. **Expo Push Delivery**
   - **Action**: `NotificationEngineService` passes the notification to `ExpoPushService.sendPushNotification()`.
   - **Validation**: Backend checks if the stored token is a valid Expo Push Token format.
   - **Submission**: Payload is chunked and sent to Expo Push API.

   ↓

6. **Expo Ticket**
   - **Action**: Expo API returns a Ticket ID.
   - **Meaning**: Expo accepted the push request and placed it in their internal queue to send to FCM (Google) or APNs (Apple).
   - **Status**: Logged in backend as `[PUSH_SEND] Ticket X: OK - ID: <ticket-id>`. (If an error occurs here, it means Expo rejected the payload format or credentials).

   ↓

7. **Expo Receipt**
   - **Action**: Backend queries `expo.getPushNotificationReceiptsAsync` using the Ticket ID.
   - **Meaning**: This is the final confirmation from FCM/APNs whether the device actually received it.
   - **Status**: Logged in backend as `[PUSH_SEND] Receipt <id>: DELIVERED SUCCESSFULLY` or `DELIVERY ERROR - <DeviceNotRegistered, etc>`.

   ↓

8. **Android Delivery**
   - **Action**: The Android System UI displays the notification.
   - **Status**: Handled entirely by the OS. App logic does not execute here.

## How to Debug the exact stage of failure

Use the new `GET /notifications/debug/push` endpoint to see exactly how far the push made it:

- If `hasToken` is false -> Failed between Step 2 and 3.
- If `lastPushSentAt` is null -> Failed at Step 4 (Cron job).
- If `lastExpoTicket` is null -> Failed at Step 5/6 (Expo rejected request).
- If `lastReceipt` has an error -> Failed at Step 7 (FCM rejected delivery).
- If `lastReceipt` is OK but nothing shows up -> Failed at Step 8 (Android system settings suppressing notification).
