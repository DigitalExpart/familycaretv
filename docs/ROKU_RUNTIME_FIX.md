# Roku BrightScript Runtime Fix Report (`GetApiBaseUrl()`)

**Project**: FamilyCare TV Roku  
**Issue**: BrightScript Runtime Crash `&h91` in `DeviceLinkScene.brs(50)`  
**Status**: RESOLVED & VERIFIED  

---

## 1. Executive Summary

During execution on a physical Roku device, the Telnet console reported an uncaught runtime exception when activation polling attempted to print the polling request URL:

```text
Function is not defined in component's namespace (runtime error &h91) in pkg:/components/scenes/DeviceLinkScene.brs(50)
Backtrace:
#0 Function pollfortoken() As Void
   file/line: pkg:/components/scenes/DeviceLinkScene.brs(50)
Local Variables:
   ...
Source Code:
050:* print "=== [ACTIVATION TRACE STEP 2] Polling URL: "; GetApiBaseUrl() + "/roku/token"; " ==="
```

---

## 2. Root Cause Analysis

In Roku BrightScript SceneGraph architecture:
1. Functions declared in global source files (such as `source/Config.brs`) run within the main thread scope by default.
2. Each SceneGraph component (`DeviceLinkScene`, `SplashScene`, etc.) runs in its own isolated component thread namespace.
3. For a SceneGraph component to invoke a helper function defined in `source/Config.brs` (like `GetApiBaseUrl()`), that component's `.xml` file **must explicitly include** `<script type="text/brightscript" uri="pkg:/source/Config.brs" />`.

[`DeviceLinkScene.xml`](file:///c:/Users/Shilley%20Pc/FamilyCare%20TV%20Full%20Platform%20Build/roku/components/scenes/DeviceLinkScene.xml) contained `<script type="text/brightscript" uri="pkg:/source/RegistryService.brs" />`, but was missing the script tag for `Config.brs`. Consequently, when `PollForToken()` ran on line 50 and attempted to call `GetApiBaseUrl()`, Roku OS threw runtime error `&h91` ("Function is not defined in component's namespace") and terminated the script thread before the HTTP request could be sent.

---

## 3. Remediations Applied

### 1. Added Script Import in `DeviceLinkScene.xml`
- **File**: [`roku/components/scenes/DeviceLinkScene.xml`](file:///c:/Users/Shilley%20Pc/FamilyCare%20TV%20Full%20Platform%20Build/roku/components/scenes/DeviceLinkScene.xml#L7)
- **Change**: Added `<script type="text/brightscript" uri="pkg:/source/Config.brs" />`.

```xml
<component name="DeviceLinkScene" extends="Group">
    <interface>
        <field id="navigate" type="string" alwaysNotify="true" />
    </interface>
    <script type="text/brightscript" uri="pkg:/components/scenes/DeviceLinkScene.brs" />
    <script type="text/brightscript" uri="pkg:/source/Config.brs" />
    <script type="text/brightscript" uri="pkg:/source/RegistryService.brs" />
```

### 2. Centralized Base URL Helper in `ApiService.brs`
- **File**: [`roku/source/ApiService.brs`](file:///c:/Users/Shilley%20Pc/FamilyCare%20TV%20Full%20Platform%20Build/roku/source/ApiService.brs#L9)
- **Change**: Added helper `GetBaseUrl()` mapping for centralized API service delegation.

```brightscript
function GetBaseUrl() as String
    return GetApiBaseUrl()
end function
```

### 3. Full Audit of `GetApiBaseUrl()` Callers Across Workspace
Audited every caller of `GetApiBaseUrl()` to ensure proper script imports:
1. `ApiTask.brs`: `ApiTask.xml` imports `pkg:/source/Config.brs`. **[VALID]**
2. `PollingTask.brs`: `PollingTask.xml` imports `pkg:/source/Config.brs`. **[VALID]**
3. `DeviceLinkScene.brs`: `DeviceLinkScene.xml` now imports `pkg:/source/Config.brs`. **[FIXED]**

---

## 4. Verification Steps & Package Generation

1. **Manifest & Zip Build**: Executed `pack_roku.py` to regenerate a clean deployment zip (`FamilyCareTV_Roku.zip`).
2. **Telnet Log Verification**: Confirmed `PollForToken()` executes line 50 cleanly without throwing runtime error `&h91`.
3. **Activation Execution Sequence**:
   - `DeviceLinkScene` displays code.
   - Polling starts every 5 seconds.
   - Server returns token response.
   - App saves token in Registry and auto-navigates to `HomeScene`.
