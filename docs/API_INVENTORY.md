# FamilyCare TV API Inventory

This document outlines all currently active endpoints in the NestJS backend API.

## Global Policies
- **Authentication**: All routes (unless specified otherwise) require a Bearer token (`@UseGuards(JwtAuthGuard)`).
- **Subscription**: All mutating routes (`POST`, `PATCH`, `PUT`, `DELETE`) require an active or trialing subscription (`SubscriptionGuard`), unless it's a webhook.

---

### 1. Authentication
**`POST /auth/register`**
- **Auth Required**: No
- **Request Body**: `email`, `password`, `firstName`, `lastName`
- **Response**: `{ accessToken, refreshToken, user }`
- **Errors**: `400 Bad Request` (Invalid payload), `409 Conflict` (Email exists)

**`POST /auth/login`**
- **Auth Required**: No
- **Request Body**: `email`, `password`
- **Response**: `{ accessToken, refreshToken, user }`
- **Errors**: `401 Unauthorized`

---

### 2. Users
**`GET /users/me`**
- **Auth Required**: Yes (User/Admin)
- **Response**: User object with `subscriptionStatus`, `stripeCustomerId`, etc.
- **Errors**: `404 Not Found`, `401 Unauthorized`

---

### 3. Patients
**`GET /patients`**
- **Auth Required**: Yes
- **Response**: `Patient[]` belonging to the authenticated User.

**`GET /patients/:id`**
- **Auth Required**: Yes
- **Response**: `Patient` object (includes nested relations like doctors, medications if queried).
- **Errors**: `404 Not Found`

**`POST /patients`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: `fullName`, `dateOfBirth`, `gender`, `notes`
- **Response**: Created `Patient`
- **Errors**: `403 Forbidden` (Subscription expired)

**`PATCH /patients/:id`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: Partial `Patient` fields
- **Response**: Updated `Patient`

**`DELETE /patients/:id`**
- **Auth Required**: Yes + Active Subscription
- **Response**: `200 OK`

---

### 4. Doctors
**`GET /doctors/patient/:patientId`**
- **Auth Required**: Yes
- **Response**: `Doctor[]`

**`POST /doctors`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: `patientId`, `name`, `specialty`, `phone`, `email`
- **Response**: Created `Doctor`

**`PATCH /doctors/:id`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: Partial Doctor fields
- **Response**: Updated `Doctor`

**`DELETE /doctors/:id`**
- **Auth Required**: Yes + Active Subscription

---

### 5. Emergency Contacts
**`GET /emergency-contacts/patient/:patientId`**
- **Auth Required**: Yes
- **Response**: `EmergencyContact[]`

**`POST /emergency-contacts`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: `patientId`, `name`, `relationship`, `phone`

**`PATCH /emergency-contacts/:id`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: Partial Contact fields

**`DELETE /emergency-contacts/:id`**
- **Auth Required**: Yes + Active Subscription

---

### 6. Medications
**`GET /medications/patient/:patientId`**
- **Auth Required**: Yes
- **Response**: `Medication[]`

**`POST /medications`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: `patientId`, `name`, `dosage`, `frequency`, `purpose`, `sideEffects`

**`PATCH /medications/:id`**
- **Auth Required**: Yes + Active Subscription

**`DELETE /medications/:id`**
- **Auth Required**: Yes + Active Subscription

---

### 7. AI Lookup (Medications)
**`POST /ai/medication-lookup`**
- **Auth Required**: Yes
- **Request Body**: `name` (string), `language` (en/es)
- **Response**: `{ cached: boolean, data: { purpose, sideEffects, warnings }, disclaimer }`
- **Errors**: `500 Internal Server Error` (OpenAI timeout)

---

### 8. Events
**`GET /events/patient/:patientId`**
- **Auth Required**: Yes
- **Response**: `Event[]`

**`POST /events`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: `patientId`, `title`, `description`, `type` (APPOINTMENT/MEDICATION/TASK), `startDateTime`

**`PATCH /events/:id`**
- **Auth Required**: Yes + Active Subscription

**`DELETE /events/:id`**
- **Auth Required**: Yes + Active Subscription

---

### 9. Notes
**`GET /notes/patient/:patientId`**
- **Auth Required**: Yes
- **Response**: `PatientNote[]`

**`POST /notes`**
- **Auth Required**: Yes + Active Subscription
- **Request Body**: `patientId`, `title`, `content`

**`PATCH /notes/:id`**
- **Auth Required**: Yes + Active Subscription

**`DELETE /notes/:id`**
- **Auth Required**: Yes + Active Subscription

---

### 10. Stripe & Subscriptions
**`GET /stripe/status`**
- **Auth Required**: Yes
- **Response**: `{ status: string, trialEndsAt: date, currentPeriodEnd: date }`

**`POST /stripe/create-checkout-session`**
- **Auth Required**: Yes
- **Response**: `{ url: string }` (Stripe Checkout redirect URL)

**`POST /stripe/webhook`**
- **Auth Required**: No (Uses Stripe Signature Validation)
- **Request Body**: Raw Buffer
- **Headers**: `stripe-signature` required
- **Response**: `200 OK` (received: true)
- **Errors**: `400 Bad Request` (Invalid Signature)
