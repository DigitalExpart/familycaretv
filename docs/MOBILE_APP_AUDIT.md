# Mobile App Audit Report
**Project:** FamilyCare TV  
**Date:** Current  

## Executive Summary
The FamilyCare TV mobile app is currently in a prototype state. The navigation relies on basic routing with several functional gaps. Many required entities are missing their corresponding screens, API hooks, and UI elements. The design system lacks the premium "Apple Health / Calm" aesthetic requested.

## 1. Missing Screens & Routes
The following routes and screens are completely absent from the `apps/mobile/src/app` directory:
- `(tabs)/patients` (Currently a loose route `app/patients`, not integrated into a bottom tab)
- `(tabs)/calendar` (Missing entirely)
- `(tabs)/notifications` (Missing entirely)
- `(tabs)/profile` (Missing entirely)
- `medications/*` (List, Details, Create, Edit, Delete)
- `events/*` (List, Details, Create, Edit, Delete)
- `notes/*` (List, Details, Create, Edit, Delete)
- `settings` (Language, Theme, Preferences, Privacy)

## 2. Navigation State
- **Current Tab Bar:** Minimal setup with only `dashboard` and `subscription` in `(tabs)/_layout.tsx`.
- **Missing Elements:** No modern bottom navigation bar, no active state indicators, no Lucide icons, no badges.

## 3. Dashboard State
- **Current Layout:** Minimal and basic UI.
- **Missing Components:** 
  - Greeting header with Notification Bell and Profile Avatar
  - Quick Stats summary
  - Connected sections for Patients, Medications, Appointments, Tasks, Notes
  - Verse of the Day / Drawing of the Day
  - Quick Actions floating or fixed bar (Add Patient/Medication/Event/Note)
- **Dead Links:** The dashboard doesn't connect deeply to the specific resource pages.

## 4. Backend Gaps
- **Notifications Model:** Completely missing from `schema.prisma`. Needs `Notification` model to store system notifications and reminders.
- **Notification API:** Missing `GET /notifications`, `PATCH /notifications/:id/read`, etc.
- **Settings/Preferences:** Missing a robust way to store Notification Preferences and Theme preferences for the user (can be added to `User` model or a separate `UserSettings` model).

## 5. Design System & Language
- **i18n:** `i18n.ts` exists but many components use hardcoded English strings.
- **Aesthetics:** Lacks consistent premium styling (rounded corners, soft shadows, gradients) and modern interaction animations.

---
**Conclusion:** A complete overhaul of the navigation structure, the introduction of a premium design system, and the creation of all missing CRUD screens and backend dependencies are required to achieve a production-ready application.
