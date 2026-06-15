# FamilyCare TV: Roku SceneGraph Architecture

This document defines the SceneGraph architecture and structural patterns for the FamilyCare TV Roku Channel, ensuring scalable, high-performance BrightScript development.

---

## 1. Application Structure

The repository will follow the standard Roku channel structure, utilizing the `components/` directory for XML/BrightScript pairs and `source/` for global/main logic.

```text
apps/roku/
├── components/
│   ├── MainScene.xml / .brs           # Root Scene
│   ├── common/                        # Reusable UI Elements
│   │   ├── PremiumCard.xml / .brs
│   │   ├── MetricPill.xml / .brs
│   │   └── AnimatedButton.xml / .brs
│   ├── screens/                       # Top-Level Screens
│   │   ├── AuthScreen.xml / .brs
│   │   ├── HomeScreen.xml / .brs
│   │   └── PatientScreen.xml / .brs
│   ├── managers/                      # Non-visual business logic components
│   │   ├── ApiManager.xml / .brs
│   │   └── NavigationManager.xml / .brs
│   └── screensaver/                   # Dedicated Screensaver components
│       ├── ScreensaverScene.xml / .brs
│       └── BouncingVerse.xml / .brs
├── images/                            # Static assets
├── locale/                            # Localization files (en_US, es_MX)
├── source/
│   ├── main.brs                       # Channel entry point
│   ├── screensaver.brs                # Screensaver entry point
│   └── utils.brs                      # Global utility functions
└── manifest                           # Channel configuration
```

---

## 2. Scene Hierarchy

The application utilizes a single `Scene` node (`MainScene`), which dynamically swaps out child screens. This avoids memory leaks and keeps global state accessible.

```text
[MainScene] (Root)
 ├── [Global Overlay] (Dialogs, Error Toasts)
 ├── [NavigationManager] (Handles screen history stack)
 ├── [ApiManager] (Background task runner)
 └── [CurrentScreen] (e.g., HomeScreen or AuthScreen)
      ├── [Background Art]
      ├── [Sidebar Menu]
      └── [Content Area]
```

---

## 3. Navigation Manager

Navigation on Roku relies heavily on `focus`. We will implement a `NavigationManager` node acting as a state machine.

* **Stack-Based Routing:** `NavigationManager` maintains an array of `roSGNode` references representing the navigation stack.
* **Push/Pop Mechanism:** When pushing a new screen, the old screen has `visible=false` and is pushed to the stack. The new screen gets `visible=true` and `setFocus(true)`.
* **Back Behavior:** When the user presses the `Back` button, `MainScene` intercepts the key press, triggers the NavigationManager to pop the stack, destroys the top node to free memory, and restores focus to the previous screen.

---

## 4. Reusable Components

To achieve the design defined in `ROKU_VISUAL_DESIGN_SYSTEM.md`, we will abstract standard nodes into custom components.

* **`PremiumCard`:** Extends `Group`. Contains a `Poster` (image), two `Label` nodes (Title, Subtitle), and a `Rectangle` for the focus border ring. Handles its own `onFocusChange` observer to trigger the 1.05x scale animation.
* **`SidebarMenu`:** Extends `Group`. Contains a `LabelList` for primary navigation.
* **`MetricPill`:** A rounded `Rectangle` containing an icon and text, used heavily on the Dashboard and Patient screens.

---

## 5. Service Layer

Network requests in SceneGraph cannot block the UI thread. The Service layer is managed via `Task` nodes.

* **`ApiTask`**: A generic `Task` node that handles all HTTP requests using `roUrlTransfer`.
* **Flow**:
  1. `HomeScreen.brs` sets `ApiTask.request = { endpoint: "/dashboard", method: "GET" }`
  2. `HomeScreen.brs` sets `ApiTask.control = "RUN"`
  3. `HomeScreen.brs` observes `ApiTask.response`.
  4. The `ApiTask` executes the network call asynchronously and populates the `response` field.
  5. The observer callback in `HomeScreen.brs` parses the JSON and populates the UI.

---

## 6. API Integration Strategy

* **Auth Token Management:** The `accessToken` and `refreshToken` are stored securely in the Roku Registry (`roRegistrySection`).
* **Interceptors:** A utility function `makeRequest()` wraps all `ApiTask` configurations, automatically injecting the `Authorization: Bearer <token>` header.
* **Polling:** For the device linking flow, an `AuthTask` will use `roMessagePort` with `roTimer` to poll `POST /roku/token` every 5 seconds until the device is linked.

---

## 7. Localization Architecture

Roku provides native localization support via the `locale/` directory structure.

* **XLIFF Files:** Strings will be stored in `locale/default/translations.xml`.
* **Implementation:** Instead of hardcoding text, UI components will use the `tr()` global function.
  * Example: `label.text = tr("Dashboard_Title")`
* **Overrides:** Date formatting and time zones will rely on `roDateTime.ToLocalTime()`.

---

## 8. Asset Management

* **Resolution:** All hardcoded assets in `images/` will be designed at 1080p (FHD).
* **Downscaling:** Roku OS automatically scales assets down for 720p devices if `ui_resolutions=FHD` is set in the `manifest`.
* **Dynamic Assets:** Album art, avatars, and drawings fetched from the API must be dynamically sized using the `loadWidth` and `loadHeight` properties of the `Poster` node to minimize memory consumption.

---

## 9. Screensaver Component Architecture

The Screensaver runs completely isolated from the main channel entry point.

* **Entry:** `source/screensaver.brs` implements `RunScreenSaver()`.
* **Scene:** `ScreensaverScene.xml` replaces `MainScene`.
* **Logic:** It fetches data from `GET /roku/screensaver` via an `ApiTask`.
* **Burn-in Protection:** A `Timer` node fires every 10 seconds, triggering an `Animation` node that subtly shifts the X/Y coordinates of the Verse container and background artwork to ensure no pixel remains static.

---

## 10. Performance Guidelines

To ensure the app runs flawlessly even on older Roku Express models:

1. **Node Reuse:** Instead of creating and destroying nodes rapidly (e.g., in lists), use `MarkupGrid` and `RowList` nodes which natively handle memory recycling (object pooling).
2. **Minimal Overdraw:** Do not stack invisible `Rectangle` or `Poster` nodes. If a background isn't visible, set `visible=false`.
3. **Optimized Images:** API returned images must use `loadDisplayMode="scaleToFit"` to avoid holding massive original JPEGs in RAM.
4. **Avoid Deep Hierarchies:** Keep SceneGraph component nesting shallow. Deeply nested `Group` nodes drastically slow down rendering and focus calculation.
