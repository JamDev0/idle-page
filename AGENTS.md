## Build & Run

Succinct rules for how to BUILD the project:

- `npm install` then `npm run build`

## Validation

Run these after implementing to get immediate feedback:

- `npm test` (Jest); `npm run build` (Next.js)

## Operational Notes

Succinct learnings about how to RUN the project:

- `npm run dev` — dev server. Use `jest.config.js` (not .ts) to avoid ts-node.
- Docker: `docker compose up --build`. For private npm registry: `docker build --secret id=npm,src=$HOME/.npmrc .` then run the image. 

### Codebase Patterns

#### Typescript musts
- Never define functions return types, just only extremely needed for clarity, rely on TypeScript's inference, as it always reflects the truth of the code.
- Always define explicit types, avoid as much as possible using any and unknow, always try to find otherways that are more industry standard.
- Follow Typescript Strict mode guidelines
- Avoid using `as`, let Typescript infer, if it can't try helping it, if there is no solution, then use as, but only as last resource
- Prefer Existing Type Definitions
  When a type already exists in a library or the codebase, import and use it rather than manually defining the shape inline.
  ```typescript
	// ❌ BAD - Inline type definition
	const cookieOptions: {
		httpOnly: boolean
		secure: boolean
		sameSite: 'strict' | 'lax' | 'none'
		path: string
		maxAge: number
		domain?: string
	} = {
		httpOnly: true,
		secure: true,
		// ...
	
	// ✅ GOOD - Use imported type
	import { CookieOptions } from 'express'
	
	const cookieOptions: CookieOptions = {
	    httpOnly: true,
	    secure: true,
	    // ...
	}
  ```

## Cursor Cloud specific instructions

- **Single service**: Next.js dev server on port 3000 (`npm run dev`). No databases or external services needed.
- **ESLint not configured**: `npm run lint` prompts for interactive ESLint setup. The project currently has no `.eslintrc` or `eslint.config.*` file.
- **File-based data**: TODO and media data stored on the local filesystem. Env vars `TODO_BASE_PATH` and `MEDIA_BASE_PATH` default to `process.cwd()` when unset.
- **Tests**: `npm test` runs Jest with jsdom. All tests are unit/integration and require no external services.
- **Dev server startup**: `npm run dev` starts on port 3000. To verify: `curl -s http://localhost:3000` should return 200.