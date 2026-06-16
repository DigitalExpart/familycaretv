# Referral Tracking System

The Referral Tracking System allows FamilyCare TV users to invite others and track their referrals through the subscription lifecycle. It is built to support future commission payouts.

## Database Design

### Updates to `User`
- `referralCode` (String, unique): A 6-character alphanumeric string prefixed with `FAMILY-`.
- `referredById` (String, optional): The ID of the user who referred this user.

### `Referral` Model
Tracks the relationship and lifecycle between the referrer and the referred user.
- `referrerId`: The user who shared the code.
- `referredUserId`: The newly registered user.
- `status`: Enum (`PENDING`, `REGISTERED`, `SUBSCRIBED`, `PAID`).
- `commissionEligible`: Boolean indicating if the referral has met requirements for commission.

## API Design

Endpoints added to `ReferralsModule`:
- `GET /referrals/my-code`: Fetches the authenticated user's referral code.
- `GET /referrals/my-referrals`: Fetches a list of users referred by the authenticated user.
- `GET /referrals/stats`: Returns aggregated stats (e.g., number of `REGISTERED` and `SUBSCRIBED` referrals).
- `POST /referrals/validate`: Validates a given referral code before registration (public).
- `GET /referrals/admin/all`: Fetches all referrals in the system for the Admin CMS.

## Referral Flow

1. **Generation**: When a user registers, the `AuthService` automatically generates a unique `referralCode` (e.g., `FAMILY-A1B2C3`).
2. **Sharing**: The user copies or shares this code from the Mobile App's Referral screen.
3. **Validation**: A new user enters the code during registration. The app calls `POST /referrals/validate` to ensure it's valid and displays the referrer's name.
4. **Creation**: During registration (`AuthService.register`), the code is looked up. If valid, the new user's `referredById` is set, and a `Referral` record is created with the status `REGISTERED`.

*Security*: Self-referrals and duplicate referral usage are blocked at the service level. Referrals can only be attached during initial registration.

## Subscription Flow

Stripe integration is handled via webhooks in `StripeService`:
- When a `customer.subscription.updated` event is received, the system checks if the subscription status is `active`.
- If active, the system checks if the user has a `referralReceived` record.
- If true, the `Referral` record status is transitioned to `SUBSCRIBED` and `commissionEligible` is set to `true`.

## Future Commission Flow

The current database structure supports future commission payouts:
- The `commissionEligible` flag designates which referrals have resulted in an active subscription.
- A future job or admin process can query for all `SUBSCRIBED` and `commissionEligible = true` referrals to calculate payouts.
- Once paid, the referral status can be transitioned to `PAID` to prevent double payouts.
