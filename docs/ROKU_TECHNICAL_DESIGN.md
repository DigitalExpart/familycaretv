# FamilyCare TV Roku Technical Design

## Objective
This document outlines the architecture for Phase R1: Roku Backend Foundation. It establishes the APIs and flows required for the future BrightScript client, focusing on Device Linking, Roku Pay, and Aggregate data endpoints.

## 1. Authentication Flow (Device Linking)
Roku devices lack traditional keyboards, making email/password login cumbersome. We will use a Device Linking (Shortcode) flow.

### Sequence
1. **Initiation**: The Roku App calls `POST /roku/device-code` (No Auth). The backend generates a random `deviceId` (UUID) and an 8-character, cryptographically secure `code`. It saves this to the `DeviceLink` table with an expiration of 15 minutes. (Rate limited to 10 requests/hour/IP).
2. **Display**: The Roku App displays the `code` to the user and begins polling `POST /roku/token` every 5 seconds. (Rate limited to 30 requests/minute/IP).
3. **Linking**: The User opens the mobile app, navigates to "Link TV", and submits the `code`. The mobile app calls `POST /roku/link-device` (Auth: JWT). The backend finds the `DeviceLink` and assigns the `userId`. (Rate limited to 5 requests/minute/IP).
4. **Completion**: On the next Roku poll to `POST /roku/token`, the backend sees the `userId` is populated, generates a standard long-lived Access Token (JWT) with the `{ device: "roku" }` payload, deletes the `DeviceLink` record, and returns the token to the Roku App.

## 2. API Contracts
All endpoints except `/device-code` and `/token` require a standard Bearer JWT Access Token.

### `GET /roku/dashboard`
Returns aggregated data for the Roku Home Screen.
**Response**:
```json
{
  "patients": [{ "id": "...", "name": "..." }],
  "events": [{ "title": "Doctor Appt", "startDateTime": "..." }],
  "reminders": [{ "title": "Take Tylenol" }],
  "verseOfTheDay": { "verse": "...", "reference": "..." },
  "drawingOfTheDay": { "imageUrl": "..." }
}
```

### `GET /roku/screensaver`
Returns low-bandwidth, ambient data.
**Response**:
```json
{
  "verse": { "text": "...", "reference": "..." },
  "drawingUrl": "...",
  "qrCodeUrl": "https://familycare.tv/download",
  "tickerMessages": ["Take Tylenol at 8:00 AM", "Doctor Appt Tomorrow"]
}
```

### `GET /roku/subscription-status`
Used by the Roku App to determine if it should block access.
**Response**:
```json
{
  "status": "active" | "trialing" | "expired",
  "trialEndsAt": "ISO8601"
}
```

## 3. Roku Pay Strategy
Currently, users subscribe via Stripe on the mobile app. The NestJS backend handles Stripe Webhooks. 
When the BrightScript application is built, it will integrate Roku Pay. A new webhook receiver (`POST /roku/webhook`) will be needed to parse Roku Pay push notifications and sync the User's `subscriptionStatus`.
*Note: This webhook will be implemented during Phase R4 when Roku Pay is actually integrated into BrightScript.*

## 4. Navigation Structure (BrightScript)
The Roku App will follow a standard SceneGraph navigation structure:
- **AuthScene**: Displays linking code and QR code.
- **HomeScene**: Displays `Patient Overview`, `Today's Events`, and `Reminders` using a `RowList`.
- **MusicScene**: Embedded Audio Player for Audio streaming.
- **KidsScene**: Fullscreen gallery of `Drawings`.
- **SettingsScene**: Unlink device, Subscription status.
- **Screensaver**: Ambient mode displaying the daily verse and drawings.
