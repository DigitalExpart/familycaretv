# Internal Testing Checklist

**Date:** 2026-07-08
**Version:** 1.0.0

Use this checklist during Google Play Internal/Closed Testing before promoting to Production.

## Core Modules
- [ ] **Authentication:** Registration, Login, and Password Reset flows.
- [ ] **Profile & Settings:** Update user details, avatar, and timezone.
- [ ] **Subscriptions:** Test Stripe checkout flow (using test cards) and access limits.

## Care Features
- [ ] **Patients:** Create, Edit, Delete patients. Verify caregiver invites.
- [ ] **Doctors:** Add doctor profiles and emergency contacts.
- [ ] **Medications:** Schedule a medication, verify the push notification fires, and mark it as taken.
- [ ] **Calendar:** Create an appointment and verify it appears in the daily agenda.
- [ ] **Tasks:** Create a task and mark it complete.
- [ ] **Kids & Pets:** Create profiles and assign specific tasks to them.

## Media & Extras
- [ ] **AI Assistant:** Send a prompt and verify the response.
- [ ] **Books & Music:** Verify library lists load correctly.
- [ ] **Referral System:** Generate a code and verify usage statistics update.

## Integration
- [ ] **Push Notifications:** Verify foreground and background delivery on Android.
- [ ] **Roku Sync:** Verify changes made in the mobile app immediately reflect on the Roku TV dashboard.
