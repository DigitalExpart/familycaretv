# FamilyCare TV QA Checklist

This document provides a standardized, repeatable testing framework to verify system integrity prior to Roku integration and App Store releases.

## 1. Authentication
| Test ID | Steps | Expected Result |
|---|---|---|
| `AUTH-01` | Launch app, enter valid email and password in Register screen. | Account is created. User is navigated to the Dashboard. |
| `AUTH-02` | Enter an email that already exists. | App displays "Email already in use" validation error. |
| `AUTH-03` | Log out and log back in with the created credentials. | User successfully enters the Dashboard and token is persisted. |

## 2. Patients (Core CRUD)
| Test ID | Steps | Expected Result |
|---|---|---|
| `PAT-01` | Navigate to Patients tab, tap "Add Patient", fill demographic form. | Patient is created and appears in the list. |
| `PAT-02` | Tap on the newly created patient card. | Navigates to Patient Details screen showing correct info. |
| `PAT-03` | Edit patient name and save. | List and Details immediately reflect the updated name. |
| `PAT-04` | Tap Delete patient. | Patient is permanently removed from the list. |

## 3. Sub-resources (Doctors, Contacts, Medications, Events, Notes)
*Execute the following for each sub-resource module inside a Patient Details view.*
| Test ID | Steps | Expected Result |
|---|---|---|
| `SUB-01` | Tap "Add [Resource]", fill out required fields, submit. | Resource is successfully created and attached to the patient. |
| `SUB-02` | Tap to edit the resource, change a field, submit. | Resource updates on screen. |
| `SUB-03` | Tap to delete the resource. | Resource is removed from the patient's sub-list. |

## 4. AI Medication Lookup
| Test ID | Steps | Expected Result |
|---|---|---|
| `AI-01` | Navigate to Medications. Add a generic medication (e.g., "Tylenol"). | The OpenAI Integration fetches Side Effects and Warnings within 3 seconds. |
| `AI-02` | Change Locale to Spanish. Add another medication. | The AI response and medical disclaimer are returned in Spanish. |

## 5. Stripe Subscriptions
| Test ID | Steps | Expected Result |
|---|---|---|
| `SUB-01` | Register a new account, check the Subscription tab. | The UI displays "14 days remaining on trial". API calls (POST/PATCH) succeed. |
| `SUB-02` | In Stripe Dashboard, forcefully expire the trial for the User. Refresh App. | Subscription tab displays "$4.99/mo" Paywall. |
| `SUB-03` | With expired trial, attempt to Add a Patient. | The App catches a `403 Forbidden` and displays "Subscription Required" error. |
| `SUB-04` | Tap "Subscribe", enter test card (`4242...`). | Checkout succeeds. App refreshes and removes Paywall. Add Patient succeeds. |

## 6. Admin CMS
| Test ID | Steps | Expected Result |
|---|---|---|
| `ADM-01` | Open `http://localhost:3001` (Admin Next.js). | Renders Admin Login page. |
| `ADM-02` | Log in with super-admin credentials. | Displays total user count, global patient metrics, and server health. |
| `ADM-03` | View Users List. | Admins can safely read-only the User registry without modifying Stripe data. |
