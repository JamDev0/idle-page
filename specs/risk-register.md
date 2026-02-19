# Idle Page Risk Register

Version: 1.0  
Last updated: 2026-02-19  
Owner model: single user + AI agents

---

## 1) Risk Scoring

- Severity: Low / Medium / High / Critical
- Likelihood: Low / Medium / High
- Exposure: qualitative combination used for prioritization.

---

## 2) Active Risks

## R-001 Docker single-file mount instability

- Severity: High
- Likelihood: High
- Exposure: Critical
- Description: Mounting only `TO-DO.md` may break watcher semantics or file write behavior across host/container boundaries.
- Detection:
  - Watcher misses edits.
  - API returns intermittent `FILE_UNAVAILABLE`.
  - Inconsistent mtime updates.
- Mitigation:
  - Support fallback mount mode with containing directory.
  - Add health checks and explicit degraded banner.
  - Validate write-read parity after each write in early releases.
- Contingency:
  - Force read-only mode until mount is stable.
- Owner: Agent platform + operator.

## R-002 Data loss from unsafe markdown rewrite

- Severity: Critical
- Likelihood: Medium
- Exposure: Critical
- Description: Full-text rewrite can remove or mutate non-checklist lines.
- Detection:
  - Snapshot diff shows unrelated line changes.
  - Unexpected formatting drift.
- Mitigation:
  - Strict targeted patch serializer.
  - Preserve non-checklist lines verbatim.
  - Backup on write.
- Contingency:
  - Auto-restore from latest backup and lock write mode.
- Owner: TODO domain implementation agent.

## R-003 Reorder corruption in mixed markdown regions

- Severity: High
- Likelihood: Medium
- Exposure: High
- Description: Reorder may misplace tasks when surrounding content is mixed/ambiguous.
- Detection:
  - Reorder outcome shifts non-target lines.
  - Checklist block count mismatch.
- Mitigation:
  - Reorder only for contiguous, validated checklist blocks.
  - Reject unsafe reorder with `REORDER_BLOCKED`.
- Contingency:
  - Disable reorder globally via feature flag.
- Owner: TODO API agent.

## R-004 Hidden inline ID user acceptance issue

- Severity: Medium
- Likelihood: Medium
- Exposure: Medium
- Description: App injects hidden IDs into markdown; user may dislike file modifications.
- Detection:
  - User feedback.
  - Manual edits removing IDs repeatedly.
- Mitigation:
  - Document ID behavior clearly.
  - Keep comments minimal and deterministic.
  - Provide optional migration mode for existing file.
- Contingency:
  - Move to sidecar mapping if user rejects inline IDs.
- Owner: Product/UX + TODO agent.

## R-005 Watcher unreliability on mounted volumes

- Severity: High
- Likelihood: High
- Exposure: Critical
- Description: File system events can be delayed/dropped under Docker+host mount setups.
- Detection:
  - No SSE updates despite external edits.
  - Repeated retry loops.
- Mitigation:
  - Retry backoff.
  - Optional polling fallback.
  - Health telemetry in UI.
- Contingency:
  - Polling-only degraded mode.
- Owner: Infra/watch agent.

## R-006 Auto git commit instability in container

- Severity: Medium
- Likelihood: High
- Exposure: High
- Description: In-container git may fail due to config, hooks, locks, or missing repo state.
- Detection:
  - Frequent checkpoint failures.
  - Latency spikes on write path.
- Mitigation:
  - Treat git as optional.
  - Debounce commits.
  - Fallback to snapshots.
- Contingency:
  - Disable git integration in runtime config.
- Owner: Git integration agent.

## R-007 Remote media reliability and latency

- Severity: Medium
- Likelihood: High
- Exposure: High
- Description: Remote URLs may fail, throttle, or load slowly causing visual stalls.
- Detection:
  - Elevated fetch failures.
  - Transition delays.
- Mitigation:
  - Retry then skip.
  - Prefetch next 2 items.
  - Persistent cache with eviction.
- Contingency:
  - Temporarily disable remote sources in active session.
- Owner: Media agent.

## R-008 Cache overgrowth and disk pressure

- Severity: Medium
- Likelihood: Medium
- Exposure: Medium
- Description: Cached remote media can exceed practical disk limits.
- Detection:
  - Cache size telemetry crossing threshold.
  - Host disk warning.
- Mitigation:
  - Enforce 2GB cap.
  - LRU eviction.
- Contingency:
  - Purge cache and run uncached mode.
- Owner: Media cache agent.

## R-009 Unlimited local media size causes performance degradation

- Severity: High
- Likelihood: Medium
- Exposure: High
- Description: Large local media files can cause decoding stalls and memory pressure.
- Detection:
  - Frame drops.
  - Browser tab memory climb.
  - Late transition events.
- Mitigation:
  - Soft warnings for oversized files.
  - Lazy decode/loading.
  - Optional future hard caps.
- Contingency:
  - Auto-skip oversized items when playback failures repeat.
- Owner: Media playback agent.

## R-010 Last-write-wins conflict can overwrite external edits

- Severity: High
- Likelihood: Medium
- Exposure: High
- Description: External edits near simultaneous writes may be overwritten.
- Detection:
  - Checksum drift between read and write.
  - Write conflict frequency metric.
- Mitigation:
  - Compare checksum before write.
  - Warn user when external changes are detected.
- Contingency:
  - Reject write and request refresh/retry.
- Owner: TODO write agent.

---

## 3) Risk Response Priorities

Priority 1 (must harden before V1):

- R-001, R-002, R-005, R-010

Priority 2:

- R-003, R-006, R-007, R-009

Priority 3:

- R-004, R-008

---

## 4) Monitoring Signals

Track at minimum:

- Todo parse warnings count.
- Unsafe write rejection count.
- Reorder rejection count.
- Watcher retry/degraded durations.
- Media fetch failure rate.
- Cache size and eviction count.
- Mean transition latency.

