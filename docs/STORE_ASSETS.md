# Google Play Store Assets Specifications

**Date:** 2026-07-08

## Application Icons

| Icon Type | File Name | Resolution | Status |
| :--- | :--- | :--- | :--- |
| **Base App Icon** | `icon.png` | 1024x1024 | ✅ Ready |
| **Android Foreground** | `android-icon-foreground.png` | 1080x1080 | ✅ Ready |
| **Android Background** | `android-icon-background.png` | 1080x1080 | ✅ Ready |
| **Android Monochrome** | `android-icon-monochrome.png` | 1080x1080 | ✅ Ready |
| **Notification Badge** | `expo-badge.png` | 96x96 (Alpha) | ✅ Ready |

## Splash Screen
The splash screen is automatically generated at build-time using Expo's standard implementation:
- **Logo:** `logo.png`
- **Background Color:** `#E6F4FE` (Wellness Blue Gradient/Tint)
- **Status:** ✅ Ready (Configured in `app.json`)

## Store Listing Graphics
The following graphics must be uploaded manually to the Google Play Console:

### 1. High-Res App Icon
- **Spec:** 512 x 512 pixels, 32-bit PNG.
- **Asset to use:** You can use `logo.png` resized to exactly 512x512.

### 2. Feature Graphic
- **Spec:** 1024 w x 500 h pixels, JPG or 24-bit PNG.
- **Requirement:** Must represent the "FamilyCare TV" brand without relying solely on text.
- **Asset:** *Requires generation by design team. Use placeholder if needed for internal testing.*

### 3. Phone Screenshots
- **Spec:** 16:9 or 9:16 aspect ratio. Min length 320px, max length 3840px.
- **Quantity:** 2 to 8 screenshots.
- **Required Views:**
  - Home Dashboard
  - Medication Reminders
  - Caregiver Connections
  - AI Assistant Interface

### 4. Tablet Screenshots (Optional but Recommended)
- **7-inch:** 2 to 8 screenshots.
- **10-inch:** 2 to 8 screenshots.

## Promotional Video (Optional)
- **URL:** YouTube URL.
- **Length:** 15-30 seconds recommended.
