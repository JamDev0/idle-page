# Frontend Components Spec

Version: 1.0  
Last updated: 2026-02-19

---

## 1) Component Inventory

Core UI components:

1. `MediaViewport`
2. `TodoPanel`
3. `TodoItem`
4. `ControlBar`
5. `HealthBanner`
6. `QuoteCard`
7. `SettingsPanel`

---

## 2) Component Specs

## 2.1 `MediaViewport`

Purpose:

- Render current media item.
- Handle type-specific presentation.

Requirements:

- Support image, GIF, video, quote.
- Hard cut transition only.
- Video should play once then emit next event.
- Preserve aspect ratio with non-jarring fallback backgrounds.

States:

- loading
- ready
- failed

Failure behavior:

- Show subtle placeholder and continue playlist progression.

---

## 2.2 `TodoPanel`

Purpose:

- Display checklist tasks in subdued but legible form.

Requirements:

- Always visible in idle view.
- Completed tasks visible but less prominent.
- Supports inline CRUD interactions.
- Reorder affordance shown only when safe.

States:

- normal
- degraded
- read_only

Interactions:

- Add task entry.
- Edit text.
- Toggle checked state.
- Delete task.
- Reorder drag handle (conditionally active).

---

## 2.3 `TodoItem`

Purpose:

- Encapsulate checklist row behavior.

Requirements:

- Checkbox + text + optional actions.
- Preserve single-line and multi-line readability.
- Completed style uses lower opacity.

States:

- default
- hover
- editing
- completed

Rules:

- Do not hide completed items.
- Show non-intrusive validation errors for empty edits.

---

## 2.4 `ControlBar`

Purpose:

- Provide minimal playback control.

Requirements:

- Buttons: Prev and Next only.
- Must remain visible over any media.
- Must be accessible by pointer with adequate hit area.

States:

- idle
- pressed
- disabled (rare, only when list unavailable)

---

## 2.5 `HealthBanner`

Purpose:

- Surface operational state changes and warnings.

Requirements:

- Visible in degraded or read-only safety mode.
- Short, actionable copy:
  - what failed
  - fallback active
  - optional user action

States:

- warning (watcher retry/degraded)
- error (read-only safety lock)
- info (recovered)

---

## 2.6 `QuoteCard`

Purpose:

- Render text/quote media items.

Requirements:

- Supports quote text and optional author.
- Uses large, readable typography.
- Matches current visual variant style.

---

## 2.7 `SettingsPanel`

Purpose:

- Configure path and behavior settings.

Required controls:

- TODO file path
- Rotation mode
- Prefetch concurrency (default 2)
- Remote cache limit (default 2048 MB)
- Design variant selector

---

## 3) Layout Regions

- Region A: Full-screen media layer (`MediaViewport`).
- Region B: Floating TODO panel (`TodoPanel` + `HealthBanner`).
- Region C: Bottom control chip (`ControlBar`).

No additional persistent regions in V1.

---

## 4) Behavior Contracts

- `MediaViewport` emits `onAdvance` when media item completes/fails.
- `TodoPanel` emits mutation events consumed by TODO API client.
- `HealthBanner` subscribes to SSE health channel.
- `ControlBar` mutates playback index only.

---

## 5) Accessibility Baselines

- Adequate contrast for primary task text under variable media backgrounds.
- Minimum interactive hit area for controls.
- Focus styling for editable task elements, even if keyboard-heavy flow is not primary.

---

## 6) Variant Mapping Notes

- Void Minimal:
  - minimal borders, no blur.
  - subdued overlays.
- Glass Ambient:
  - translucent surfaces and moderate blur.
  - stronger edge definition for readability.

Component APIs remain unchanged across variants; only token/style bindings differ.

