# FamilyCare TV: Roku Hardware QA Checklist (v0.9.0 Beta)

This document provides the comprehensive hardware QA checklist for the FamilyCare TV Roku MVP Build. Please execute these tests on a physical Roku device (e.g., Roku Express, Streaming Stick, Ultra, or Roku TV) and log all findings in the shared bug tracker (include Device Model, OS Version, Steps to Reproduce, Expected vs. Actual, and Media).

## 1. Authentication
- [ ] App launches
- [ ] Splash screen displays
- [ ] Device linking works (code generation and submission)
- [ ] Token persists after device reboot
- [ ] Logout works

## 2. Navigation
- [ ] D-pad navigation functions correctly across all screens
- [ ] Focus movement highlights elements visibly (PremiumCard scaling)
- [ ] Back button returns to previous screen / exits root properly
- [ ] Home navigation functions
- [ ] Screen transitions are smooth without visual tearing

## 3. Dashboard Data Verification
- [ ] Verse of the Day displays accurately
- [ ] Drawing of the Day background loads
- [ ] Today's Tasks list populates
- [ ] Medication Reminders list populates
- [ ] Kids summary loads specific profiles
- [ ] Pets summary loads specific profiles
- [ ] Music library loads from the API

## 4. Notifications
*Trigger the following notifications from the backend/mobile app while the Roku is idle on the Home screen to verify background polling.*
- [ ] Medication (Orange Banner)
- [ ] Appointment (Blue Banner)
- [ ] Daily Task (Green Banner)
- [ ] Homework (Green Banner)
- [ ] Kids Task (Green Banner)
- [ ] Pet Medication (Orange Banner)
- [ ] Pet Vaccination (Blue Banner)
- [ ] Emergency (Red Banner)
- [ ] Bible Reminder (Green Banner)
- [ ] General Notification (Green Banner)

**Check for each:**
- [ ] Banner appears
- [ ] Correct color is applied based on priority
- [ ] Auto-dismiss occurs after 5 seconds
- [ ] Queue behavior works (if 3 notifications arrive simultaneously, they display sequentially)

## 5. Screensaver
*Force the screensaver to activate via Roku Settings > Theme.*
- [ ] Activates successfully
- [ ] Verse text displayed
- [ ] Drawing background displayed
- [ ] QR code (placeholder) is visible
- [ ] Live Clock displays correct time
- [ ] Live Date displays correct date
- [ ] Smooth ticker loops upcoming appointments
- [ ] No screen flicker or layout thrashing (Ken Burns pans smoothly)

## 6. Media
- [ ] Music playback initializes
- [ ] Artwork loads
- [ ] Pause functionality
- [ ] Resume functionality
- [ ] Stop functionality

## 7. Performance & Stability
- [ ] No application crashes
- [ ] Memory remains stable (check via Telnet `8080` profile)
- [ ] Navigation remains smooth after long usage periods
- [ ] Background polling (30s interval) remains stable without causing UI hangs
