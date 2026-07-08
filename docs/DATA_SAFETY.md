# Google Play Data Safety Form Answers

*Use this document as a guide when filling out the Data Safety section in the Google Play Console.*

## 1. Data Collection and Security
- **Does your app collect or share any of the required user data types?** Yes.
- **Is all of the user data collected by your app encrypted in transit?** Yes (via HTTPS).
- **Do you provide a way for users to request that their data be deleted?** Yes.

## 2. Data Types Collected

### Personal Info
- **Name:** Collected. (Optional/Required for account creation). Used for App Functionality.
- **Email Address:** Collected. Used for App Functionality, Account Management.
- **User IDs:** Collected. Used for App Functionality.

### Health and Fitness
- **Health Info (Medications, Medical Notes):** Collected. Used for App Functionality. Not shared with third-party advertising.

### Messages
- **Other in-app messages (AI Chat):** Collected. Used for App Functionality.

### App Info and Performance
- **Crash logs / Diagnostics:** Collected. Used for Analytics and App Functionality.

### Device or other IDs
- **Device IDs (Expo Push Tokens):** Collected. Used strictly for delivering Push Notifications (App Functionality).

## 3. Data Sharing
- **Do you share user data with third parties?** Yes.
- **Which third parties?** 
  - *Stripe* (For processing subscription payments - strict compliance).
  - *OpenAI* (For processing user text prompts in the AI assistant - data is NOT used for training their models).
  - *Expo / Google FCM* (For routing push notifications to the device).
- **Is data shared for advertising?** No.

## 4. Children's Privacy
- **Does your app target children?** No. Target audience is strictly 18+ (Caregivers, Parents, Adult Patients). Although the app manages "Kids" profiles, the app itself is operated by adults.
