# Frontend Design Scorecard

Version: 1.0  
Last updated: 2026-02-19

---

## 1) Scoring Inputs

Stakeholder priority order:

1. Media aesthetics
2. TODO clarity
3. Performance/lightweight
4. Extensibility
5. Low maintenance

### Weight model

- Media aesthetics: 35
- TODO clarity: 25
- Performance/lightweight: 20
- Extensibility: 12
- Low maintenance: 8

Total weight: 100

Score scale: 1-10 per category.

---

## 2) Weighted Scores

| Variant | Media (35) | TODO (25) | Perf (20) | Ext (12) | Maint (8) | Weighted Total |
|---|---:|---:|---:|---:|---:|---:|
| Void Minimal | 10 | 6 | 9 | 8 | 8 | 8.58 |
| Glass Ambient | 9 | 8 | 6 | 8 | 6 | 7.82 |
| Brutal Contrast | 6 | 9 | 9 | 7 | 9 | 7.80 |
| Paper Noise | 7 | 7 | 7 | 7 | 7 | 7.00 |
| Cinema Strip | 9 | 5 | 8 | 6 | 8 | 7.18 |
| Terminal Noir | 8 | 8 | 8 | 8 | 7 | 7.92 |
| Quiet Dashboard | 7 | 9 | 8 | 8 | 8 | 7.94 |

---

## 3) Interpretation

- Top by weighted score: **Void Minimal**.
- Best balanced practical options: **Void Minimal**, **Quiet Dashboard**, **Terminal Noir**.
- Stakeholder-selected finalists remain:
  - **Void Minimal**
  - **Glass Ambient**

This is valid because stakeholder preference prioritizes aesthetics and brainstorming value, not only implementation efficiency.

---

## 4) Finalist Suitability Notes

## Void Minimal

- Excellent for core mood and simplicity.
- Must include targeted readability aids for TODO panel.

## Glass Ambient

- Strong premium look.
- Requires strict performance budgeting for blur and compositing.

---

## 5) Risk-Adjusted Recommendation

Build order:

1. Implement Void Minimal first (lower complexity, faster validation).
2. Layer Glass Ambient as style variant once baseline performance is stable.

