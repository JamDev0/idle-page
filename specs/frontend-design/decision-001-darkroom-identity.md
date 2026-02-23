# Design Decision 001: Darkroom Visual Identity

Date: 2026-02-20
Status: Adopted
Decision: Use Darkroom as the project-wide visual identity

---

## Context

The Idle Page project explored 9 visual design variants during initial development. After evaluation, the Darkroom aesthetic was selected as the official visual identity. All other variants have been removed.

**Explored variants (removed):**
1. Cosmos — Deep space, floating elements, starfield
2. Terminal — Retro CRT, green phosphor, monospace
3. ~~Darkroom~~ — **Selected as official identity**
4. Isometric — Geometric 3D grid, bold angles, coral & teal
5. Zen Garden — Japanese minimalism, sand, stone, moss
6. Polaroid — Instant photo frames, warm nostalgic tones
7. Blueprint — Technical schematic, blue grid, engineering
8. Vinyl — Record store warmth, amber glow, retro audio
9. Topographic — Contour lines, terrain palette, field notes

---

## Decision

**Darkroom is the sole visual identity of Idle Page.**

All user-facing pages conform to the Darkroom aesthetic:
- Root layout (`src/app/layout.tsx`)
- Home page (`src/app/page.tsx`)
- Settings page (`src/app/settings/page.tsx`)

---

## Rationale

### Distinctive Character

Darkroom provides a unique, memorable identity that stands apart from common dark-mode aesthetics. The photography darkroom metaphor creates a cohesive narrative:
- Red safe-light as the dominant accent
- Film grain texture evokes analog warmth
- Vignette and ambient glow simulate the enclosed darkroom space
- Muted, warm tones reduce digital fatigue

### Technical Merits

1. **Performance** — CSS-only effects (no heavy JavaScript animations)
2. **Consistency** — Single coherent palette across all surfaces
3. **Accessibility** — Sufficient contrast for text readability
4. **Maintainability** — Standard Tailwind classes, no custom CSS required

### Design System Clarity

A single adopted identity eliminates ambiguity:
- New components follow established patterns
- Design decisions have clear reference implementation
- Future features inherit consistent visual language

---

## Visual Specification

### Core Palette

| Element | Value | Usage |
|---------|-------|-------|
| Background | `#241414` | Page canvas |
| Text primary | `red-200/80` | Body text |
| Text accent | `red-400` | Highlights, links |
| Text muted | `red-900/50` | Secondary text |
| Border dim | `red-950/30` | Subtle separators |
| Border hover | `red-700/40` | Interactive states |
| Button bg | `red-900/30` | Action buttons |
| Button hover | `red-800/40` | Hover states |

### Signature Effects

#### 1. Film Grain Overlay

```tsx
<div
  className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay opacity-[0.06]"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  }}
/>
```

- 6% opacity, overlay blend mode
- SVG-based fractal noise
- Pointer-events disabled

#### 2. Ambient Red Glow

```tsx
<div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-red-700/[0.25] blur-[180px]" />
<div className="pointer-events-none absolute -bottom-32 left-1/4 h-[400px] w-[400px] rounded-full bg-red-600/[0.18] blur-[150px]" />
```

- Two large blurred circles
- Positioned off-canvas edges
- Creates warm ambient lighting

#### 3. Vignette

```tsx
<div
  className="pointer-events-none absolute inset-0 z-20"
  style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(28,14,14,0.35) 100%)" }}
/>
```

- Radial gradient darkening edges
- 35% opacity at corners

### Typography

- Base size: `text-sm` / `text-xs` / `text-[10px]`
- Labels: `uppercase tracking-widest`
- Font: System sans-serif (Inter fallback)

### Component Patterns

#### Cards/Panels

```tsx
className="rounded border border-red-900/15 bg-[#241414]/80 backdrop-blur-md"
```

#### Inputs

```tsx
className="rounded border border-red-900/30 bg-[#241414]/60 px-3 py-2 text-sm text-red-200/70 outline-none placeholder:text-red-950/40 focus:border-red-700/40"
```

#### Buttons

```tsx
className="rounded bg-red-900/30 px-4 py-2 text-sm text-red-300/80 transition-colors hover:bg-red-800/40"
```

---

## Implementation

### Completed

- [x] `src/app/layout.tsx` — Base background and text colors
- [x] `src/app/page.tsx` — Main application with darkroom design
- [x] `src/app/settings/page.tsx` — Full darkroom treatment
- [x] Removed variant pages (`/src/app/{1,2,4-9}`)
- [x] Removed VariantNav component

### Reference Implementation

The canonical implementation is `src/app/page.tsx`.

---

## Future Considerations

1. **Theme toggle** — If multi-theme support is added, Darkroom remains the default
2. **Token extraction** — Consider extracting palette to CSS variables for maintainability
3. **Dark mode** — Already dark; light mode not planned
