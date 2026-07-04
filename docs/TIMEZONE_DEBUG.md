# Timezone Debugging Guide

This document explains how timezone handling is implemented across FamilyCare TV.

## 1. Client-Side (Mobile)
- We use `expo-localization` to detect the device's timezone.
- `Localization.getCalendars()[0]?.timeZone` retrieves the primary timezone of the device.
- We fallback to `Intl.DateTimeFormat().resolvedOptions().timeZone` if the Expo module fails or doesn't return a timezone.
- The timezone is sent in the `POST /auth/register` and `POST /auth/login` requests.
- Users can manually view and override this on their `Profile -> Edit Profile` screen.

## 2. Server-Side (API)
- The user's timezone is saved on their `User` record in the database as `timezone`.
- By default, standard times in the database (such as timestamps, start/end dates for events) are still stored in UTC.

## 3. Notification Scheduler
- The Notification Scheduler (`notification-scheduler.service.ts`) runs on a Cron job every minute.
- Since the server is usually in UTC, it needs to know what the *local time* of the user is before triggering medication or task alerts.
- **Implementation**:
  - The scheduler retrieves the user's `timezone` from the database.
  - It uses `Intl.DateTimeFormat('en-US', { timeZone: userTz })` to format the current UTC time into the user's local day, hour, and minute.
  - It then checks if the localized day, hour, and minute match the schedule defined in the database (e.g., `8:00 AM`).
  - If they match, the notification is queued for push delivery and added to the in-app notification center.

## 4. Troubleshooting Timezone Issues
- **Missed Notifications**: Ensure the user has the correct timezone set in their profile. A mismatched timezone (e.g., traveling without updating or auto-detecting) will cause notifications to fire at the "wrong" time relative to the user's current location.
- **Testing**: To test if a notification fires properly for a user in a different timezone, manually change the timezone field in their profile via the mobile app, and schedule a task for 1 minute from their *new* local time. The server should format its UTC time into that timezone and trigger it.
