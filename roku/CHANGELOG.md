# FamilyCare TV Roku Channel
## Version v0.9.0 Beta

### Features Implemented
- **Centralized Dashboard (Home)**: Aggregates everything from Verse of the Day to Tasks, Appointments, Kids, Pets, and Medications into a single scrollable dashboard view.
- **Dedicated Data Screens**: Completely replaced placeholder screens with dedicated SceneGraph UI components for Patients, Tasks, Kids, Pets, Music, Coloring, and Settings.
- **Live Notifications**: The Roku UI actively polls `GET /roku/updates` and manages a queue of sliding notification banners overlaying the UI, complete with priority-based color coding (e.g., Red for Emergencies).
- **Screensaver Suite**: Includes the Bouncing Verse, Ken Burns dynamic background animations, a live clock/date, and a scrolling notification ticker showing upcoming appointments.

### APIs Used
- `GET /roku/home`
- `GET /roku/updates`
- `GET /roku/screensaver`
- `GET /roku/subscription-status`
- `GET /roku/patients`
- `GET /roku/tasks`
- `GET /roku/kids`
- `GET /roku/pets`
- `GET /audio`
- `GET /drawings`

### Known Limitations
- The QR Code on the screensaver uses a static placeholder pending a BrightScript QR generation utility.
- API timeouts caused by local network instability will silently fail and retry on the next 30-second poll cycle without alerting the user.

### Hardware Test Checklist
- Sideload onto Roku device.
- Log in / Link Device.
- Send a Push Notification from the backend to verify the Banner behavior.
- Leave idle to trigger Screensaver and verify Ken Burns memory stability.
