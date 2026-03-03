# Idle Page

A **desktop-first, dark-mode** ambient web app: rotating media (images, GIFs, videos, quote cards) plus a **TODO checklist** sourced from a local markdown file. Open it when you’re idle for a low-friction, minimal-control companion.

- **Media**: Local files/folders and remote URLs; random or playlist order; Next/Prev only; hard-cut transitions; prefetch for smooth playback.
- **TODO**: Full CRUD and reorder on checklist lines only; non-checklist content is preserved. File watcher for live updates with safe degraded fallback.
- **Design**: Single visual identity — **Darkroom** (red safe-light, film grain, vignette). Settings in localStorage; optional Docker + file mount.

---

## Requirements

- **Node.js** 20+
- **npm** (or compatible package manager)

Optional: **Docker** and **Docker Compose** for containerized run.

---

## Quick start

```bash
npm install
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Settings** to set the path to your TODO markdown file (e.g. `TO-DO.md`). The app expects checklist lines (`- [ ]` / `- [x]`); other lines are left untouched.

---

## Docker

```bash
docker compose up --build
```

Data lives under `/data` in the container. Mount a host directory for the TODO file and media, e.g. in `docker-compose.yml`:

```yaml
volumes:
  - ./your-data-dir:/data
```

Env vars (defaults in container): `TODO_BASE_PATH=/data`, `MEDIA_BASE_PATH=/data`. For a private npm registry:

```bash
docker build --secret id=npm,src=$HOME/.npmrc .
```

---

## Configuration

| Env / Setting      | Purpose                          | Default (Docker) |
|--------------------|----------------------------------|------------------|
| `TODO_BASE_PATH`   | Base path for TODO file          | `/data`          |
| `MEDIA_BASE_PATH`  | Base path for local media        | `/data`          |

In the UI (Settings): TODO file path, rotation mode (random/playlist), prefetch concurrency (default 2), remote cache limit (default 2GB), design variant. Stored in **localStorage**; works offline for local TODO and media.

---

## Project layout

- `src/app/` — Next.js App Router: `page.tsx` (idle view), `settings/page.tsx`, `api/todo/*`, `api/media/*`
- `src/components/` — Media viewport, TODO panel, controls, health banner, etc.
- `src/lib/` — TODO parser/serializer, file/watcher adapters, media prefetch/cache
- `src/hooks/` — Client hooks (e.g. media playback)
- `specs/` — Product spec, API contracts, frontend design decisions, test matrix, risk register

---

## Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Dev server (port 3000)     |
| `npm run build`| Production build           |
| `npm start`    | Run production server      |
| `npm test`     | Jest (unit/integration)    |
| `npm run lint` | Next.js lint               |

---

## Specs and docs

- **Product & architecture**: [`specs/idle-page-ralph-spec.md`](specs/idle-page-ralph-spec.md)
- **API**: [`specs/api-contracts.md`](specs/api-contracts.md)
- **Frontend**: [`specs/frontend-design/`](specs/frontend-design/) (Darkroom identity, components, tokens)
- **Testing**: [`specs/test-matrix.md`](specs/test-matrix.md)
- **Risks**: [`specs/risk-register.md`](specs/risk-register.md)
- **Agent/contributor**: [`AGENTS.md`](AGENTS.md)

---

## License

Private. See repository settings.
