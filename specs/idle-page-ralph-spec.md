# Idle Page Ralph Spec

Version: 1.0  
Date: 2026-02-19  
Audience: AI coding agents and technical implementers  
Product codename: Idle Page

---

## 1) Executive Brief

This project is a desktop-first, dark-mode, media-first web app built with Next.js and intended to be manually opened when the user is idle. The app displays rotating selected media (images, GIFs, videos, and text/quote cards) while showing TODO checklist items sourced from a local markdown file (`TO-DO.md`).

The app must support:

- Full TODO interactions in V1: add/edit/toggle/delete/reorder.
- A strict markdown interaction model: read checklist lines and ignore non-checklist content.
- Local and remote media support with prefetching to keep transitions seamless.
- Minimal controls in idle view (Next/Prev only).
- A robust fallback strategy around local file watching and editing reliability.

This spec intentionally includes hard constraints, harsh risk analysis, and implementation guardrails to prevent a fragile "always-open" setup.

---

## 2) What This Product Is (and Is Not)

### 2.1 Product Definition

Idle Page is a manually launched, browser-based ambient page that merges:

1. Passive visual content (media rotation), and
2. Passive/active productivity surface (TODO checklist).

The expected behavior is not "background automation of life"; it is a low-friction, low-interaction idle companion.

### 2.2 Non-goals

The following are explicitly not part of V1:

- Mobile-first UX.
- Rich markdown editor support (headings, nested lists, tables, custom syntax editing).
- Complex multi-user collaboration.
- Keyboard-heavy productivity workflows.
- Aggressive animation-heavy frontends.
- Browser idle detection or OS idle hooks (manual open only).

---

## 3) Confirmed Inputs Collected from Stakeholder

This section locks all decisions already made in interview.

### 3.1 Product priorities

Priority order (highest to lowest):

1. Media aesthetics
2. TODO clarity
3. Performance/lightweight
4. Extensibility
5. Low maintenance

### 3.2 User and environment model

- Initial user scope: single user (the owner).
- Platform intent: desktop-first.
- Display mode target: browser tab.
- Theme: dark only.
- Idle trigger: manual open.

### 3.3 Media requirements

- Types: images + GIFs + videos + quotes/text cards.
- Sources: local files/folders + remote URLs.
- Rotation: random and fixed playlist order.
- Controls: minimal, Next/Prev only.
- Transition: hard cut.
- Video behavior: play once then next.
- Remote reliability policy: retry then skip; persistent caching accepted.
- Prefetching required for seamless transitions.
- Prefetch concurrency target: 2.
- Persistent remote cache budget: 2GB.
- Local file size limit: not explicitly bounded by stakeholder (high risk, see concerns).

### 3.4 TODO file requirements

- Source path is user-selected in settings (initial known target exists on Windows host).
- Watcher strategy: retry watcher + alert banner when broken; degrade safely.
- Markdown parse policy: only checklist lines; ignore the rest.
- Editing scope in V1: full CRUD + reorder.
- Task structure assumption: flat checklist list.
- Completed tasks: visible inline but visually subdued/out-of-focus.
- Conflict policy: last-write-wins accepted.
- Reorder safety rule: disable reorder when mixed/non-checklist content context is detected.
- Task identity preference: hidden inline IDs.

### 3.5 Runtime and infra

- Preferred runtime environment: Docker.
- App architecture preference: Next.js (latest version, e.g. 16.1.6) + API routes.
- Offline expectation: must work fully offline (for local data path use-case).
- Settings persistence: localStorage.
- Git safety idea: auto-commit every edit if feasible; fallback accepted to snapshots only.
- Git repo expected near TODO file path.
- If git integration not feasible in-container: fallback to `.bak` snapshots.

---

## 4) Brutal Concerns and Opinionated Assessment

This section is intentionally blunt to prevent avoidable technical debt.

1. Docker + host-file editing + watcher + auto-git is a fragile stack.
   - Host path/mount/permissions can fail.
   - Watchers on mounted volumes can be inconsistent depending on OS and Docker backend.
   - Git inside container can fail due to identity, hooks, repo availability, lock files, or index state.

2. Full markdown writeback is dangerous when file is not app-owned.
   - If non-checklist lines exist, broad rewrites can silently destroy formatting or comments.
   - Reorder operations are highest risk for content loss.

3. Hidden inline IDs are valid but intrusive.
   - IDs improve stable identity and reorder safety.
   - IDs also modify user-authored markdown and may surprise users.
   - Agent must preserve existing content and comment style.

4. No local media size cap is operationally risky.
   - Memory pressure, decode stalls, and browser instability are realistic.
   - "Always-open" apps require hard guardrails.

5. Auto-commit every edit is likely overkill for V1.
   - Noisy commit history.
   - Increased write frequency and failure surface.
   - Better: debounced checkpoint commits or explicit checkpoint action.

Conclusion: V1 is feasible only with strict safety constraints and progressive fallback behavior.

---

## 5) Product Requirements (Normative)

Use RFC-style language.

### 5.1 Core behavior

- The app MUST launch as a dark-mode, desktop-first page.
- The app MUST display one media item at a time in a media-first layout.
- The app MUST show TODO checklist items concurrently in a subdued panel.
- The app MUST support Next/Prev controls.
- The app SHOULD keep interaction footprint minimal in idle mode.

### 5.2 TODO source and parser

- The app MUST allow user selection of TODO markdown file path in settings.
- The parser MUST read only checklist items (`- [ ]` and `- [x]`).
- Non-checklist lines MUST be preserved and ignored for task rendering.
- Parser SHOULD reject malformed checklist writes rather than guessing.
- When parse confidence is low, app MUST degrade to read-only with visible warning.

### 5.3 TODO CRUD and reorder

- App MUST support add/edit/toggle/delete on recognized checklist items.
- App MUST support reorder only when safe.
- Reorder MUST be disabled when list context is mixed with non-checklist content in unsafe regions.
- Write strategy MUST preserve non-checklist content exactly.
- Last-write-wins policy MAY be used, but app MUST warn on external changes detected during local edit session.

### 5.4 Watcher and freshness

- App MUST attempt file watch for near-real-time refresh.
- On watcher failure, app MUST retry and show alert banner.
- If watch cannot recover, app MUST enter degraded mode with explicit user notification.
- Optional polling fallback SHOULD be available behind configuration.

### 5.5 Media handling

- App MUST support local file/folder ingestion plus remote URLs.
- App MUST support images, GIFs, videos, and text cards.
- Video playback MUST default to play-once-then-next.
- Transition type in V1 MUST be hard cut.
- App MUST prefetch next 2 items (concurrency target: 2) to reduce transition stalls.
- Remote failures MUST retry then skip.
- Persistent remote cache SHOULD cap at 2GB with eviction.

### 5.6 Offline and persistence

- App MUST work offline for local media and TODO file usage.
- User settings MUST persist in localStorage.
- App SHOULD start even when remote media is unavailable.

---

## 6) System Architecture

### 6.1 Recommended architecture

Next.js app router + API routes + server runtime in Docker.

Subsystems:

1. Frontend UI layer
2. TODO domain + parser + serializer
3. File access adapter
4. Watcher and event stream
5. Media registry and prefetch/cache engine
6. Optional git checkpoint adapter

### 6.2 High-level module map

- `src/app/page.tsx`: idle view composition.
- `src/app/settings/page.tsx`: path and behavior settings.
- `src/app/api/todo/*`: TODO operations.
- `src/app/api/media/*`: media operations.
- `src/lib/todo/parser.ts`: parse checklist lines + metadata IDs.
- `src/lib/todo/serializer.ts`: safe writeback preserving non-checklist content.
- `src/lib/fs/hostPath.ts`: path normalization/validation.
- `src/lib/watch/todoWatcher.ts`: chokidar wrapper and retry policy.
- `src/lib/media/prefetch.ts`: preload scheduler.
- `src/lib/media/cache.ts`: remote cache policy and eviction.
- `src/lib/git/checkpoint.ts`: optional commit operation with fallback.
- `src/types/*`: strict data contracts.

### 6.3 Docker and host path strategy

Given stakeholder choice, the initial mount strategy is single file mount.

Example conceptual run mode:

- Host file mounted into container at `/data/TO-DO.md`.
- App reads and writes `/data/TO-DO.md`.

Risk note: single file mounts can behave inconsistently across environments. Agent should optionally support directory mount mode in settings for resilience.

---

## 7) Data Contracts

### 7.1 Task model

Suggested strict model:

- `id`: stable hidden ID (inline metadata reference).
- `text`: checklist text.
- `checked`: boolean.
- `lineRef`: current structural reference for safe patching.
- `rawLine`: original source line for diff-safe writes.

Inline hidden ID pattern (example convention):

- [ ] Buy milk <!-- idle-id:8f2a... -->

Rules:

- IDs MUST be deterministic once assigned.
- On first parse of ID-less tasks, IDs SHOULD be injected safely.
- Serializer MUST preserve unknown comments and spacing style as much as possible.

### 7.2 Media model

- `id`: stable media ID.
- `type`: image | gif | video | quote.
- `source`: local | remote | inline.
- `uri`: absolute local path or URL.
- `title`: optional.
- `durationHintMs`: optional.
- `status`: ready | loading | failed.

### 7.3 Settings model (localStorage)

- `todoFilePath`
- `rotationMode` (random|playlist)
- `showCompleted`
- `prefetchConcurrency` (default 2)
- `remoteCacheLimitMb` (default 2048)
- `designVariant`

---

## 8) API Surface (Internal)

Use JSON responses with clear status envelope.

### 8.1 TODO endpoints

- `GET /api/todo`
  - Returns parsed checklist tasks, parse warnings, file health, last modified timestamp.

- `POST /api/todo`
  - Create task.
  - Body: `{ text: string, afterTaskId?: string }`

- `PATCH /api/todo/:id`
  - Update text and/or checked state.
  - Body: `{ text?: string, checked?: boolean }`

- `DELETE /api/todo/:id`
  - Delete task by ID.

- `POST /api/todo/reorder`
  - Body: `{ orderedTaskIds: string[] }`
  - Must validate safe reorder window before applying.

- `GET /api/todo/stream`
  - SSE for file change events and health state.

### 8.2 Media endpoints

- `GET /api/media`
- `POST /api/media/import`
- `POST /api/media/prefetch`
- `GET /api/media/health`

### 8.3 Optional git endpoints

- `POST /api/todo/checkpoint`
  - Attempt git commit.
  - If unavailable, return graceful unsupported/fallback signal.

---

## 9) File Write Safety Strategy

This is the most critical part of the implementation.

### 9.1 Parse strategy

1. Read full file as text.
2. Tokenize line-by-line.
3. Identify checklist lines only.
4. Build editable task list from checklist lines.
5. Preserve all other lines and relative ordering anchors.

### 9.2 Serialize strategy

Never regenerate the full document from task list alone.

Instead:

1. Start from latest file text.
2. Apply targeted patch operations on recognized checklist lines.
3. Preserve unknown regions untouched.
4. Validate resulting checklist count and IDs.
5. Write atomically (temp file + rename when supported).
6. Emit backup snapshot when configured.

### 9.3 Reorder constraints

- Reorder allowed only in contiguous checklist blocks where line ownership is clear.
- If mixed content or ambiguous anchors detected, block reorder and return precise reason.

### 9.4 Backups

Given git uncertainty, backups are required.

- On each successful write, optionally maintain rolling backups (recommended default: 5).
- Naming: `TO-DO.md.bak.YYYYMMDD-HHMMSS`.

---

## 10) Watcher, Polling, and Degraded Modes

### 10.1 Watch pipeline

- Use file watcher for immediate updates.
- Debounce event bursts.
- Compare mtime and content hash before update broadcast.

### 10.2 Failure handling

- On watch errors: show banner + retry with backoff.
- If retries exhausted: enter degraded mode.
- In degraded mode:
  - continue read operations;
  - restrict risky write actions if file health uncertain;
  - allow manual refresh.

### 10.3 Optional polling fallback

Though not primary, polling should be available as fallback.

- Poll interval default: 5-10 seconds in degraded mode.

---

## 11) Media Pipeline Details

### 11.1 Local media ingestion

- Allow manual file selection and folder imports.
- Normalize and index valid media types.
- Reject unreadable files with clear status.

### 11.2 Remote media

- Validate URL scheme.
- Retry policy (e.g., max 2 attempts) then skip.
- Cache fetched assets to disk-like store where possible.
- Enforce total cache size limit (2GB) with LRU eviction.

### 11.3 Prefetching and seamless transitions

- Maintain queue of upcoming media.
- Prefetch 2 items ahead.
- Avoid prefetch starvation during slow network by prioritizing current-next pair.
- For video: pre-resolve metadata when possible.

### 11.4 Performance guardrails

Even without explicit user cap, implementation SHOULD enforce defensive soft limits:

- Warn for large media files.
- Use lazy decode/loading.
- Track memory pressure signals via performance metrics.

---

## 12) UX and Interaction Specification

### 12.1 Layout

- Media is dominant visual layer.
- TODO panel is present and readable but subdued (reduced contrast/sharpness effect).
- Completed tasks are visible inline, further de-emphasized.

### 12.2 Controls

- Visible controls: Next, Prev.
- No keyboard shortcuts in V1 (by request).

### 12.3 States

App must expose states clearly:

- Normal
- Loading
- Degraded (watcher issues)
- Read-only safety mode
- Remote media partial failure

### 12.4 Error presentation

- Non-intrusive but persistent banner for health issues.
- Actionable text: what failed, what fallback is active, what user can do.

---

## 14) Security and Privacy

- Local file access must be explicitly user-configured.
- Never expose absolute host paths in client-rendered logs beyond needed display.
- Sanitize remote URLs.
- Prevent SSRF-like misuse in server fetch helpers where possible.
- No secret storage expected in V1.

---

## 15) Testing Strategy

### 15.1 Unit tests

- Checklist parsing with mixed markdown.
- ID injection and stability.
- Serializer preserving non-checklist regions.
- Reorder guardrails.
- Media URL validation and retry behavior.

### 15.2 Integration tests

- CRUD lifecycle against temporary markdown file.
- Watch event propagation to UI event stream.
- Degraded mode transitions.
- Cache eviction behavior at 2GB cap boundary (simulated).

### 15.3 End-to-end tests

- Manual idle flow: open app, rotate media, inspect TODO, edit, reorder.
- Remote failure and recovery.
- Container mount disruption scenario.

---

## 16) Delivery Plan (Milestones)

### M0: Project skeleton

- Initialize Next.js app with latest version.
- Define strict TypeScript models.
- Base dark layout and placeholder media/TODO panels.

### M1: TODO core safe read/write

- Parser + serializer + API endpoints.
- ID support and non-checklist preservation.
- Basic UI CRUD without reorder first.

### M2: Reorder + safety constraints

- Implement reorder endpoint and validation.
- Disable reorder when unsafe context detected.

### M3: Watcher + degraded mode

- Add watcher service, SSE stream, retry logic, degraded banner.

### M4: Media ingestion and playback

- Local/remote sources, rotation modes, hard-cut transitions.
- Video once-then-next behavior.
- Next/Prev controls only.

### M5: Prefetch + cache

- Prefetch 2 ahead.
- Remote cache with 2GB cap and eviction.

### M6: Optional git checkpoints

- Attempt auto-checkpoint strategy only if repo detection and permissions are stable.
- If unstable, fallback to snapshot backups only.

---

## 17) Acceptance Criteria (V1)

V1 is accepted only if all below are true:

1. App runs in Docker and functions with configured TODO file path.
2. Checklist items parse correctly; non-checklist content is ignored and preserved.
3. Full CRUD works on checklist items.
4. Reorder works only when safe and is blocked otherwise with clear message.
5. Watcher attempts live updates; failures surface banner and safe degradation.
6. Media rotation supports image/GIF/video/quote with random and playlist modes.
7. Next/Prev controls work reliably.
8. Remote media retries then skips on failure.
9. Prefetching keeps transition experience smooth under normal conditions.
10. Settings persist in localStorage.
11. UI remains dark-only and desktop-optimized.

---

## 18) Open Risks Log

Keep these visible in project board:

1. Docker mount compatibility for single-file path on target OS.
2. Git auto-commit reliability inside container.
3. Markdown drift from external editors causing unsafe write contexts.
4. Unbounded local media sizes affecting runtime stability.
5. Remote media unpredictability despite retries.

---

## 19) Agent Execution Notes

This spec is agent-oriented. Implementing agents should follow:

1. Build safety-first TODO write pipeline before media complexity.
2. Add robust observability early (health status, warning banners, event logs).
3. Avoid broad text rewrites of markdown.
4. Keep architecture modular so media and TODO domains remain decoupled.
5. Enforce TypeScript strictness and avoid `any`.
6. Prefer inference for return types unless explicit typing improves clarity.
7. Record technical tradeoffs in `/docs/adr` style notes.

