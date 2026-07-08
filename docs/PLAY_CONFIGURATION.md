# Google Play Configuration Verification

**Date Verified:** 2026-07-08

## Application Details
- **Application Name:** FamilyCare TV
- **Android Package Name:** `com.familycaretv.app`
- **Version:** `1.0.0`
- **Version Code:** `1` (Explicitly set, managed via EAS `autoIncrement`)

## Android Configuration
- **Adaptive Icon:** Configured (`logo.png` over `#E6F4FE` background).
- **Splash Screen:** Configured (Centered logo).
- **Orientation:** Portrait (fixed).

## Permissions Verified
The application explicitly declares the following permissions to ensure compliance and avoid over-requesting (which triggers Play Store warnings):
- `INTERNET` (Required for API)
- `VIBRATE` (Required for Notifications)
- `RECEIVE_BOOT_COMPLETED` (Required for Notification Rescheduling)
- `SCHEDULE_EXACT_ALARM` & `USE_EXACT_ALARM` (Required for Reminder Engine)
- `WAKE_LOCK` (Required for background processing)
- *Note: FCM permissions are injected automatically by `expo-notifications`.*

## Deep Linking
Intent filters are properly configured for the `mobile` scheme to allow URL redirection and authentication flows.

**Status:** ✅ PASS
