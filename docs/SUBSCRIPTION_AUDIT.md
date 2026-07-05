# Subscription Audit

## Scope
Verify the handling of the Free Trial, Personal, and Family plan tiers, including feature gates and limits.

## Verifications

### 1. Free Trial
- ✅ Automatically granted for 14 days upon registration.
- ✅ System correctly expires users to restricted access after 14 days without payment.
- ✅ AI usage and family features are strictly capped.

### 2. Personal Plan
- ✅ Allows standard feature access (Patients, Medications, Tasks, Kids, Pets, Appointments).
- ✅ Unlocks extended AI features within defined quota limits.

### 3. Family Plan
- ✅ Allows generating invites to add other users to the plan.
- ✅ Properly maps the `FamilyMember` table to the owner's subscription tier.
- ✅ Grants family members the equivalent of a Personal Plan access without separate billing.
- ✅ Deep linking correctly routes family invite notifications to the acceptance screen.

### 4. Stripe Webhooks
- ✅ Downgrades user to `FREE_TRIAL` (expired state) upon subscription cancellation/payment failure.
- ✅ Upgrades user immediately upon `invoice.payment_succeeded`.

## Conclusion
✅ **PASS**. Subscription billing, tier limits, and family grouping are accurately enforced across the platform.
