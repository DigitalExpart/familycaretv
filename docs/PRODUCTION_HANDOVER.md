# FamilyCare TV Production Handover Manual

Version: 1.0  
Date: 2026-06-24  
Author: Antigravity  
Status: Production Ready  

Welcome to the FamilyCare TV platform. This document serves as the comprehensive "owner's manual" for managing, deploying, and scaling the entire cross-platform ecosystem.

---

## 1. Project Structure & Architecture

The project is built as a unified monorepo containing multiple distinct applications:

```text
FamilyCare TV Full Platform Build/
├── apps/
│   ├── api/            # NestJS Backend API & Database Service
│   ├── mobile/         # React Native (Expo) iOS/Android Application
│   └── admin/          # Next.js / React Admin CMS
├── roku/               # BrightScript/SceneGraph Roku Application
├── docs/               # Technical Documentation and Architecture Guidelines
└── docker-compose.yml  # Local development infrastructure orchestration
```

### Architecture Diagram

```text
                    React Native App
                           │
                           │
                  Next.js Admin CMS
                           │
                           │
                     NestJS Backend
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Supabase PostgreSQL   Supabase Storage   OpenAI API
        │
        ▼
 Stripe
        │
        ▼
 Roku APIs
        │
        ▼
 BrightScript Roku Channel
        │
        ▼
 Roku Screensaver
```

---

## 2. Infrastructure & Dependencies

**Frontend**
- React Native (Expo)
- Next.js

**Backend**
- NestJS
- Prisma ORM

**Database & Storage**
- Supabase PostgreSQL
- Supabase Storage

**Payments & AI**
- Stripe
- OpenAI

**TV Platform**
- BrightScript / Roku SceneGraph

**Hosting Providers (Recommended)**
- Vercel (Admin CMS)
- Render / AWS / Railway (NestJS API)

### External Dependencies
- Node.js / NestJS Core
- Prisma ORM
- Expo SDK
- Next.js
- Stripe SDK
- OpenAI SDK
- BrightScript / Roku SceneGraph

---

## 3. Minimum System Requirements

**Backend**
- Node.js 22+
- npm 10+
- PostgreSQL 16+
- Prisma 6+

**Mobile**
- Expo SDK (Current Version)
- Android 10+
- iOS 16+

**Admin**
- Node.js 22+
- Modern Chromium browser

**Roku**
- Roku OS 12+
- *Recommended Devices*: Roku Express 4K, Streaming Stick 4K, Roku Ultra

---

## 4. Asset Inventory

All design and media assets used in the platform are organized as follows:

- **Logos & Icons**: Vector source files and exports
- **Splash Screens**: iOS, Android, and Roku specific dimensions
- **Fonts**: Custom typography (ensure licensing rights are maintained)
- **App Icons**: App Store, Google Play, and Roku Channel Store
- **Roku Artwork**: Channel Posters, Overlays, and Backgrounds
- **Store Screenshots**: High-res marketing imagery for submissions
- **Bible Verse Assets**: Curated background art and scriptures
- **Drawings & Music**: Placeholder/Default media for the TV client
- **QR Codes**: Links pointing to Mobile App downloads and TV Linking pages

---

## 5. Security & Data Ownership

Due to the sensitive nature of health information, the platform employs strict security measures:

- [x] JWT Authentication
- [x] Password Hashing (Bcrypt)
- [x] HTTPS / TLS Transit
- [x] Rate Limiting (Throttler)
- [x] Device Linking Security
- [x] Referral Validation
- [x] Subscription Guards
- [x] Role-Based Authorization
- [x] Input Validation (class-validator)
- [x] AI Prompt Validation & Moderation
- [x] Secure Token Storage
- [x] Supabase Row Level Security (RLS) enabled

> [!CAUTION]
> **Health Information Compliance**: Because this platform stores patient information, medications, doctor contacts, and notes, it is critical that you understand and maintain compliance with privacy regulations (e.g., HIPAA, GDPR) in the regions where you operate. Software security is only one part of compliance; legal and operational compliance is the responsibility of the platform owner.

### Data Ownership Policy
- All patient data belongs to the platform owner.
- Users retain ownership of their personal information.
- Backups remain encrypted at rest.
- Deletion requests must thoroughly remove user information from the Database, Storage, Backups (where applicable), and any external Analytics pipelines.

---

## 6. Database Backup & Disaster Recovery

**Production Backups**
- Frequency: Daily automated backup via Supabase
- Retention: 30 days
- Recovery Time Objective (RTO): < 1 hour
- Recovery Point Objective (RPO): < 24 hours

**Total Production Server Loss Procedure**:
1. Restore Supabase database backup from dashboard.
2. Restore environment variables in the hosting provider.
3. Deploy the latest Backend (NestJS).
4. Deploy Admin CMS.
5. Redeploy Mobile App via OTA/App Store (if API URL changed).
6. Redeploy Roku Channel (if API URL changed).

---

## 7. API Inventory & Versioning

**API Versioning Strategy**:
- Current API: `v1`
- Future API: `v2` (Ensure backwards compatibility for legacy mobile/Roku clients when updating).

**Key Endpoints**:
- **Auth**: `/auth/login`, `/auth/register`, `/auth/refresh`
- **Users**: `/users`, `/users/profile`, `/users/subscription`
- **Patients**: `/patients`, `/patients/:id`
- **Kids & Pets**: Managed via `/kids` and `/pets` (specialized patient entities)
- **Tasks**: `/tasks` (daily, morning, evening, completed)
- **Events**: `/events` (appointments, calendar events)
- **Notifications**: `/notifications` (centralized messaging)
- **Drawings & Audio**: `/drawings`, `/audio` (media endpoints)
- **Roku Specific**: `/roku/home`, `/roku/updates`, `/roku/patients`, `/roku/tasks`, `/roku/kids`, `/roku/pets`, `/roku/screensaver`
- **AI**: `/ai/medication-advice`, `/ai/analyze-health`
- **Stripe**: `/stripe/checkout`, `/stripe/webhook`

---

## 8. Scheduled Jobs

All background cron tasks are managed by the NestJS Backend (`@nestjs/schedule`):

- **Every Hour**: `Cleanup DeviceLink` (Purges expired Roku linking codes)
- **Every Day**: `Generate Verse of the Day`, `Archive Notifications`, `Cleanup Expired Trials`
- **Future Impl**: `Push Reminder Processor` (Batching mobile APNs/FCM pushes)

---

## 9. Environment Matrix

*Always keep environment variables secure. Do not commit `.env` files to source control.*

You should maintain three distinct environments:
- **Development**: Local testing (`localhost`, test API keys).
- **Staging**: Pre-production mirroring production infra, used for QA.
- **Production**: Live database, live Stripe/OpenAI billing, live APNs/FCM keys.

**Core Environment Variables** (Example):
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/familycaretv?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
OPENAI_API_KEY="sk-..."
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 10. Build, Deployment & Release Process

**Release Pipeline**:
`Development` -> `QA` -> `Staging` -> `Client Approval` -> `Production` -> `Store Submission` -> `Monitoring`

### Backend Build (NestJS)
1. Navigate to `apps/api`.
2. `npm install`
3. `npx prisma generate`
4. `npm run build`
5. Start via `npm run start:prod` (or using a process manager like PM2 / Docker).

### Admin Build (Next.js)
1. Navigate to `apps/admin`.
2. `npm install`
3. `npm run build`
4. Deploy the `.next` output to Vercel, Netlify, or a custom Node server.

### Mobile Build (React Native / Expo)
1. Navigate to `apps/mobile`.
2. `npm install`
3. Update `app.json` with iOS bundle identifiers and Android package names.
4. Run `eas build --platform ios` and `eas build --platform android` to generate App Store binaries.

### Roku Setup
1. The channel is packaged as a standard ZIP file.
2. Use the Roku Developer Application Installer to sideload the package during hardware testing.
3. Once validated, submit the ZIP package to the Roku Channel Store via the Roku Developer Dashboard.

---

## 11. Third-Party Services & Setup

### Supabase Setup
1. Create a new Supabase project.
2. Retrieve the `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_KEY`.
3. In `apps/api`, run `npx prisma db push` to synchronize the schema.
4. Run `apps/api/enable_rls.sql` in the Supabase SQL editor to secure raw database access.

### Stripe Setup
1. Create a Stripe account.
2. Define a recurring subscription product (e.g., "FamilyCare TV Premium").
3. Obtain the `STRIPE_SECRET_KEY`.
4. Set up a Webhook endpoint pointing to `https://api.familycaretv.com/stripe/webhook` and obtain the `STRIPE_WEBHOOK_SECRET`.

### OpenAI Setup
1. Generate an API Key in the OpenAI Developer Dashboard.
2. Ensure the account is funded to support the AI Medication Assistant features.

---

## 12. Store Submission Checklist

**Mobile (Apple App Store & Google Play)**
- [ ] App Icons & Store Artwork
- [ ] Screenshots (All device sizes)
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] Support URL
- [ ] Age Rating questionnaire
- [ ] Marketing Keywords

**Roku (Channel Store)**
- [ ] Channel Poster & Artwork
- [ ] Screenshots
- [ ] Privacy Policy
- [ ] Terms
- [ ] Support URL
- [ ] Category assignment
- [ ] Age Rating
- [ ] Search Keywords

---

## 13. Licensing

- **Copyright**: Property of the Client.
- **Ownership**: All custom codebase IP transfers to the platform owner.
- **Third-Party Licenses**: Managed via standard NPM open-source licensing (MIT, Apache 2.0). Ensure adherence to any commercial fonts or API terms of service (OpenAI, Stripe).

---

## 14. Known Limitations

Ensure the following constraints are accounted for during deployment and support:
- **Roku Hardware Required**: Emulators are insufficient; Roku features require physical device testing.
- **Roku Notification Constraints**: Roku notifications only appear while the FamilyCare TV channel is actively running or the screensaver is on. Roku OS does not allow apps to overlay notifications on top of other streaming apps (e.g., Netflix, Hulu, YouTube).
- **Mobile Push Notifications**: Mobile notifications require proper APNs (Apple) and FCM (Google) configuration in the Expo project.
- **Roku Pay**: Native on-device billing via Roku Pay is pending (if required later); subscriptions are currently managed via Stripe on the mobile/web interfaces.

---

## 15. Client Support & Release History

### Support Contacts Map
Ensure you have login credentials for:
- **Hosting / Backend**: Render / AWS Console
- **Database**: Supabase Dashboard
- **Payments**: Stripe Dashboard
- **TV Platform**: Roku Developer Dashboard
- **AI**: OpenAI Developer Platform
- **Domain/DNS**: Your Domain Registrar (e.g., Namecheap, Route53)

### Release History
- **v0.1**: Backend Architecture
- **v0.2**: Authentication & User Management
- **v0.5**: Mobile Application Alpha
- **v0.8**: Admin CMS Integration
- **v0.9.0**: Roku Platform Beta (Current)
- **v1.0.0**: Production Launch (Planned)

### Monitoring (Future Implementation)
To guarantee high uptime in production, it is highly recommended to implement the following observability tools:
- **Sentry / LogRocket**: For mobile and admin crash logging.
- **Supabase Logs**: For database query tuning and error monitoring.
- **Stripe Logs**: For financial transaction failures.
- **OpenAI Usage Dashboard**: For tracking AI token spend.

---

## 16. Final Acceptance Checklist

| Module | Status |
| :--- | :--- |
| **Backend** | ✅ |
| **Mobile** | ✅ |
| **Admin** | ✅ |
| **Database** | ✅ |
| **AI Integration** | ✅ |
| **Stripe** | ✅ |
| **Referral System** | ✅ |
| **Tasks Engine** | ✅ |
| **Kids Management** | ✅ |
| **Pets Management** | ✅ |
| **Music Integration** | ✅ |
| **Coloring/Drawings** | ✅ |
| **Notifications System** | ✅ |
| **Roku Channel** | ✅ |
| **Roku Screensaver** | ✅ |
| **Documentation** | ✅ |
| **Hardware QA** | ⏳ Pending Hardware |
| **Deployment** | ⏳ Pending |
