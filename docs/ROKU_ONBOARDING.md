# Roku TV Companion Onboarding & Device Management Guide

FamilyCare TV offers a seamless TV companion experience that connects directly with the mobile app and cloud platform.

---

## 📺 User Journey & Onboarding Flow

```text
Mobile App Dashboard
        ↓
    Settings
        ↓
📺 Connect Roku TV
        ↓
What Roku Offers & Install Instructions
        ↓
Enter 6-8 Digit Pairing Code (from Roku TV)
        ↓
Link Device (POST /roku/link-device)
        ↓
Connected! ✅ TV updates automatically
```

---

## 🛠️ Mobile App Companion Features

Inside **Profile / Settings -> 📺 Connect Roku TV**:

1. **What Roku Offers**:
   - Daily Reminders & Unified Tasks
   - Real-Time Medication Schedule Updates
   - Bible Verse of the Day
   - Book of the Day
   - Music & Caregiver Audio
   - Kids & Pets Care Schedules
   - Family Care Overview

2. **Step-by-Step Installation**:
   - Turn on Roku TV.
   - Open Roku Channel Store and search for **FamilyCare TV**.
   - Install the channel.

3. **Device Linking**:
   - Enter the 6-8 character alphanumeric code generated on the Roku TV screen.
   - Enter an optional custom device nickname (e.g., *Living Room TV*, *Master Bedroom TV*).
   - Tap **Link Device**.

4. **Connected Devices & Plan Limits**:
   - **Personal Plan**: Up to 1 connected Roku TV device (`1 / 1 Roku Devices`).
   - **Family Plan**: Up to 3 connected Roku TV devices (`2 / 3 Roku Devices`).
   - View device status, last active timestamp, and option to remote-unlink devices.

5. **Roku Platform Expectation Note**:
   - Explains that notifications display live on screen when FamilyCare TV is open on TV.
   - Notes Roku OS constraints preventing notification overlays on top of third-party apps like Netflix/YouTube when FamilyCare TV is closed.

---

## 🔌 API Endpoints Reference

### 1. Generate Pairing Code (Roku App)
```http
POST /roku/device-code
```
- **Response**: `{ deviceId, code, expiresAt }`

### 2. Poll for Token (Roku App)
```http
POST /roku/token
Body: { "code": "ABC123XY" }
```
- **Response**: `{ pending: false, accessToken, refreshToken }`

### 3. Link Device (Mobile App)
```http
POST /roku/link-device
Header: Authorization: Bearer <user_jwt>
Body: {
  "code": "ABC123XY",
  "deviceName": "Living Room TV",
  "deviceModel": "Roku Ultra",
  "appVersion": "1.0.0"
}
```

### 4. Fetch User Connected Devices (Mobile App)
```http
GET /roku/devices
Header: Authorization: Bearer <user_jwt>
```
- **Response**: List of user's linked devices + `planLimit` (`usedCount`, `maxLimit`, `planTier`).

### 5. Remove / Unlink Device (Mobile App & Admin)
```http
DELETE /roku/devices/:id
Header: Authorization: Bearer <user_jwt>
```

### 6. Admin Connected Devices (Admin CMS)
```http
GET /roku/admin/devices
Header: Authorization: Bearer <admin_jwt>
```

---

## 🔐 Plan Limit Rules

| Plan Tier | Allowed Roku Devices |
| :--- | :--- |
| **Personal** | 1 Device |
| **Family** | Up to 3 Devices |

If a user reaches their plan limit, the API returns a friendly `400 Bad Request` suggesting an upgrade to the Family Plan.
