# Known Bugs & Pending Issues (Post Milestone 2 Stabilization)

This document outlines the known issues, quirks, and pending enhancements after completing the stabilization phase for Milestone 2 of the FamilyCare TV platform.

## 1. Push Notifications in Expo Go
*   **Description**: Development builds running via the standard `Expo Go` client (SDK 53+) will not receive remote push notifications.
*   **Workaround/Status**: This is expected behavior from Expo. Full remote push notifications require building a standalone EAS Development Client or Production app (`eas build --profile development`). The internal in-app notification center works as intended.

## 2. Music Player Background Playback
*   **Description**: Background audio playback may get suspended by the OS (iOS/Android) after an extended period if the app is placed in the background without explicit background service permissions.
*   **Workaround/Status**: To be fully resolved in Milestone 3 by implementing `expo-av` background audio modes and updating `app.json` with the required OS background execution permissions.

## 3. Web Admin Dashboard Responsiveness
*   **Description**: The sidebar and some complex data tables on the Admin Dashboard can overlap on very small mobile screens (under 375px width).
*   **Workaround/Status**: Admin dashboard is primarily designed for tablet and desktop usage. A mobile-optimized layout adjustment is deferred.

## 4. Timezone Precision Edge Cases
*   **Description**: The new `expo-localization` timezone logic correctly pulls the device timezone, but if a user manually changes their device timezone while the app is actively open and running in memory, the cached timezone may not update until the app is restarted.
*   **Workaround/Status**: Refreshing the profile or restarting the app syncs the timezone. Minor edge case.

## 5. Referral Link Deep Linking
*   **Description**: Deep linking directly to the registration page with a pre-filled referral code (`myapp://register?ref=CODE`) is partially implemented but requires proper universal links configuration (Apple App-Site Association & Android Asset Links) for production domains.
*   **Workaround/Status**: Requires production domain provisioning before final sign-off.
