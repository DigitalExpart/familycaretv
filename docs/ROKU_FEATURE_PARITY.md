# Roku Feature Parity Audit

## Overview
This document compares the implemented feature set on the FamilyCare TV Roku Channel against the Mobile App to identify missing parity.

## Implemented Parity (Roku & Mobile)
The Roku app successfully reflects the following mobile features:
- **Patients**: Available on both.
- **Tasks**: Available on both (Morning, Daytime, Evening).
- **Kids**: Available on both.
- **Pets**: Available on both.
- **Music**: Available on both (Mobile has `music.tsx`, Roku has `MusicScreen`).
- **Subscription Verification**: Mobile checks via App Stores/Stripe, Roku verifies via `GET /roku/subscription-status`.
- **Notifications Engine**: Polling mechanism exists (`PollingTask.brs`).
- **Daily Reminders**: Reflected on HomeScreen and Screensaver ticker.

## Missing Features on Roku
The following features are fully implemented on Mobile but missing from Roku:

### 1. Calendar
- **Mobile**: Full calendar view (`calendar.tsx`).
- **Roku**: A `CalendarScene.brs` file was created, but there is no `CalendarScreen` component implemented in the XML views to actually display calendar data.

### 2. Books
- **Mobile**: Books reader/library view (`books.tsx`).
- **Roku**: No Book screen exists. The backend exposes `GET /books`, but the Roku app completely lacks the UI to view them.

### 3. Family / Profiles / Referrals
- **Mobile**: Mobile supports `family.tsx`, `profile.tsx`, and `referrals.tsx`.
- **Roku**: By design, Roku acts as a passive display for a single household and does not need profile editing or referrals. However, it lacks a robust way to switch active viewing context if multiple family members use the same TV.

## Conclusion
The Roku Channel is fundamentally missing the **Calendar** and **Books** interfaces, causing a break in feature parity with the mobile application.
