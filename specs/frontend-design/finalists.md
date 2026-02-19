# Finalist Design Specs

Version: 1.0  
Last updated: 2026-02-19  
Finalists: Void Minimal, Glass Ambient

---

## 1) Shared Constraints

Both finalists must respect:

- Dark-only mode.
- Desktop-first rendering.
- Media-first composition.
- TODO panel always present, completed tasks de-emphasized.
- Minimal controls: Next/Prev only.

---

## 2) Void Minimal Spec

## 2.1 Intent

Create a near-silent visual shell where media carries most of the experience and interface elements feel secondary.

## 2.2 Layout rules

- Media occupies full viewport.
- TODO panel width: 320-420px.
- TODO panel anchored bottom-left with 24px margin.
- Control chip anchored bottom-center with 16px margin.

## 2.3 Visual rules

- Background base: pure black / near-black.
- Panel background opacity: 0.20-0.28.
- Border usage: optional 1px low-alpha stroke.
- Shadow: minimal soft shadow only when needed for contrast.

## 2.4 Typography rules

- Primary text size: 14-16px.
- Task text line-height: 1.35-1.45.
- Completed task opacity: 0.45-0.60.
- No decorative font treatments.

## 2.5 TODO panel behavior

- Default state: subdued.
- Hover/focus state: slight contrast lift for readability.
- Unsafe write/degraded mode: clear warning chip appears in panel header.

## 2.6 Motion rules

- Hard cut between media.
- No entrance animations for primary surfaces.
- Keep micro-animations under 120ms and subtle.

## 2.7 Anti-patterns

- Do not add heavy gradients.
- Do not add animated glass effects.
- Do not hide TODO panel completely.

---

## 3) Glass Ambient Spec

## 3.1 Intent

Deliver a premium ambient look while preserving readability and stable performance.

## 3.2 Layout rules

- Media full viewport with optional soft vignette.
- TODO panel floating, typically right-lower quadrant.
- Panel width: 360-460px.
- Controls in small floating glass chip.

## 3.3 Visual rules

- Panel blur: moderate only (avoid expensive extremes).
- Panel background tint: dark translucent.
- Border: thin light-alpha border for glass edge.
- Optional glow: very subtle and disabled on low-power mode.

## 3.4 Typography rules

- Use same readability baseline as Void Minimal.
- Slightly stronger contrast than Void Minimal.
- Completed items keep visibility but remain clearly secondary.

## 3.5 TODO panel behavior

- Base glass state at rest.
- Focused state increases opacity and edge definition.
- Health warnings pinned in panel top region with high contrast text.

## 3.6 Motion rules

- Hard cut remains required for media transitions.
- Optional tiny fade-in for overlay panel states only.
- No continuous animated gradients.

## 3.7 Anti-patterns

- Avoid layered blur stacks.
- Avoid large translucent surfaces beyond one main TODO panel.
- Avoid motion-heavy decorative effects.

---

## 4) Accessibility and Readability Guards

Apply to both finalists:

- Minimum readable contrast for TODO text under media variance.
- Fallback high-contrast mode for poor readability backgrounds.
- Ensure warning banners remain legible regardless of media.

---

## 5) Implementation Sequence

1. Build Void Minimal tokens and components first.
2. Validate readability with real mixed media.
3. Add Glass Ambient token layer.
4. Benchmark render performance and adjust blur budget.

