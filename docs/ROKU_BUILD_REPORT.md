# Roku Build Report & API Assumptions

This document outlines the API endpoint assumptions and data contracts used during the Roku MVP build. When sideloading and testing on a physical Roku device, ensure the backend API endpoints return the exact shapes outlined below, or update the BrightScript `ApiTask` component to accommodate any differences.

## Global Assumptions
- Responses are assumed to be returned as standard JSON arrays or objects directly (or unwrapped properly by the Roku ApiService).
- Authentication tokens are valid and passed in headers.

---

## 1. Patients Endpoint

**Endpoint:** `GET /roku/patients`

**Assumed Response:**
```json
[
  {
    "id": "uuid",
    "fullName": "John Smith",
    "dateOfBirth": "1945-01-01",
    "doctors": [],
    "medications": [],
    "notes": []
  }
]
```

---

## 2. Calendar Endpoint

**Endpoint:** `GET /events`

**Assumed Response:**
```json
[
  {
    "id": "uuid",
    "title": "Doctor Appointment",
    "type": "APPOINTMENT",
    "startDateTime": "2026-06-15T10:00:00Z"
  }
]
```

---

## 3. Audio / Music Endpoint

**Endpoint:** `GET /audio`

**Assumed Response:**
```json
[
  {
    "id": "uuid",
    "title": "Amazing Grace",
    "url": "https://cdn.familycaretv.com/audio/amazing-grace.mp3",
    "duration": 180
  }
]
```
**Notes:** URLs are assumed to be directly streamable by the Roku `Audio` node without complex DRM/auth tokens attached to the stream manifest itself.

---

## 4. Drawings / Kids Endpoint

**Endpoint:** `GET /drawings`

**Assumed Response:**
```json
[
  {
    "id": "uuid",
    "title": "My Family",
    "imageUrl": "https://cdn.familycaretv.com/drawings/image1.jpg"
  }
]
```

---

## 5. Subscription Endpoint

**Endpoint:** `GET /roku/subscription-status`

**Assumed Response:**
```json
{
  "status": "active",
  "trialEndsAt": "...",
  "currentPeriodEnd": "..."
}
```

---

## Hardware Testing Checklist
- [ ] Install ZIP file on Roku Developer Mode.
- [ ] Verify `ApiService` successfully logs in and retrieves a token.
- [ ] Verify Home Screen loads.
- [ ] Navigate to Patients; verify list renders properly.
- [ ] Navigate to Calendar; verify upcoming events load.
- [ ] Navigate to Music; verify `Audio` node starts playing the stream URL.
- [ ] Navigate to Kids; verify image posters render properly without failing on large payload sizes.
- [ ] Check localization strings (en_US).
- [ ] Trigger an API failure (e.g., disable network) and verify the `ErrorDialog` appears.

---

## Packaging Instructions

To deploy this MVP to a physical Roku device for testing:

1. Open a terminal or file explorer to the `roku/` directory.
2. Select all contents *inside* the `roku/` folder (do not just ZIP the top-level `roku` folder itself). The root of your ZIP file must contain `manifest`, `source/`, `components/`, `images/`, etc.
3. Compress these files into a file named `familycaretv-roku-mvp.zip`.
4. Enable Developer Mode on your physical Roku device (Home 3x, Up 2x, Right, Left, Right, Left, Right).
5. Open a web browser on your computer and navigate to the Roku's IP address.
6. Upload the `familycaretv-roku-mvp.zip` file and click **Install**.
