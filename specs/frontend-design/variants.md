# Frontend Design Variants

Version: 1.0  
Last updated: 2026-02-19  
Goal: Explore 7 distinct visual directions for Idle Page

---

## Variant 01 - Void Minimal

### Concept

Extreme reduction. Media dominates almost the entire viewport with only essential UI traces.

### Visual language

- Deep black canvas.
- Nearly invisible panel edges.
- Monochrome text, low ornamentation.

### Layout

- Full-bleed media layer.
- Compact TODO strip pinned to lower-left area.
- Next/Prev controls as tiny edge pills.

### TODO treatment

- Low contrast by default.
- Completed items more faded than open tasks.
- Blur/backdrop effect minimal or none.

### Strengths

- Maximum media focus.
- High perceived calm.
- Low visual clutter.

### Risks

- TODO readability may suffer.
- Can feel too empty without quality media.

---

## Variant 02 - Glass Ambient

### Concept

Cinematic ambient backdrop with floating translucent information surfaces.

### Visual language

- Frosted glass panels.
- Soft blur and faint border glow.
- Slight gradient overlays for depth.

### Layout

- Full-screen media.
- Floating TODO panel near lower-left or right rail.
- Controls docked into small glass chip at bottom center.

### TODO treatment

- Better readability than Void Minimal via translucent contrast plate.
- Completed items use lower opacity and slight blur.

### Strengths

- Strong premium feel.
- Good balance between aesthetics and legibility.

### Risks

- Overuse of blur can hurt performance on weaker machines.

---

## Variant 03 - Brutal Contrast

### Concept

Utility-first style with sharp edges and hard contrast blocks.

### Visual language

- Pure blacks and whites.
- Solid card containers.
- Heavy typography and strict alignment.

### Layout

- Media remains primary.
- TODO module as geometric block anchored left.
- Controls as explicit square buttons.

### TODO treatment

- Very readable.
- Completed items dimmed but still sharp.

### Strengths

- Excellent task clarity.
- Fast to implement.

### Risks

- Might feel too harsh for idle ambiance.

---

## Variant 04 - Paper Noise

### Concept

Muted analog mood with subtle texture for less digital fatigue.

### Visual language

- Dark matte tones.
- Grain/noise overlay.
- Soft edge transitions.

### Layout

- Media with low-opacity texture mask.
- TODO panel with paper-like tint and quiet border.
- Controls integrated into panel footer.

### TODO treatment

- Legible but intentionally soft.
- Completed tasks lightly struck-through with reduced opacity.

### Strengths

- Comfortable long idle sessions.

### Risks

- Texture can reduce sharpness too much.

---

## Variant 05 - Cinema Strip

### Concept

Media-first cinematic screen with a narrow productivity ticker layer.

### Visual language

- Wide-screen framing cues.
- Dark vignette edges.
- Thin horizontal info strip.

### Layout

- Media occupies everything.
- TODO list compressed into lower-third strip.
- Controls near strip ends.

### TODO treatment

- Prioritizes glanceability over editing comfort.

### Strengths

- Strong media aesthetics.

### Risks

- Weak for heavy TODO interaction.

---

## Variant 06 - Terminal Noir

### Concept

Modern noir with subtle technical/monospace accents.

### Visual language

- Black, charcoal, muted green/cyan accents.
- Fine scanline/noise touches.
- Grid-aligned spacing.

### Layout

- Media center stage.
- TODO panel in compact command-console style box.
- Controls as text-like glyph buttons.

### TODO treatment

- High clarity.
- Completed items represented by subdued accent color.

### Strengths

- Distinct identity.
- Good balance of style and utility.

### Risks

- Might skew too thematic for broad aesthetic preference.

---

## Variant 07 - Quiet Dashboard

### Concept

A restrained split that still keeps media dominant but structures information more clearly.

### Visual language

- Soft cards, subtle separators.
- Conservative spacing rhythm.

### Layout

- 70/30 media-to-TODO split feel.
- Fixed task panel with clear sections.
- Controls embedded in media area corner.

### TODO treatment

- Highest operational clarity among variants.

### Strengths

- Great for frequent task interaction.

### Risks

- Less "idle art" vibe.

---

## Cross-Variant Notes

- All variants are dark-only in V1.
- All variants must preserve minimal controls (Next/Prev only).
- All variants must keep completed tasks visible but de-emphasized.
- Final implementation candidates selected by stakeholder: Void Minimal and Glass Ambient.

