# Frontend Tokens

Version: 1.0  
Last updated: 2026-02-19

---

## 1) Token Strategy

Token layers:

1. Core tokens (shared across app)
2. Variant tokens (override by design variant)

Token naming style:

- `color.bg.base`
- `color.panel.bg`
- `color.text.primary`
- `space.4`
- `radius.md`

---

## 2) Core Tokens (Dark Baseline)

## Colors

- `color.bg.base`: `#070707`
- `color.bg.elevated`: `#0E0E10`
- `color.text.primary`: `#F4F4F5`
- `color.text.secondary`: `#B3B3B8`
- `color.text.completed`: `rgba(244, 244, 245, 0.52)`
- `color.border.subtle`: `rgba(255, 255, 255, 0.10)`
- `color.warning.bg`: `rgba(255, 166, 0, 0.16)`
- `color.warning.text`: `#FFD089`

## Spacing

- `space.1`: `4px`
- `space.2`: `8px`
- `space.3`: `12px`
- `space.4`: `16px`
- `space.5`: `20px`
- `space.6`: `24px`
- `space.8`: `32px`

## Radius

- `radius.sm`: `8px`
- `radius.md`: `12px`
- `radius.lg`: `16px`
- `radius.pill`: `999px`

## Typography

- `font.family.base`: `Inter, ui-sans-serif, system-ui, sans-serif`
- `font.size.task`: `15px`
- `font.size.meta`: `12px`
- `font.weight.normal`: `400`
- `font.weight.medium`: `500`
- `font.weight.semibold`: `600`

## Elevation and effects

- `shadow.panel`: `0 8px 24px rgba(0, 0, 0, 0.35)`
- `blur.panel.default`: `0px`
- `opacity.panel.subdued`: `0.24`
- `opacity.panel.active`: `0.34`

---

## 3) Variant Overrides - Void Minimal

- `color.panel.bg`: `rgba(10, 10, 10, 0.24)`
- `color.panel.border`: `rgba(255, 255, 255, 0.08)`
- `shadow.panel`: `0 6px 18px rgba(0, 0, 0, 0.28)`
- `blur.panel.default`: `0px`
- `opacity.task.completed`: `0.48`
- `control.bg`: `rgba(255, 255, 255, 0.08)`
- `control.text`: `#F4F4F5`

---

## 4) Variant Overrides - Glass Ambient

- `color.panel.bg`: `rgba(24, 24, 28, 0.34)`
- `color.panel.border`: `rgba(255, 255, 255, 0.20)`
- `shadow.panel`: `0 12px 30px rgba(0, 0, 0, 0.45)`
- `blur.panel.default`: `10px`
- `opacity.task.completed`: `0.54`
- `control.bg`: `rgba(255, 255, 255, 0.16)`
- `control.text`: `#FFFFFF`

Performance rule:

- If frame budget drops or low-power mode is enabled, reduce `blur.panel.default` to `4px` or `0px`.

---

## 5) State Tokens

- `state.degraded.banner.bg`: `rgba(255, 166, 0, 0.16)`
- `state.degraded.banner.border`: `rgba(255, 166, 0, 0.35)`
- `state.readonly.banner.bg`: `rgba(255, 90, 90, 0.16)`
- `state.readonly.banner.border`: `rgba(255, 90, 90, 0.35)`

---

## 6) Token Application Rules

- Do not hardcode component colors outside token maps.
- Keep variant-specific values in one map per variant.
- Use CSS variables or typed token object injection.
- Prefer static values over runtime-computed style for predictable performance.

