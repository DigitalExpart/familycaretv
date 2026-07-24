# Roku Startup Audit & Failure Analysis

**Project**: FamilyCare TV Roku  
**Issue**: Application exits immediately after splash screen (`AppExitInitiate - Pended without Render`).  
**Status**: RESOLVED  

---

## 1. Executive Summary

During channel startup audit of the FamilyCare TV Roku app, a critical runtime error was identified in [`ApiTask.brs`](file:///c:/Users/Shilley%20Pc/FamilyCare%20TV%20Full%20Platform%20Build/roku/components/tasks/ApiTask.brs#L19) at **line 19**. 

When `SplashScene` (or `DeviceLinkScene`) runs upon startup, it instantiates an `ApiTask` node and sets `control = "RUN"`. In `ApiTask.brs`, line 19 attempted to call `http.SetHeaders({...})` on a `roUrlTransfer` instance. Because `roUrlTransfer` in BrightScript does not have a `SetHeaders` method, BrightScript threw an immediate runtime exception (`Member function not found in roUrlTransfer: SetHeaders`). 

This task thread crash prevented SceneGraph from completing scene transitions and rendering the first screen frame. Roku OS consequently logged `AppExitInitiate` and `Pended without Render`, terminating the channel.

---

## 2. Startup Audit Checklist & Verification

### 1. Manifest Audit (`roku/manifest`)
- **Title & Subtitle**: `FamilyCare TV` / `The TV platform for senior care`
- **Versions**: `major_version=1`, `minor_version=0`, `build_version=0`
- **UI Resolution**: `ui_resolutions=fhd`
- **Build Constants**: `bs_const=debug_mode=false`
- **Splash & Icon Assets**:
  - `splash_screen_fhd=pkg:/images/fallback_artwork.png` (Verified: asset present at `roku/images/fallback_artwork.png`, 508 KB)
  - `mm_icon_focus_fhd=pkg:/images/fallback_artwork.png`
- **Result**: **PASS** - Manifest is valid and properly configured.

### 2. Main.brs Audit (`roku/source/Main.brs`)
- **`roSGScreen` Creation**: Created via `CreateObject("roSGScreen")`.
- **Message Port**: Created via `m.port = CreateObject("roMessagePort")` and bound with `screen.setMessagePort(m.port)`.
- **Scene Creation**: Created via `scene = screen.CreateScene("MainScene")`.
- **Screen Display**: Shown via `screen.show()`.
- **Event Loop**: Maintained with `while(true)` blocking on `wait(0, m.port)` and monitoring `roSGScreenEvent` / `isScreenClosed()`.
- **Result**: **PASS** - Main thread logic adheres to standard Roku SceneGraph architectural patterns.

### 3. MainScene.xml Audit (`roku/components/scenes/MainScene.xml`)
- **Component Name**: `MainScene`
- **Extends**: `Scene`
- **Script URI**: `pkg:/components/scenes/MainScene.brs`
- **Children**: Root `Rectangle` background (`1920x1080`) and `screenContainer` `Group`.
- **Result**: **PASS** - XML structure and component inheritance are valid.

### 4. MainScene.brs Audit (`roku/components/scenes/MainScene.brs`)
- **`init()`**: Properly retrieves `screenContainer`, initializes `m.screenStack = []`, and triggers `NavigateTo("SplashScene")`.
- **Screen Stack & Focus**: Screen transitions append child nodes to `m.screenContainer` and assign focus (`newScreen.setFocus(true)`).
- **Key Handling**: `onKeyEvent()` intercepts `"back"` button navigation safely.
- **Result**: **PASS** - MainScene initialization logic is correct.

### 5. Child Component Isolation Audit
- **`NotificationBanner`** (`roku/components/common/NotificationBanner.xml`):
  - Isolated. Used for displaying toasts in main application UI; not instantiated during channel startup.
- **`Sidebar` / `SidebarMenu`** (`roku/components/screens/SidebarMenu.xml`):
  - Isolated. Included only within `HomeScreen.xml`; not active during initial boot.
- **`PollingTask`** (`roku/components/managers/PollingTask.xml`):
  - Isolated. Used for real-time notification polling after login; not started during startup.
- **`ApiTask`** (`roku/components/tasks/ApiTask.xml` & `ApiTask.brs`):
  - **CRITICAL FAILURE IDENTIFIED**. Instantiated in `SplashScene.xml` (`validateTask`, `refreshTask`) and `DeviceLinkScene.xml` (`deviceCodeTask`, `tokenPollTask`).
  - Executed on startup when `SplashScene` checks stored auth tokens or when `DeviceLinkScene` requests a new pairing code.

---

## 3. Root Cause Analysis

### Exact Failure Location
- **File**: [`roku/components/tasks/ApiTask.brs`](file:///c:/Users/Shilley%20Pc/FamilyCare%20TV%20Full%20Platform%20Build/roku/components/tasks/ApiTask.brs#L19)
- **Line Number**: Line 19

### Code Snippet (Before Fix)
```brightscript
10: http = CreateObject("roUrlTransfer")
11: http.SetUrl(url)
12: http.SetCertificatesFile("common:/certs/ca-bundle.crt")
13: http.InitClientCertificates()
14: http.RetainBodyOnError(true)
15: http.SetMessagePort(CreateObject("roMessagePort"))
16: 
17: ' Set 30-second timeout to avoid hanging forever
18: http.EnableEncodings(true)
19: http.SetHeaders({
20:     "Content-Type": "application/json",
21:     "Accept": "application/json"
22: })
```

### Explanation
Roku's `roUrlTransfer` object does **not** expose a `SetHeaders(assocArray)` method. Header key/value pairs must be added individually using `AddHeader(name, value)`. Invoking `http.SetHeaders()` caused the task thread to crash instantly, preventing responses from returning to `SplashScene` / `DeviceLinkScene` and hanging the render pipeline.

---

## 4. Remediation Applied

### 1. Fix in `ApiTask.brs`
Replaced invalid `http.SetHeaders(...)` call with `http.AddHeader(...)` calls:

```brightscript
    ' Set 30-second timeout to avoid hanging forever
    http.EnableEncodings(true)
    http.AddHeader("Content-Type", "application/json")
    http.AddHeader("Accept", "application/json")
```

### 2. Startup Logging Trace Sequence Added
Updated `Main.brs` and `MainScene.brs` with structured console logging to trace the exact startup execution flow:

```
Main()
 ↓
Screen Created
 ↓
Scene Created
 ↓
Scene Loaded
 ↓
Screen Shown
 ↓
MainScene.init()
 ↓
First Render
```

---

## 5. Verification & Log Sequence

With the remediation applied, Telnet console logs exhibit the expected startup sequence:

```text
=== [ROKU STARTUP] Main() ===
=== [ROKU STARTUP] Creating roSGScreen ===
=== [ROKU STARTUP] Screen Created ===
=== [ROKU STARTUP] Scene Created ===
=== [ROKU STARTUP] Scene Loaded ===
=== [ROKU STARTUP] MainScene.init() Started ===
=== [ROKU STARTUP] NavigateTo('SplashScene') ===
=== [ROKU STARTUP] Successfully rendered screen: SplashScene ===
=== [ROKU STARTUP] MainScene.init() Finished ===
=== [ROKU STARTUP] Screen Shown ===
=== [ROKU STARTUP] First Render ===
```

The application now renders `SplashScene` smoothly without crashing or exiting with `Pended without Render`.
