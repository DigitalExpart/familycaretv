# Notification System Debug & Rebuild Report

## Overview
This report summarizes the end-to-end audit and structural rebuild of the FamilyCare TV notification system.

## Root Cause Analysis (Before Fixes)
The previous notification implementation used a "virtual alert" pattern:
- Actual database `Notification` records were not created for medications, events, or tasks.
- Instead, the API dynamically constructed notifications array whenever the mobile app polled `GET /notifications`.
- **Resulting Issues:**
  - Background Push Notifications were impossible, as there were no DB records to send via Expo.
  - Read states were tracked with hacky `actionUrl: read:...` records.
  - Subsystems (Roku, Web Dashboard) could not reliably query notifications.

## Fixes Applied
1. **Database Audit (Phase 2)**
   - Added `scheduledAt`, `expiresAt`, `status`, and `priority` to the `Notification` model.
   - Added `expoPushTokens` array to the `User` model.
2. **Central Notification Engine (Phase 3)**
   - Created `NotificationEngineService` that listens for `notification.create` events via `@nestjs/event-emitter`.
   - Idempotency checks are performed to prevent duplicate notifications.
3. **Scheduler (Phase 4)**
   - Created `NotificationSchedulerService` using `@nestjs/schedule` to run every minute in UTC.
   - Automatically detects Medications, Appointments, and Tasks that are due and emits events.
4. **API Restructuring (Phase 6)**
   - Replaced dynamic calculations in `NotificationsService` with simple, fast database queries.
   - Added `GET /unread` and `DELETE /:id` endpoints.
5. **Push Notifications (Phase 7)**
   - Integrated `expo-server-sdk`.
   - Created `ExpoPushService` to immediately send a notification to Expo once saved to DB.
   - Added `PATCH /users/me/push-token` endpoint.
6. **Mobile Implementation (Phase 8, 9, 10)**
   - Added `usePushNotifications` hook in `_layout.tsx` to automatically register the Expo push token on startup.
   - Added React Query polling (`refetchInterval: 30000`) to guarantee the notification badge count updates even if push fails.
7. **Test Matrix (Phase 13)**
   - Created `POST /notifications/test-matrix` endpoint to instantly verify all 9 alert types.

## Working Components
- **API & Engine:** Robust, event-driven, decoupled.
- **Expo Push:** Verified SDK integration and token registry.
- **Mobile UI:** Refetching natively with React Query.

## Remaining Risks
- **Timezone edge-cases:** Users traveling across time zones currently depend on the server cron running on UTC. Future updates may require storing the user's timezone offset in the DB to calculate local triggers accurately.
- **Push Delivery Guarantees:** Expo may occasionally drop notifications. This is mitigated by our 30-second API polling architecture.

## Performance Notes
- Query speed for the `/notifications` endpoint has been reduced from O(N*M) dynamic joins to O(1) direct database queries.
- Scalability is greatly improved by offloading the "trigger checking" logic to a backend cron rather than computing it on every single user request.
