# Familycare-tv
FamilyCare TV - A connected caregiving platform for Roku Channel, Mobile App, and Web App.

## Push Notifications and EAS Build
Since Expo SDK 53, Expo Go no longer supports remote push notifications directly out of the box without using EAS credentials. 
To test Push Notifications on physical devices, you must build the app using EAS (Expo Application Services).

### EAS Build Instructions

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure Project**:
   Ensure your `app.json` contains the `eas.projectId` under the `extra` configuration block:
   ```json
   "extra": {
     "eas": {
       "projectId": "YOUR_PROJECT_ID"
     }
   }
   ```
   If not, run `eas init` to link your local project to Expo.

4. **Run a Development Build** (for iOS simulator or Android physical device):
   ```bash
   cd apps/mobile
   eas build --profile development --platform android
   ```
   *(For iOS development build on a physical device, you need an Apple Developer account).*

5. **Install the Build**:
   Once the build completes, EAS will provide a QR code or a link to download the APK (Android) or install via TestFlight / Ad-hoc (iOS). 

6. **Start the Dev Server**:
   ```bash
   npx expo start --dev-client
   ```
   Scan the QR code from the installed development build instead of the standard Expo Go app.

7. **Push Notification Testing**:
   After logging into the Dev Build, you can test Push Notifications by allowing permissions. The app will fetch an Expo Push Token and send it to the backend `PATCH /users/me/push-token`.
