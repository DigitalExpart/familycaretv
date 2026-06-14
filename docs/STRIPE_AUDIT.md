# FamilyCare TV Stripe Audit

## Overview
FamilyCare TV utilizes Stripe for monthly subscriptions ($4.99/mo). Users receive a complimentary 14-day free trial upon registration. Subscriptions unlock all mutating operations (Create, Edit, Delete), while expired accounts retain Read-Only access.

## 1. Free Trial Creation
- **Trigger**: Fired implicitly.
- **Logic**: When a User registers, their `trialEndsAt` is `null` by default. However, the `StripeService.getSubscriptionStatus()` computes the trial period dynamically based on the User's `createdAt` timestamp: `createdAt + 14 days`.
- **Status Mapping**: If the user is within 14 days of creation and has no Stripe Subscription ID, the API returns `{ status: 'trialing' }`.

## 2. Checkout Session Creation
- **Endpoint**: `POST /stripe/create-checkout-session`
- **Logic**:
  - The API verifies the user.
  - Instantiates a `stripe.checkout.sessions.create` call.
  - Attaches `client_reference_id` to the user's UUID so the webhook knows who paid.
  - Enforces `subscription_data.trial_settings` to allow a trial if they haven't exhausted it.
  - Returns a secure, hosted `url` to redirect the mobile `WebBrowser`.

## 3. Webhook Verification
- **Endpoint**: `POST /stripe/webhook`
- **Security**: The payload is parsed using raw Buffers (enabled via `app.useBodyParser('json', { rawBody: true })` in NestJS).
- **Signature Check**: Uses `stripe.webhooks.constructEvent(payload, signature, secret)`. If the signature doesn't match the `.env` webhook secret, the request is instantly rejected, preventing replay or spoofing attacks.

## 4. Subscription Updates
- **Events Listened For**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Database Mutator**: Updates the User's `stripeSubscriptionId`, `stripeCustomerId`, `subscriptionStatus` (active, past_due, canceled), and `currentPeriodEnd` timestamp based on the incoming event payload.

## 5. Expired Subscriptions
- **Detection**: If `subscriptionStatus` is not `active` and `trialEndsAt` is in the past, the user is deemed expired.
- **Consequence**: The mobile app replaces the `Subscription` tab with a Paywall.

## 6. SubscriptionGuard Protection
- **Implementation**: Registered as a global guard in `AppModule`.
- **Logic**: 
  - Allows `GET` requests (Read-Only) unconditionally.
  - Allows `/auth/*` and `/stripe/*` routes unconditionally.
  - Blocks `POST`, `PATCH`, `PUT`, `DELETE` if the user is not actively subscribed or trialing.
  - Emits a `403 Forbidden` response.
