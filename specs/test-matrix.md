# Idle Page Test Matrix

Version: 1.0  
Last updated: 2026-02-19  
Reference: acceptance criteria in `idle-page-ralph-spec.md`

---

## 1) Test Levels

- Unit: pure logic and deterministic functions.
- Integration: API + filesystem + watcher + cache interactions.
- E2E: browser-level user flows.
- Non-functional: performance/resilience checks.

---

## 2) Acceptance Criteria Coverage

## AC-01 App runs in Docker with configured TODO path

- Unit:
  - path normalization and validation helpers.
- Integration:
  - startup with mounted `/data/TO-DO.md`.
  - read/write smoke to mounted file.
- E2E:
  - configure path in settings and verify task list loads.

## AC-02 Checklist parsing + non-checklist preservation

- Unit:
  - parse checklist lines from mixed markdown.
  - preserve untouched lines after edit operations.
- Integration:
  - run CRUD then compare unaffected markdown regions.
- E2E:
  - load mixed file and verify only checklist items render.

## AC-03 Full checklist CRUD works

- Unit:
  - create/update/delete transformations.
- Integration:
  - API tests for `POST/PATCH/DELETE`.
- E2E:
  - add, edit, toggle, delete sequence from UI.

## AC-04 Reorder safe-only behavior

- Unit:
  - contiguous block detector.
  - unsafe context rejection logic.
- Integration:
  - `POST /api/todo/reorder` accepted and blocked paths.
- E2E:
  - reorder in safe file succeeds.
  - reorder in mixed file shows blocked message.

## AC-05 Watcher updates + degraded fallback

- Unit:
  - retry backoff scheduler.
  - health state reducer.
- Integration:
  - mutate file externally and assert stream event.
  - simulate watcher failure and assert degraded status.
- E2E:
  - user sees health banner and can manually refresh.

## AC-06 Media rotation for image/GIF/video/quote in random/playlist

- Unit:
  - rotation index logic for both modes.
  - media type discriminator.
- Integration:
  - import mixed media set and start playback engine.
- E2E:
  - verify each type renders and advances correctly.

## AC-07 Next/Prev controls reliable

- Unit:
  - boundary behavior for index navigation.
- Integration:
  - control commands mutate playback state.
- E2E:
  - rapid click stress on Next/Prev remains deterministic.

## AC-08 Remote media retry then skip

- Unit:
  - retry policy function.
- Integration:
  - mocked failing URL retries N times and marks skipped.
- E2E:
  - failed remote media does not freeze slideshow.

## AC-09 Prefetch smoothness

- Unit:
  - prefetch queue planning and concurrency cap.
- Integration:
  - scheduler keeps 2-ahead queue in stable network simulation.
- Non-functional:
  - transition latency benchmark under normal conditions.

## AC-10 localStorage settings persistence

- Unit:
  - settings serializer/deserializer.
- Integration:
  - settings API compatibility with client store.
- E2E:
  - reload page and confirm settings persist.

## AC-11 Dark desktop-optimized UI

- Unit:
  - token map integrity checks (if automated).
- E2E:
  - visual snapshots for dark mode variants.
- Non-functional:
  - basic contrast checks for TODO readability.

---

## 3) Critical Regression Suite (must run on each milestone)

1. Parse/write preservation test with mixed markdown fixture.
2. CRUD smoke flow against real temp file.
3. Reorder safe vs blocked pair.
4. Watcher degrade and recover scenario.
5. Mixed media playback smoke (all media types).

---

## 4) Test Fixtures

Maintain fixtures in `tests/fixtures`:

- `todo-flat.md`
- `todo-mixed-safe.md`
- `todo-mixed-unsafe.md`
- `todo-idless.md`
- `media-manifest-mixed.json`
- `media-manifest-remote-failures.json`

---

## 5) Suggested Tooling

- Unit/Integration: Vitest or Jest.
- API integration: supertest.
- E2E: Playwright.
- Snapshot/visual checks: Playwright screenshot assertions.

---

## 6) Exit Criteria by Milestone

## M1 exit

- Parser/serializer unit suite green.
- CRUD integration suite green.

## M2 exit

- Reorder acceptance+rejection integration tests green.

## M3 exit

- Watcher degraded mode scenario green.

## M4 exit

- Mixed media playback E2E smoke green.

## M5 exit

- Prefetch queue and remote retry tests green.

## M6 exit

- Visual regression snapshots approved for final variants.

---

## 7) Manual QA Script (short form)

1. Launch app in Docker with mounted TODO file.
2. Configure TODO path in settings.
3. Run CRUD operations on checklist tasks.
4. Attempt reorder in safe and unsafe files.
5. Edit file externally and confirm live refresh.
6. Simulate watcher break and observe degraded banner.
7. Import local + remote media.
8. Observe transitions and control with Next/Prev.
9. Reload and verify settings persistence.

