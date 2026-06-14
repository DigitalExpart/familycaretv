# FamilyCare TV Roku UI Specification

This document details the BrightScript UI/UX specifications for the FamilyCare TV Roku Channel. 

## 1. Authentication Flow (Device Linking)

**Purpose**: Seamlessly link a TV device to a user's existing mobile account without requiring an on-screen keyboard.

**API Endpoint**: 
- `POST /roku/device-code` (No Auth)
- `POST /roku/token` (Polling)

**Data Structure**:
```json
{
  "deviceId": "uuid",
  "code": "A1B2C3D4",
  "expiresAt": "2026-06-14T14:30:00Z"
}
```

**UI Layout**:
- **Background**: Soft gradient or branded background.
- **Center Canvas**:
  - Title: "Welcome to FamilyCare TV"
  - Subtitle: "Open your mobile app to link this TV."
  - Big Text: The 8-character `code` formatted clearly (e.g., `A1B2 - C3D4`).
  - QR Code: Rendered QR pointing to `https://familycare.tv/link`.
- **Footer**: "Code expires in 15 minutes."

**Navigation Flow**:
- Initial Launch -> Check for local `accessToken`.
- If missing/invalid -> Load Auth Scene.
- Starts polling `/token` every 5 seconds.
- Upon receiving token -> Save to registry -> Navigate to Home Screen.

**Localization Requirements**:
- All text strings (Title, Subtitle, Footer instructions) must be mapped to translation keys.

---

## 2. Home Screen

**Purpose**: Provide an immediate, high-level overview of the day for the entire family.

**API Endpoint**: `GET /roku/dashboard`

**Data Structure**:
```json
{
  "patients": [{ "id": "...", "fullName": "..." }],
  "events": [{ "title": "...", "startDateTime": "..." }],
  "verseOfTheDay": { "verse": "...", "reference": "..." }
}
```

**UI Layout**:
- **Left Sidebar**: Main navigation menu (Home, Patients, Calendar, Music, Kids, Settings).
- **Top Right**: Verse of the Day (styled as a daily quote card).
- **Center Grid/RowList**:
  - Row 1: "Today's Schedule" (Horizontal list of upcoming events/medications).
  - Row 2: "Family Members" (Horizontal list of patient profile avatars).

**Navigation Flow**:
- Default focus on the first item in "Today's Schedule".
- Left Arrow -> Sidebar.
- OK -> Drill down into Event details or Patient profile.

**Localization Requirements**:
- "Today's Schedule", "Family Members", Sidebar labels. Time formatting (12h/24h based on locale).

---

## 3. Patients Screen

**Purpose**: View detailed profiles and health data for a specific family member.

**API Endpoint**: `GET /patients/:id` (Assuming standard REST access via JWT)

**Data Structure**:
```json
{
  "id": "...",
  "fullName": "...",
  "medications": [...],
  "doctors": [...]
}
```

**UI Layout**:
- **Sidebar**: Minimized/Hidden.
- **Header**: Patient Avatar + Full Name.
- **Tab/Row Architecture**:
  - Row 1: Medications (Name, Dosage, Frequency).
  - Row 2: Doctors/Contacts (Name, Specialty).

**Navigation Flow**:
- Accessed from Home Screen (Row 2) or Sidebar.
- Back button returns to Home.

**Localization Requirements**:
- Section headers ("Medications", "Doctors", "Dosage").

---

## 4. Calendar Screen

**Purpose**: View the weekly or monthly schedule of appointments and medication reminders.

**API Endpoint**: `GET /events` (Filtered by date range)

**Data Structure**:
```json
[{
  "id": "...",
  "title": "Dr. Smith Visit",
  "startDateTime": "...",
  "type": "appointment"
}]
```

**UI Layout**:
- **View**: A vertical `MarkupGrid` representing days of the week, or a `RowList` grouped by Day (Today, Tomorrow, Wednesday, etc.).
- **Card**: Time, Title, Associated Patient Avatar.

**Navigation Flow**:
- Accessed via Sidebar.
- Scroll down to see future days.

**Localization Requirements**:
- Day names (Monday, Tuesday), relative days (Today, Tomorrow), Date formats (MM/DD vs DD/MM).

---

## 5. Music Screen

**Purpose**: Stream ambient or therapeutic audio (e.g., hymns, calming music).

**API Endpoint**: `GET /audio`

**Data Structure**:
```json
[{
  "id": "...",
  "title": "Amazing Grace",
  "url": "https://...",
  "duration": 180
}]
```

**UI Layout**:
- **Left/Center**: List of audio tracks or playlists.
- **Bottom Right**: Mini-player with current track title, progress bar, and Play/Pause icons.
- **Background**: Blurred album art or thematic imagery.

**Navigation Flow**:
- Accessed via Sidebar.
- OK -> Play/Pause. Left/Right -> Skip track.

**Localization Requirements**:
- "Now Playing", "Playlists", "Duration".

---

## 6. Kids Screen

**Purpose**: A curated, simplified gallery of family drawings and kid-friendly content.

**API Endpoint**: `GET /drawings`

**Data Structure**:
```json
[{
  "id": "...",
  "title": "My Family",
  "imageUrl": "https://..."
}]
```

**UI Layout**:
- **View**: Full-screen `MarkupGrid` of images.
- **Detail**: Clicking an image opens it in full-screen mode with the title overlay at the bottom.

**Navigation Flow**:
- Accessed via Sidebar.
- OK -> Fullscreen image view. Back -> Gallery grid.

**Localization Requirements**:
- "Kids Gallery", "Drawings".

---

## 7. Settings Screen

**Purpose**: Manage device linking, subscription status, and app preferences.

**API Endpoint**: `GET /roku/subscription-status`

**Data Structure**:
```json
{
  "status": "active",
  "trialEndsAt": "...",
  "currentPeriodEnd": "..."
}
```

**UI Layout**:
- **Menu List**:
  - Account Info (Logged in as X)
  - Subscription Status (Active / Expired)
  - Unlink Device (Log out button)
  - About / Version

**Navigation Flow**:
- Accessed via Sidebar (Bottom).
- OK on Unlink Device -> Confirmation Dialog -> Wipes local registry -> Navigates to Auth Scene.

**Localization Requirements**:
- "Settings", "Account", "Subscription", "Active", "Unlink Device", "Are you sure?".

---

## 8. Screensaver Layout

**Purpose**: Passive, ambient display when the Roku TV is idle. Protects against screen burn-in while providing value.

**API Endpoint**: `GET /roku/screensaver`

**Data Structure**:
```json
{
  "verse": { "text": "...", "reference": "..." },
  "drawingUrl": "https://...",
  "qrCodeUrl": "https://...",
  "tickerMessages": ["Dr. Appointment at 2PM"]
}
```

**UI Layout**:
- **Background**: Slowly crossfading or panning background (using `drawingUrl` or fallback landscape).
- **Center (Animated)**: Bouncing or slowly drifting container containing the `verse.text` and `verse.reference`.
- **Bottom Bar**: A scrolling marquee (ticker) displaying upcoming `tickerMessages`.
- **Corner**: Small QR code for quick mobile app downloads.

**Navigation Flow**:
- Automatically launched by Roku OS when idle.
- Any button press -> Exits screensaver and returns to Roku OS / App.

**Localization Requirements**:
- Ticker string generation ("Appointment at [Time]").
