# AGENTS.md — CADS MIS

## Architecture

- **Hapi.js** server (v21) with Nunjucks templating and GOV.UK Frontend v5
- ESM throughout (`"type": "module"` in package.json), Node.js ≥22.16
- Entry: `src/index.js` → `src/server/server.js` creates the Hapi server
- Config via **convict** (`src/config/config.js`), schemas split in `src/config/schema/`. Values come from env vars (see `.env` example in README)
- Client assets built by **Webpack** (`webpack.config.js`) from `src/client/` → `.public/`. Production builds use content hashes
- Views use **Nunjucks** (`.njk` files) configured in `src/config/nunjucks/`
- Local development depends on shared CADS platform services from **cads-tools** (Redis, backend API, OIDC mock) as documented in `README.md`

## Route Module Pattern

Application page routes are **Hapi plugins** registered in `src/server/router.js`. Follow this structure:

```
src/server/<feature>/
  index.js        — plugin definition, route config, auth/role prereqs
  controller.js   — handler logic (exports object with `handler(request, h)`)
  controller.test.js — tests (inject tests for route handlers, unit tests for non-view handlers)
  index.njk       — Nunjucks view template (when the feature renders a page)
```

Example: `src/server/dashboard/index.js` registers routes, applies `authRequired` + `requireRole()` as Hapi `pre` handlers, then spreads the controller.

Exception: auth endpoints are defined as route arrays in `src/auth/routes-login.js` and `src/auth/routes-logout.js`, then registered directly in `src/server/server.js`.

## Auth & Roles

- OIDC auth via `openid-client` with `@hapi/cookie` session strategy (`src/auth/`)
- Protect routes with `pre: [authRequired, requireRole(roleTypes.mipViewer)]` (see `src/server/dashboard/index.js`)
- Roles defined in `src/auth/constants/roles.js`, permissions in `src/auth/constants/permissions.js`
- Session middleware handles Redis-backed sessions + token refresh (`src/auth/session-middleware.js`)

## Testing

- **Vitest** with globals enabled (`vi.mock`, `describe`, `test` — no imports needed)
- `clearMocks` and `mockReset` are enabled globally — no need to call `vi.clearAllMocks()` in `beforeEach`
- Path alias `@` → `src/` available in tests (e.g., `import '@/config/config.js'`)
- Tests live either co-located (`src/**/*.test.js`) or under `tests/`
- Controller tests spin up a real server via `createServer()` + `server.inject()`, then assert on HTML response using **JSDOM**
- Component tests use **Cheerio** via `renderComponent()` helper (`tests/helpers/component-helpers.js`)
- Mock ESM modules with `vi.mock(import('...'))` + dynamic `await import('...')` to get the mocked reference:
  ```js
  vi.mock(
    import('../common/clients/requests/mibff/get-user-reports.js'),
    () => ({
      getUserReports: vi.fn()
    })
  )
  const { getUserReports } = await import(
    '../common/clients/requests/mibff/get-user-reports.js'
  )
  ```
- Mock auth in inject calls: `auth: { strategy: 'session', credentials: { user: { roles: ['mip-viewer'] } } }`
- Run: `npm test` (coverage) or `npm run test:watch`

## API Clients

- Backend calls go through `src/server/common/clients/` (e.g., `requests/mibff/`)
- Use `createApiClient(request)` factory from `src/server/common/clients/api-client.js` — provides `.get()`, `.post()`, `.put()`, `.delete()` with automatic auth token injection, tracing headers, and `@hapi/boom` error wrapping
- HTTP uses native `fetch` with automatic forward proxy support via `global-agent` and `undici`

## Key Commands

| Task                          | Command                  |
| ----------------------------- | ------------------------ |
| Dev (server + frontend watch) | `npm run dev`            |
| Dev with debugger             | `npm run dev:debug`      |
| Run tests with coverage       | `npm test`               |
| Lint JS + SCSS                | `npm run lint`           |
| Format check                  | `npm run format:check`   |
| Build frontend for production | `npm run build:frontend` |
| Start production              | `npm start`              |

## Conventions

- Shared server utilities live in `src/server/common/` (helpers, components, templates, constants, clients)
- Client-side shared code in `src/client/common/`
- SCSS follows GOV.UK Design System conventions (`stylelint-config-gds`)
- JS linting uses `neostandard` + prettier via ESLint flat config (`eslint.config.js`)
- Pre-commit hook runs `format:check`, `lint`, and `test` (via Husky)
- Caching: CatboxRedis in production, CatboxMemory in development (configurable via `SESSION_CACHE_ENGINE`)
