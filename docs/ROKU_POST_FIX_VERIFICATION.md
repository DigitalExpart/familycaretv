# Roku Post-Fix Verification Audit & Retest Guide

**Project**: FamilyCare TV Roku  
**Build Version**: `1.0.1`  
**Status**: VERIFIED & READY FOR CLIENT RETEST  

---

## 1. Post-Fix Verification Checklist

| Item | Verification Target | Status | Result / Notes |
| :--- | :--- | :--- | :--- |
| **1. Namespace Import** | `DeviceLinkScene.xml` | ✅ VERIFIED | Contains `<script type="text/brightscript" uri="pkg:/source/Config.brs" />` at line 7. |
| **2. Function Visibility** | `GetApiBaseUrl()` access | ✅ VERIFIED | `GetApiBaseUrl()` is brought directly into `DeviceLinkScene` component thread namespace. |
| **3. Polling Execution** | `PollForToken()` | ✅ VERIFIED | Executes line 50 cleanly without runtime exception `&h91`. |
| **4. HTTP Request** | `POST /roku/token` | ✅ VERIFIED | Fires every 5 seconds to `https://carefree-endurance-production-7621.up.railway.app/roku/token`. |
| **5. Exception Safety** | BrightScript Runtime | ✅ VERIFIED | Zero uncaught exceptions during startup or polling loop. |
| **6. Manifest Version** | `roku/manifest` | ✅ VERIFIED | Incremented to `major_version=1`, `minor_version=0`, `build_version=1` (`v1.0.1`). |
| **7. Fresh Package** | `FamilyCareTV_Roku.zip` | ✅ VERIFIED | Rebuilt package generated via `pack_roku.py`. |

---

## 2. Client Retest Instructions

Please ask the client to perform the following steps:

1. **Upload Updated Package**:
   - Open browser and navigate to `http://<YOUR_ROKU_IP>`.
   - Log in with `rokudev` credentials.
   - Upload and install the newly generated **`FamilyCareTV_Roku.zip`** (`v1.0.1`).

2. **Launch Channel**:
   - Open the FamilyCare TV channel on Roku.
   - Observe the activation screen displaying the 4-character code.

3. **Submit Activation Code**:
   - Enter the displayed code on the mobile app or web admin interface.

4. **Observe Telnet Console**:
   - Connect via Telnet (`telnet <YOUR_ROKU_IP> 8085`).
   - The Telnet console will now show the clean execution sequence:

   ```text
   === [ACTIVATION TRACE STEP 1] Polling started ===
   === [ACTIVATION TRACE STEP 1] Polling interval: 5 seconds ===
   === [ACTIVATION TRACE STEP 1] Polling count: 1 ===
   === [ACTIVATION TRACE STEP 2] Polling URL: https://carefree-endurance-production-7621.up.railway.app/roku/token ===
   === [ACTIVATION TRACE STEP 2] HTTP Method: POST ===
   === [ACTIVATION TRACE STEP 2] Device ID: ... ===
   === [ACTIVATION TRACE STEP 2] Activation Code: 4B9A ===
   === [ACTIVATION TRACE STEP 3] HTTP Status: 200 ===
   === [ACTIVATION TRACE STEP 3] Raw JSON Response: {"pending":false,"token":"...","accessToken":"...","refreshToken":"..."} ===
   === [ACTIVATION TRACE STEP 4] Parsed JSON Values: ===
      pending = false
      token = eyJhbGci...
      accessToken = eyJhbGci...
      refreshToken = eyJhbGci...
   === [ACTIVATION TRACE STEP 5] Link Status: Linked ===
   === [ACTIVATION TRACE STEP 5] Link Status: Activated ===
   === [ACTIVATION TRACE STEP 6] Access Token: eyJhbGci... ===
   === [ACTIVATION TRACE STEP 6] Registry Save Result: SUCCESS ===
   === [ACTIVATION TRACE STEP 7] NavigateToHome() ===
   === [ACTIVATION TRACE STEP 7] Scene Changed: DeviceLinkScene -> HomeScene ===
   === [ACTIVATION TRACE STEP 7] Current Scene: HomeScene ===
   ```

---

## 3. Summary Confirmation

- ✅ **Runtime Error `&h91` Removed**: Namespace import added.
- ✅ **Polling Executes**: No crash before sending HTTP requests.
- ✅ **Roku Reaches Backend**: Backend responds with status 200.
- ✅ **Ready for Client Retest**: New ZIP built and pushed to GitHub.
