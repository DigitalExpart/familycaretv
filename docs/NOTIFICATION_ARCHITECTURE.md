# FamilyCare TV Notification Architecture

## Overview
The new Notification Engine transitions the platform from a "pull-based, compute-on-the-fly" model to an **Event-Driven, Push-Based Architecture**.

## Components

1. **Modules (Medications, Tasks, Events, etc.)**
   - Emit events (e.g., `NotificationEvent`) when a notification needs to be sent immediately.
   - Rely on the `NotificationSchedulerService` to periodically scan for due items.

2. **NotificationSchedulerService**
   - A `@nestjs/schedule` cron job running every minute.
   - Scans the database for Tasks, Medications, Events that are due *right now*.
   - Emits internal `NotificationEvent`s to the Engine.

3. **NotificationEngineService**
   - Listens to `NotificationEvent`s via `@nestjs/event-emitter`.
   - Idempotent: Checks if a notification for this specific entity/time already exists to prevent duplicates.
   - Creates a persistent `Notification` record in the database with status `PENDING`.
   - Triggers the `ExpoPushService`.

4. **ExpoPushService**
   - Retrieves the `expoPushTokens` for the user.
   - Sends the push notification via `expo-server-sdk`.
   - Updates the DB `Notification` status to `SENT` or `FAILED`.

5. **Notification API (`/notifications`)**
   - Exposes standard REST endpoints (`GET /notifications`, `GET /notifications/unread`, `PATCH /notifications/:id/read`).
   - Purely queries the persistent `Notification` table without performing dynamic calculations.

6. **Mobile App (React Native/Expo)**
   - Registers for Push Notifications and sends the token to the backend (`PATCH /users/me/push-token`).
   - Polls `GET /notifications/unread` every 30 seconds to maintain badge counts and sync state if a push was missed.
   - Renders notifications from the database.

7. **Roku App**
   - Same as Mobile: simply queries the `/notifications` endpoint.
   - Instantly compatible because the DB now holds the absolute truth.

## Database Schema (Notification)
- `id`
- `userId`
- `type`
- `title`
- `message`
- `scheduledAt`
- `expiresAt`
- `isRead`
- `status`
- `priority`
- `actionUrl`

## Lifecycle Example: Medication
1. `Medication` is created to be taken at `08:00 AM`.
2. Cron job runs at `08:00 AM UTC`, detects the medication.
3. Cron job emits `MedicationDue` event.
4. Engine receives event, verifies no duplicate exists for today.
5. Engine writes `Notification` to DB (`PENDING`).
6. Engine passes to ExpoPushService.
7. ExpoPushService sends push notification to mobile device.
8. Status updated to `SENT`.
9. User opens Mobile App Notification Center.
10. Mobile app polls API, retrieves `Notification`.
11. User taps "Mark as Read".
12. API updates `isRead = true`.
