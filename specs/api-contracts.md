# Idle Page API Contracts

Version: 1.0  
Last updated: 2026-02-19  
Scope: Internal API routes for Next.js server

---

## 1) Conventions

### 1.1 Content type

- Request: `application/json` unless noted.
- Response: `application/json` for REST, `text/event-stream` for SSE.

### 1.2 Envelope

All JSON responses use:

```json
{
  "ok": true,
  "data": {},
  "error": null,
  "meta": {}
}
```

Error shape:

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "SOME_ERROR_CODE",
    "message": "Human readable explanation",
    "details": {}
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

### 1.3 Core error codes

- `INVALID_INPUT`
- `NOT_FOUND`
- `FILE_UNAVAILABLE`
- `PARSE_UNSAFE`
- `WRITE_UNSAFE`
- `REORDER_BLOCKED`
- `WATCHER_DEGRADED`
- `MEDIA_FETCH_FAILED`
- `UNSUPPORTED_OPERATION`
- `INTERNAL_ERROR`

---

## 2) Domain Schemas

### 2.1 TodoTask

```json
{
  "id": "idle_01JABC...",
  "text": "Finish parser tests",
  "checked": false,
  "lineRef": {
    "lineNumber": 42,
    "blockId": "block_3"
  },
  "rawLine": "- [ ] Finish parser tests <!-- idle-id:idle_01JABC... -->"
}
```

### 2.2 TodoFileHealth

```json
{
  "status": "ok",
  "mode": "watching",
  "path": "/data/TO-DO.md",
  "lastModifiedMs": 1760000000000,
  "warnings": []
}
```

`status` can be:

- `ok`
- `retrying`
- `degraded`
- `read_only`

### 2.3 ParseWarning

```json
{
  "code": "MIXED_CONTENT_BLOCK",
  "message": "Reorder disabled due to mixed checklist and non-checklist lines.",
  "lineRange": {
    "start": 12,
    "end": 27
  }
}
```

### 2.4 MediaItem

```json
{
  "id": "med_01JDEF...",
  "type": "video",
  "source": "remote",
  "uri": "https://example.com/clip.mp4",
  "title": "Loop clip",
  "durationHintMs": 15000,
  "status": "ready"
}
```

### 2.5 SettingsPayload

```json
{
  "todoFilePath": "/data/TO-DO.md",
  "rotationMode": "random",
  "showCompleted": true,
  "prefetchConcurrency": 2,
  "remoteCacheLimitMb": 2048,
  "designVariant": "void-minimal"
}
```

---

## 3) TODO Endpoints

## 3.1 `GET /api/todo`

Returns parsed checklist tasks and file health.

### Response `200`

```json
{
  "ok": true,
  "data": {
    "tasks": [],
    "health": {},
    "warnings": [],
    "checksum": "sha256:..."
  },
  "error": null,
  "meta": {
    "requestId": "..."
  }
}
```

### Failure cases

- `FILE_UNAVAILABLE` if configured path cannot be read.
- `PARSE_UNSAFE` if parser enters strict read-only mode.

---

## 3.2 `POST /api/todo`

Create a checklist task.

### Request

```json
{
  "text": "New task",
  "afterTaskId": "idle_01J..."
}
```

`afterTaskId` is optional. If omitted, append to valid checklist block.

### Response `201`

```json
{
  "ok": true,
  "data": {
    "task": {}
  },
  "error": null,
  "meta": {}
}
```

### Failure cases

- `INVALID_INPUT` for empty text.
- `WRITE_UNSAFE` if insertion anchor is ambiguous.

---

## 3.3 `PATCH /api/todo/:id`

Update text and/or checked state.

### Request

```json
{
  "text": "Updated text",
  "checked": true
}
```

At least one field required.

### Response `200`

```json
{
  "ok": true,
  "data": {
    "task": {}
  },
  "error": null,
  "meta": {}
}
```

### Failure cases

- `NOT_FOUND` unknown task id.
- `WRITE_UNSAFE` if line mapping changed unexpectedly.

---

## 3.4 `DELETE /api/todo/:id`

Delete task by ID.

### Response `200`

```json
{
  "ok": true,
  "data": {
    "deletedId": "idle_01J..."
  },
  "error": null,
  "meta": {}
}
```

### Failure cases

- `NOT_FOUND`
- `WRITE_UNSAFE`

---

## 3.5 `POST /api/todo/reorder`

Reorder tasks.

### Request

```json
{
  "orderedTaskIds": [
    "idle_01J1",
    "idle_01J2",
    "idle_01J3"
  ]
}
```

### Response `200`

```json
{
  "ok": true,
  "data": {
    "tasks": []
  },
  "error": null,
  "meta": {}
}
```

### Failure cases

- `REORDER_BLOCKED` when mixed content context makes reorder unsafe.
- `INVALID_INPUT` for missing/duplicate IDs.

---

## 3.6 `GET /api/todo/stream` (SSE)

Server-sent events for TODO file health and changes.

### Event types

- `todo.updated`
- `todo.health`
- `todo.warning`

### Event payload example

```json
{
  "type": "todo.health",
  "timestamp": 1760000000000,
  "payload": {
    "status": "retrying",
    "attempt": 2,
    "nextRetryMs": 3000
  }
}
```

---

## 3.7 `POST /api/todo/checkpoint` (optional)

Attempt git checkpoint commit.

### Request

```json
{
  "reason": "task update"
}
```

### Response `200` (supported)

```json
{
  "ok": true,
  "data": {
    "mode": "git",
    "commit": "abc123"
  },
  "error": null,
  "meta": {}
}
```

### Response `200` (fallback)

```json
{
  "ok": true,
  "data": {
    "mode": "snapshot",
    "snapshotPath": "/data/TO-DO.md.bak.20260219-120201"
  },
  "error": null,
  "meta": {}
}
```

---

## 4) Media Endpoints

## 4.1 `GET /api/media`

Returns media library and runtime state.

### Response `200`

```json
{
  "ok": true,
  "data": {
    "items": [],
    "currentIndex": 0,
    "rotationMode": "random"
  },
  "error": null,
  "meta": {}
}
```

---

## 4.2 `POST /api/media/import`

Import local paths and/or remote URLs.

### Request

```json
{
  "localPaths": ["/data/media/a.jpg"],
  "remoteUrls": ["https://example.com/b.gif"],
  "quotes": [
    {
      "text": "Ship small slices.",
      "author": "Idle Page"
    }
  ]
}
```

### Response `200`

```json
{
  "ok": true,
  "data": {
    "accepted": 3,
    "rejected": [
      {
        "uri": "https://bad.invalid/x",
        "reason": "MEDIA_FETCH_FAILED"
      }
    ]
  },
  "error": null,
  "meta": {}
}
```

---

## 4.3 `POST /api/media/prefetch`

Prefetch the next items.

### Request

```json
{
  "fromIndex": 8,
  "count": 2
}
```

### Response `200`

```json
{
  "ok": true,
  "data": {
    "scheduled": 2,
    "ready": 1
  },
  "error": null,
  "meta": {}
}
```

---

## 4.4 `GET /api/media/health`

Returns cache and fetch health.

### Response `200`

```json
{
  "ok": true,
  "data": {
    "cacheUsedMb": 783,
    "cacheLimitMb": 2048,
    "prefetchConcurrency": 2,
    "failedRecent": 1
  },
  "error": null,
  "meta": {}
}
```

---

## 5) Status Code Policy

- `200` success.
- `201` created.
- `400` invalid request shape.
- `404` resource not found.
- `409` conflict/unsafe write/reorder blocked.
- `500` unexpected server fault.

Prefer `409` for data safety guardrail rejections.

---

## 6) Compatibility and Versioning

- API is internal but still version-aware.
- Add `x-api-version` response header.
- Breaking payload changes require:
  - version bump in this file,
  - compatibility shim period if feasible.

