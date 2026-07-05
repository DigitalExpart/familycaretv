# Database Audit

## Verifications

### 1. Schema Overview
- **File**: `apps/api/prisma/schema.prisma`
- **Models**: 27 core models covering Users, Patients, Medical info, Calendar, Notifications, Subscriptions, AI Usage, and Family Plans.
- **Provider**: PostgreSQL

### 2. Relations & Cascades
- **User relations**: All `User` downstream entities (`Patient`, `Task`, `ChildProfile`, `Pet`, `Notification`, `Reminder`, `FamilyMember`, `DeviceLink`) are strictly configured with `onDelete: Cascade` (or `SetNull` for referrals/family linking) to prevent orphan records on account deletion.
- **Patient relations**: Medical data (`Doctor`, `EmergencyContact`, `Medication`, `Event`) is tightly bound with `onDelete: Cascade`.

### 3. Constraints & Indexes
- **Enums**: Properly leveraged for `Role`, `PlanTier`, `EventType`, `ReminderStatus`, `AudioType`, `NotificationType`, `ReferralStatus`, `TaskCategory`, and `FamilyMemberStatus`. This prevents malformed string inserts.
- **Uniques**: Configured properly for `email`, `stripeCustomerId`, `stripeSubscriptionId`, `referralCode`, `deviceId`, and compound uniques like `[userId, date]` in `AiUsage`.

### 4. Required Systems Check
- **Reminder & Notification Tables**: ✅ Present and tracking status (`PENDING`, `SENT`), types, priorities, and expiration.
- **Family Tables**: ✅ `FamilyMember` table tracks invites, statuses, and ownership mappings.
- **Subscription Tables**: ✅ Stripe fields (`planTier`, `subscriptionStatus`, `currentPeriodEnd`) natively map to `User`.
- **AI Usage**: ✅ `AiUsage` table enforces daily tracking via composite unique constraints.
- **Referral Tables**: ✅ Robust implementation with `ReferralCode` and `Referral` tracking status and commissions.

### 5. Prisma Client
- Prisma client generation has been previously verified in backend endpoints.

## Conclusion
✅ **PASS**. The database schema is resilient, relational integrity is enforced via cascade rules, and all required platform features have dedicated tables.
