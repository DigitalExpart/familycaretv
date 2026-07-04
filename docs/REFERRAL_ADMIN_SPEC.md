# Referral Admin Specification

## 1. Overview
The Referral Admin module provides the ability for platform administrators to manage both user referrals and referral codes from the FamilyCare CMS dashboard.

## 2. API Endpoints
All endpoints require `JwtAuthGuard` and `RolesGuard` with `Role.ADMIN`.
Base path: `/referrals/admin`

*   **`GET /all`**: Retrieves all referrals tracked in the system, including referrer and referred user details.
*   **`GET /codes`**: Retrieves all created referral codes and their usage stats.
*   **`POST /codes`**: Creates a new referral code.
    *   Payload: `{ code: string, commissionRate: number, maxUsages?: number, status: string }`
*   **`PUT /codes/:id`**: Updates an existing referral code.
*   **`DELETE /codes/:id`**: Deletes a referral code.

## 3. Web Admin UI
Path: `apps/admin/src/app/dashboard/referrals/page.tsx`

The page implements a Tab-based interface:
1.  **Tracked Referrals Tab**: 
    *   Shows a searchable and filterable list of all user referrals.
    *   Status filters (ALL, PENDING, REGISTERED, SUBSCRIBED, PAID).
    *   Displays commission eligibility.
2.  **Referral Codes Tab**:
    *   Shows all custom referral codes with their usage counts and commission rates.
    *   Provides full CRUD (Create, Edit, Delete) capabilities via a modal form.
    *   Fields include Code (string), Commission Rate (%), Max Usages (optional), and Status (ACTIVE/INACTIVE).
