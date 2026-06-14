# FamilyCare TV Internationalization (i18n) Audit

## Overview
FamilyCare TV implements `i18next` and `react-i18next` in the mobile application to support dynamic locale switching between English (`en`) and Spanish (`es`).

## Coverage Status
A scan of the UI components and dictionary files reveals the following implementation status:

### Fully Covered Areas
- **Login / Registration**: Username, Password, Name inputs, Call to Action buttons, and "Already have an account?" links are translated.
- **Dashboard Navigation**: Tabs (Dashboard, Patients, Setup) are localized using `t('common.dashboard')`, etc.
- **Patients CRUD**: Patient cards, "Add Patient" buttons, and demographic forms are localized.
- **Doctors CRUD**: Titles, specialized inputs, and empty states map to `doctors.*` dictionary keys.
- **Emergency Contacts CRUD**: Labels map to `emergencyContacts.*`.
- **Medications CRUD**: Form validations, name, dosage, frequency inputs are covered.
- **Notes CRUD**: The Notes module UI keys are mapped cleanly.
- **Events CRUD**: Event lists and creation modals are fully supported.

### Validation & Error Messages
- The `zod` schemas inside the mobile application currently utilize localized error messages mapping to `validation.*` in the dictionary files.
- Axios interceptor errors map generic HTTP failures to `errors.network`, `errors.unauthorized`.

### Hardcoded English Strings (Action Required)
During the audit, the following screens/components were identified as having statically hardcoded English text that needs updating before production:
1. **Subscription Paywall**: The `$4.99/month` and `Subscribe Now` texts in `subscription.tsx` are hardcoded.
2. **AI Medication Lookup**: The OpenAI prompt forces English. The response disclaimer string (`disclaimer`) returned from the backend is dynamically generated in English. A Spanish override (`language: 'es'`) parameter was added to the endpoint, but the fallback UI text relies on English.
3. **Delete Confirmations**: Some `Alert.alert("Delete Patient?", "Are you sure?")` dialogs in the patient screens bypass `i18next`.

## Remediation Plan
1. Extract the remaining text from the Subscription screen into `en.json` and `es.json`.
2. Wrap `Alert.alert` calls with `t()`.
3. Ensure the AI prompt generator leverages the `language` request parameter correctly.
