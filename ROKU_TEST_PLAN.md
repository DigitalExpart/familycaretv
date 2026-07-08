# Roku Release Candidate Test Plan

## Objective
Verify the end-to-end functionality of the FamilyCare TV Roku Channel against the live backend, ensuring the client hardware testing goes smoothly.

## Pre-Test Setup
1. Sideload the application (see `ROKU_INSTALL_GUIDE.md`).
2. Ensure you have the companion FamilyCare TV mobile app installed, or access to the backend admin panel to populate test data.

## Test Cases

### 1. Device Linking (Auth)
- **Action**: Launch the app for the first time.
- **Expected**: A QR code and pairing code should be displayed on screen.
- **Action**: Scan the QR code with your mobile device and authenticate.
- **Expected**: The Roku TV should automatically poll and transition to the Home Screen once linked.

### 2. Home Screen & Today's Summary
- **Action**: Observe the Home Screen.
- **Expected**: "Good Morning, [Name]", today's date, and the Verse of the Day should be accurately displayed.
- **Action**: Review the "Today's Summary" rail.
- **Expected**: The counts for Medications Due, Appointments, Tasks, Homework, and Pet Reminders should perfectly match the data in the backend.

### 3. Book Deep Linking
- **Action**: Scroll down to the "Featured Book" rail on the Home Screen.
- **Action**: Click the Book of the Day tile.
- **Expected**: You should seamlessly transition directly into the `BooksScreen`.

### 4. Books Navigation
- **Action**: From the Books Screen, scroll through the "Featured Books", "Recently Added", and "Browse All Books" rows.
- **Expected**: Artwork should load gracefully. If artwork is missing, it should default to the branded `fallback_artwork.png`.
- **Expected**: The Hero section should display a scan-to-buy QR code.

### 5. Calendar Navigation
- **Action**: Open the left sidebar menu and navigate to "Calendar".
- **Expected**: All events (Tasks, Appointments, Medications, etc.) should be unified into a single timeline.
- **Expected**: Events should be correctly partitioned into "Today", "Tomorrow", "This Week", and "Upcoming".

### 6. Screensaver Behavior
- **Action**: Leave the Roku idle for the system-defined screensaver timeout period (or manually trigger via Roku settings).
- **Expected**: The screensaver should display the current time/date, Verse of the Day, Featured Book Cover, and a QR code.
- **Expected**: The ticker at the bottom should cycle through active reminders.
