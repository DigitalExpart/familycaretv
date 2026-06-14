# FamilyCare TV Production Readiness Audit

## Environment Variables
The following secrets are required to be injected into the production environment (e.g., Vercel, Heroku, AWS, EAS).

### Backend (`apps/api`)
- `DATABASE_URL`: Connection string for Supabase PostgreSQL.
- `JWT_SECRET`: Cryptographically secure secret for signing Access Tokens.
- `STRIPE_SECRET_KEY`: Production Stripe API Key (`sk_live_...`).
- `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (`whsec_...`).
- `OPENAI_API_KEY`: Active OpenAI token for the Medication AI Lookup.

### Mobile (`apps/mobile`)
- `EXPO_PUBLIC_API_URL`: The fully qualified domain name of the deployed NestJS API (e.g., `https://api.familycare.tv`).

### Admin (`apps/admin`)
- `NEXT_PUBLIC_API_URL`: The fully qualified domain name of the API.

## Codebase Checks

### 1. No Secrets Committed
- **Status:** PASS
- **Details:** The `.gitignore` successfully excludes `.env`. Placeholder values are stored in documentation/walkthroughs safely.

### 2. TypeScript Compilation
- **Status:** PASS
- **Details:** `apps/api` builds successfully (`npm run build`). The shared `packages/shared-types` compiles correctly without strict null-check failures.

### 3. Database Parity
- **Status:** PASS
- **Details:** The Prisma schema (`schema.prisma`) matches the current Supabase topology. The `prisma db push` and `prisma generate` scripts execute flawlessly across the monorepo workspace.

## Deployment Pathway
1. **Database**: Spin up Supabase production cluster.
2. **Backend**: Deploy `apps/api` (NestJS) to a Node runtime and inject env vars.
3. **Admin**: Deploy `apps/admin` (Next.js) to Vercel/Netlify.
4. **Mobile**: Build production APK/IPA using Expo Application Services (`eas build`).
