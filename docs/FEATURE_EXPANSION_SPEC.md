# FamilyCare TV - Platform Expansion Specification

This document outlines the expanded capabilities of the FamilyCare TV platform across all tiers (Database, Backend API, Mobile App, and Admin CMS).

## 1. Daily Tasks & Wellness
- **Data Models:** `Task`, `DailyJournal`
- **API Endpoints:**
  - `GET /tasks/today`
  - `POST /tasks`
  - `PATCH /tasks/:id`
  - `DELETE /tasks/:id`
  - `GET /tasks/journal`
  - `POST /tasks/journal`
- **Mobile Features:** Morning, Daytime, and Evening task breakdowns, visual progress indicators, and a daily journal entry system.
- **Admin Features:** High-level task monitoring and potential global templates.

## 2. Verse of the Day
- **Data Models:** `BibleVerse`, `VerseDay`
- **API Endpoints:**
  - `GET /bible-verses/today` (Returns verse mapped by day of the month)
- **Mobile Features:** Featured "Verse of the Day" on the dashboard, expandable to read full text, with "Play on TV" integration.

## 3. Kids Management (Kids Hub)
- **Data Models:** `ChildProfile`, `ChildTask`, `ChildCalendarEvent`, `ChildNote`
- **API Endpoints:**
  - `GET /kids`
  - `POST /kids`
  - `POST /kids/:id/tasks` (and update/delete)
  - `POST /kids/:id/events`
- **Mobile Features:** Dedicated Kids Dashboard for managing school information, assigning homework/chores, and tracking child-specific events.

## 4. Pets Management (Pets Hub)
- **Data Models:** `Pet`, `Veterinarian`, `EmergencyClinic`, `PetVaccination`, `PetMedication`, `PetNote`
- **API Endpoints:**
  - `GET /pets`
  - `POST /pets`
  - `POST /pets/:id/vets`
  - `POST /pets/:id/vaccinations`
  - `POST /pets/:id/medications`
- **Mobile Features:** Dedicated Pets Dashboard for tracking veterinary contacts, vaccination schedules, and medication regimens.

## 5. Music Library
- **Data Models:** `MusicCategory`, `MusicTrack`
- **API Endpoints:**
  - `GET /music/categories`
  - `GET /music`
- **Mobile Features:** Browse curated music tracks and categories to stream directly to the Roku TV.
- **Admin Features:** Upload and manage categories and audio tracks.

## 6. Coloring Pages
- **Data Models:** `ColoringPage`
- **API Endpoints:**
  - `GET /coloring-pages`
- **Mobile Features:** View available coloring pages that kids can interact with on the Roku TV.
- **Admin Features:** Upload and manage coloring pages.

## Next Steps
- Integrate Music and Coloring endpoints into the Roku TV app.
- Finalize "Play on TV" WebSocket triggers for Verse of the Day and Music.
