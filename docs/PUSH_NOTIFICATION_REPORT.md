# Push Notifications Report

## Status
- **Expo Registration**: Hooked up via `expo-notifications` in `usePushNotifications.ts`. Requests permissions natively and grabs the token.
- **Android Channels**: "default" channel configured with max importance, vibration, and lights.
- **Backend Sync**: `PATCH /users/me/push-token` successfully accepts tokens and adds them to `expoPushTokens` array.
- **Delivery Service**: `ExpoPushService` integrates `expo-server-sdk` and chunks notifications appropriately.

## Known Limitations (By Design)
1. **Expo Go Support**: As of Expo SDK 53, push notifications cannot be received in the Expo Go client. You must compile the app using EAS (Development Profile) to test them.
2. **Missing Token Logging**: In local test environments without a physical device, `Device.isDevice` check fails intentionally so that the simulator doesn't crash requesting a non-existent token.

See the `README.md` for full instructions on building and testing with EAS.
