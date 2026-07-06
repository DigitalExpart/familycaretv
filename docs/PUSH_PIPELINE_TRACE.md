# Push Notification Pipeline Trace

## Pipeline Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     MOBILE APP (APK)                     │
│                                                          │
│  1. Check notification permission         [LOG: DIAG]    │
│  2. Request Expo Push Token (projectId)   [LOG: DIAG]    │
│  3. Upload token to backend               [LOG: DIAG]    │
│  4. Listen for incoming push notifications               │
└────────────────────┬─────────────────────────────────────┘
                     │ PATCH /users/me/push-token
                     ▼
┌──────────────────────────────────────────────────────────┐
│                   BACKEND (Railway)                       │
│                                                          │
│  4. Receive & validate Expo token         [LOG: SERVER]  │
│  5. Store token in User.expoPushTokens    [LOG: SERVER]  │
│  6. Notification Engine creates record    [LOG: SERVER]  │
│  7. ExpoPushService sends to Expo API     [LOG: SERVER]  │
│  8. Log Expo response + ticket IDs        [LOG: SERVER]  │
└────────────────────┬─────────────────────────────────────┘
                     │ expo-server-sdk → Expo Push API
                     ▼
┌──────────────────────────────────────────────────────────┐
│                   EXPO PUSH SERVICE                      │
│                                                          │
│  9. Expo routes to FCM (Firebase)                        │
│  10. FCM delivers to Android device                      │
└──────────────────────────────────────────────────────────┘
```

## Instrumentation Points

### Mobile App Logs (via `[PUSH_DIAG]` prefix)

| Step | What is logged | Expected Value |
|------|---------------|----------------|
| Permission check | `Existing permission status: granted` | `granted` |
| Token generation | `Expo Push Token received: ExponentPushToken[...]` | Non-empty token string |
| Backend upload | `Backend upload SUCCESS. Response: {...}` | `{ success: true }` |
| Push received | `PUSH RECEIVED: <title> - <body>` | Title + body of push |

### Backend Logs (via `[PUSH_TOKEN]` and `[PUSH_SEND]` prefixes)

| Step | What is logged | Expected Value |
|------|---------------|----------------|
| Token receipt | `Received push token registration request from user <id>` | Valid user ID |
| Token storage | `NEW token stored. Updated tokens: [...]` | Array with token |
| Push dispatch | `Sending push for notification <id>` | Valid notification ID |
| Token validation | `Token: ExponentPushToken[...] \| Valid: true` | `true` |
| Expo API response | `Expo API Response: [{"status":"ok","id":"..."}]` | Status `ok` with ticket ID |

### Debug Endpoint

```
POST /notifications/test-device
Authorization: Bearer <jwt>
Body: { "userId": "<optional-user-id>" }
```

**Response:**
```json
{
  "success": true,
  "targetUserId": "...",
  "storedTokens": ["ExponentPushToken[...]"],
  "validTokens": ["ExponentPushToken[...]"],
  "expoRequest": [{ "to": "...", "title": "...", "body": "..." }],
  "expoResponse": [{ "status": "ok", "id": "..." }],
  "ticketIds": ["..."],
  "errors": []
}
```

### Mobile Diagnostics Screen

Navigate to `/push-diagnostics` in the app to see:

- Permission status
- Generated Expo Push Token
- Whether the token was uploaded to the backend
- Last sync timestamp
- Last upload response
- Full diagnostic logs
- "Send Test Push" button (calls `/notifications/test-device`)

## How to Determine Failure Point

| Symptom | Failure Point | Fix |
|---------|--------------|-----|
| Permission status ≠ `granted` | Step 1 | User needs to grant permission in Android settings |
| Token is empty/missing | Step 2 | Check projectId, google-services.json, FCM config |
| Backend upload failed | Step 3 | Check API URL, auth token, network |
| No tokens in database | Step 5 | Backend isn't storing - check Railway logs |
| Expo API returns error | Step 7-8 | Token may be invalid or expired |
| Expo returns `ok` but no notification | Step 9-10 | FCM/Firebase issue, check google-services.json |

## Next Steps

1. Open the Push Diagnostics screen on the APK.
2. Check if a token was generated and uploaded.
3. Hit "Send Test Push" and observe the response.
4. Check Railway logs for `[PUSH_TOKEN]` and `[TEST_PUSH]` entries.
5. Document the exact failure point below.

---

## Trace Results

> **Status:** Awaiting test execution

_Fill in after running the diagnostics._
