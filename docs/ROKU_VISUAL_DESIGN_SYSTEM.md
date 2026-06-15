# FamilyCare TV: Roku Visual Design System

**Goal:** Transform the Roku experience from a functional healthcare dashboard into a premium, ambient wellness platform.

**Inspiration:** Apple TV+, Disney+, Calm, Headspace, Peloton.

---

## 1. Color System

To create a calming, trustworthy, and modern feel, we move away from stark whites and primary blues, embracing the core brand palette: Blue, Green, and Red.

| Token | Hex | Usage |
|-------|-----|-------|
| `ColorPrimary` | `#0054A4` | Focus rings, primary buttons, hero text |
| `ColorSecondary` | `#009639` | Success states, badges, active tab underlines |
| `ColorAccent` | `#E31837` | Warnings, special highlights, medication alerts |
| `ColorBackground` | `#0F172A` | Global background (Slate 900) for premium TV feel |
| `ColorCardBg` | `#1E293B` | Default card background (Slate 800) |
| `ColorTextMain` | `#F8FAFC` | Primary headings and body text |
| `ColorTextMuted` | `#94A3B8` | Subtitles, metadata, timestamps |
| `ColorGradientTop` | `#1e1b4b` | Top of the screen ambient gradient |
| `ColorGradientBot` | `#0f172a` | Bottom of the screen ambient gradient |

---

## 2. Typography Scale

Roku devices use the `Font` node. We will use a custom font closely resembling **Inter** or **SF Pro** to maintain parity with the mobile app.

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `TypeDisplay` | 64px | Bold | Hero titles, Splash screen |
| `TypeH1` | 48px | SemiBold | Screen titles, prominent headers |
| `TypeH2` | 36px | SemiBold | Section headers, large card titles |
| `TypeBody` | 24px | Regular | Standard description text |
| `TypeCaption` | 18px | Regular | Metadata, times, small labels |

---

## 3. Card System

Cards are the primary structural element on the Roku.

* **Corner Radius:** 16px
* **Unfocused State:** Opacity 80%, `ColorCardBg`
* **Focused State:** Opacity 100%, slight scale up, white border.
* **Layout:** Image/Icon at the top, Title in `TypeH2`, Subtitle in `TypeCaption`.

---

## 4. Focus States

On a 10-foot UI, focus must be unmistakable.

* **The "Apple TV" Pop:** When a card gains focus, it scales up by `1.05x`.
* **Border Ring:** A sharp, 4px solid white border (`#FFFFFF`) surrounds the focused element.
* **Shadow:** A diffuse drop shadow appears behind the focused card to lift it off the background.
* **Parallax (Optional):** If using standard Roku `Poster` nodes, apply slight 3D rotation if supported, or a slow image pan inside the poster.

---

## 5. Animation Rules

* **Duration:** Fast and snappy (`0.2s` - `0.3s`) for D-Pad navigation.
* **Easing:** `ease-out` for scaling up, `ease-in` for scaling down.
* **Screen Transitions:** Slow cross-fade (`0.5s`) to prevent jarring jumps between completely different visual contexts.
* **Ambient Motion:** Slow, continuous horizontal panning (Ken Burns effect) on background artwork.

---

## 6. Splash Screen

**Wireframe:**
```text
+-------------------------------------------------+
|                                                 |
|                                                 |
|                 [ HEART ICON ]                  |
|                                                 |
|                 FamilyCare TV                   |
|          Care, Connection & Wellness            |
|                                                 |
+-------------------------------------------------+
```
* **Color Usage:** Deep brand blue gradient background. White icon and text.
* **Motion Behavior:** Heart icon slowly pulses. Text fades in from 0 to 100% over 1.5s.
* **Focus Behavior:** None (non-interactive).
* **Typography:** `TypeDisplay` for title, `TypeH2` for subtitle.
* **SceneGraph Implementation:** `Rectangle` node with a `SequentialAnimation` containing `FadeAnimation` and `Vector2DAnimation` for the pulse.

---

## 7. Home Screen Hero Design

**Wireframe:**
```text
+-------------------------------------------------+
| [Hero Image: Family / Ambient Art]              |
|                                                 |
| Good Morning, Clara                             |
| You have 2 medications to take today.           |
|                                                 |
|  [ View Schedule ]  [ Contact Doctor ]          |
|                                                 |
| Upcoming  [Card 1] [Card 2] [Card 3]            |
+-------------------------------------------------+
```
* **Color Usage:** Full-bleed background image with a dark linear gradient overlay at the bottom to ensure text legibility.
* **Motion Behavior:** Hero image slowly pans right-to-left.
* **Focus Behavior:** D-Pad defaults to "View Schedule" button. Buttons use heavy pill-shaped styling.
* **Typography:** `TypeH1` for greeting, `TypeBody` for summary.
* **SceneGraph Implementation:** Use a `Poster` for the background, overlaid with a `Rectangle` gradient. Use `RowList` for the horizontal cards at the bottom.

---

## 8. Patient Screen Design

**Wireframe:**
```text
+-------------------------------------------------+
| [Avatar] Clara Smith                            |
|                                                 |
| Medications                                     |
| [Pill A]  [Pill B]  [Pill C]                    |
|                                                 |
| Doctors                                         |
| [Dr. Jones]  [Dr. Smith]                        |
+-------------------------------------------------+
```
* **Color Usage:** `ColorBackground` for canvas. Avatars use `ColorSecondary` rings.
* **Motion Behavior:** Standard `RowList` scrolling behavior.
* **Focus Behavior:** Standard card scaling.
* **Typography:** `TypeH1` for name. `TypeH2` for section titles.
* **SceneGraph Implementation:** `MarkupGrid` or `RowList` nested inside a `Group`. Use custom item components to handle the complex layout of a pill/doctor card.

---

## 9. Music Experience

**Wireframe:**
```text
+-------------------------------------------------+
|                                                 |
|                   [ ALBUM ]                     |
|                   [  ART  ]                     |
|                                                 |
|               "Amazing Grace"                   |
|               Hymns of Comfort                  |
|                                                 |
|      [|<]       [ PLAY/PAUSE ]       [>|]       |
+-------------------------------------------------+
```
* **Color Usage:** The background dynamically changes to a blurred version of the current Album Art (like Apple Music).
* **Motion Behavior:** Album art scales down slightly when paused, scales up to 100% when playing.
* **Focus Behavior:** Playback controls scale by `1.2x` on focus.
* **Typography:** `TypeH2` for Song Title, `TypeBody` for Album/Playlist.
* **SceneGraph Implementation:** `Audio` node for playback. `Poster` node with blur effect (if supported, otherwise a dark overlay) for the background.

---

## 10. Kids Experience

**Wireframe:**
```text
+-------------------------------------------------+
|  Kids Gallery                                   |
|                                                 |
|  +-------+  +-------+  +-------+  +-------+     |
|  | Image |  | Image |  | Image |  | Image |     |
|  +-------+  +-------+  +-------+  +-------+     |
|                                                 |
|  +-------+  +-------+  +-------+  +-------+     |
|  | Image |  | Image |  | Image |  | Image |     |
|  +-------+  +-------+  +-------+  +-------+     |
+-------------------------------------------------+
```
* **Color Usage:** Brighter, more vibrant gradient background to differentiate from the adult healthcare sections.
* **Motion Behavior:** High-spring bounce effect when focusing on drawings.
* **Focus Behavior:** 4px yellow/gold border on focus to make it playful.
* **Typography:** `TypeH1` for section title.
* **SceneGraph Implementation:** `MarkupGrid` with heavy `interItemSpacing`.

---

## 11. Screensaver Design

**Wireframe:**
```text
+-------------------------------------------------+
|                                                 |
|           "I can do all things..."              |
|               Philippians 4:13                  |
|                                                 |
|                                                 |
|                                                 |
| [Ticker: Reminders & Appointments ->]           |
+-------------------------------------------------+
```
* **Color Usage:** Pure black `#000000` background to save power and prevent burn-in. White text.
* **Motion Behavior:** The verse block slowly drifts diagonally across the screen, bouncing off the edges (DVD logo style) to prevent pixel burn-in. The ticker slowly scrolls horizontally at the bottom.
* **Focus Behavior:** None.
* **Typography:** `TypeH2` for verse text (italic), `TypeCaption` for ticker.
* **SceneGraph Implementation:** `TranslationAnimation` applied to the verse `Group`. `ScrollingText` node (or custom translated `Label`) for the bottom ticker.

---

## 12. Accessibility Requirements

* **High Contrast:** All text must meet WCAG AA contrast ratios against backgrounds (minimum 4.5:1).
* **Audio Guide Compatibility:** Ensure `voiceGuidance` strings are attached to all focusable nodes so visually impaired users can hear card descriptions.
* **Safe Zones:** All interactive elements and text must be within the standard Roku 1080p safe zone (10% padding from all edges) to prevent cutoff on older televisions.
* **Large Text:** The minimum font size across the entire Roku app is 18px. No microscopic text.
