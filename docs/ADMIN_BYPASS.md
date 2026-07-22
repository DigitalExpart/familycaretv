# Platform Administrator Subscription & Plan Limit Bypass

## Overview & Business Rules

FamilyCare TV enforces strict distinction between two user types:

1. **Platform Administrator (`role === 'ADMIN'`)**:
   - The platform owner, development, and QA accounts.
   - Requires **unrestricted, unlimited access** to all platform capabilities, Roku devices, AI lookups, patients, kids, pets, tasks, notes, and family management.
   - **Never blocked** by Free Trial expiration, Personal plan limits, or Family plan limits.

2. **Subscriber (`role === 'USER'`)**:
   - End users subject to regular business tier rules (`FREE_TRIAL`, `PERSONAL`, `FAMILY`).
   - Resource limits (e.g. up to 1 Roku device for Personal Plan, up to 3 for Family Plan) are strictly enforced.

---

## Bypassed Systems & Guards

### 1. `ResourceLimitGuard` (`apps/api/src/common/guards/resource-limit.guard.ts`)
- Automatically passes `canActivate` without checking resource counts when `user.role === 'ADMIN'`.

### 2. `SubscriptionsService` (`apps/api/src/subscriptions/subscriptions.service.ts`)
- `checkResourceLimit()`: Returns `{ allowed: true }` for `ADMIN`.
- `checkAiLimit()`: Returns `{ allowed: true }` for `ADMIN`.
- `getFullStatus()`: Returns `planTier: 'ADMIN'`, `subscriptionStatus: 'active'`, and `Infinity` for all resource limits.

### 3. `RokuService` (`apps/api/src/roku/roku.service.ts`)
- `linkDevice()`: Skips Roku device count limit validation for `ADMIN` users.
- `getUserDevices()`: Displays `Platform Administrator` / Unlimited capacity (`999`) for `ADMIN` users.

---

## Promoting Accounts to Admin

To promote any registered account to `role = 'ADMIN'`, run the promotion helper script from `apps/api`:

```bash
node apps/api/promote-admin.js <user-email>
```

Example:
```bash
node apps/api/promote-admin.js client@familycare.tv
```

This updates the database record to `role = 'ADMIN'`, granting instant unlimited access across all web, mobile, and Roku companion interfaces.
