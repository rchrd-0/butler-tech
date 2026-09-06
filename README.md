# Butler Asia maintenance dashboard

A table-first maintenance ticket dashboard built as a take-home assessment for Butler Asia. The app turns a validated JSON fixture into an operational ledger with filtering, freshness signals, inspection flows, and configurable widgets.

[View the live dashboard](https://butler.rchrd.dev/)

## Features

- 72 realistic commercial building maintenance tickets
- Status, category, priority, and text filtering with shareable URL state
- Sortable ticket columns, including numeric age and activity ordering plus explicit priority ranking
- Separate ticket age, last activity, and stale-work signals
- Operational summaries for status, stale work, active priorities, and locations
- Quick-look inspection from the ledger and a full record with its activity log
- Pointer and keyboard widget reordering with browser-local layout persistence
- Widget hiding, restoring, and reset-to-default controls
- Loading, error, empty, no-results, and not-found states

## Stack

| Area | Tools |
| --- | --- |
| Web | React 19, Vite, TanStack Router, TanStack Table |
| Interface | Tailwind CSS 4, shadcn/ui with Base UI, dnd-kit |
| Server | Node.js 24, Express 5, Valibot, Evlog |
| Tooling | pnpm workspaces, Biome, `node:test` |

The application code uses plain JavaScript, matching Butler’s requested language for the assessment. Express was chosen as a small HTTP layer aligned with the team’s Node.js stack. Railway’s infrastructure-as-code file uses the platform’s TypeScript configuration format.

## Run locally

Requires Node.js 24.20.0 and pnpm 12.3.1, pinned by `.node-version` and the root `packageManager` field. Run the setup commands from the repository root:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The API listens on `http://localhost:3000`, and Vite serves the dashboard at `http://localhost:5173`. Vite proxies local `/api` requests to Express.

Run either workspace on its own:

```sh
pnpm dev:server
pnpm dev:web
```

## Architecture

The server loads `tickets.json` once and validates the complete fixture with strict Valibot schemas. Code beyond that boundary treats the data as trusted. Request middleware separately validates query and route parameters before the ticket handlers run.

The fixture expands Butler’s eight supplied tickets to 72 records. The original `id`, `title`, `status`, `category`, `priority`, and `created` values remain unchanged. The added `location`, `updated`, `assignee`, and `events` fields support operational views and the ticket record flow without introducing unrelated product concepts.

The frontend loads the complete dataset through a TanStack Router loader. TanStack Table applies client-side filters and sorting, while the route search parameters own filter state. At this data size, one response keeps the implementation direct and lets the table and widgets share the same source.

Freshness is derived on the frontend rather than stored in the fixture. `created` determines ticket age, while `updated` determines activity recency. An unresolved ticket becomes stale after 14 days without activity. Widgets consume the same enriched ticket array, so stale calculations have one canonical implementation.

The selected ticket remains local interface state. Widget order and visibility are presentation preferences, so a small versioned `localStorage` value persists them without adding application state infrastructure.

## API

The API is read-only:

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET` | `/api/tickets` | List tickets with optional filters |
| `GET` | `/api/tickets/:id` | Return one ticket by numeric ID |

The list endpoint accepts exact `status`, `category`, and `priority` query parameters. Multiple filters use AND semantics:

```http
GET /api/tickets?status=Open&category=HVAC&priority=High
```

Malformed filters and IDs return `400` responses with field-keyed validation details. A valid but unknown ticket ID returns `404`.

Text search stays client-side because all 72 tickets are already available to the ledger. It covers ID, title, location, and displayed assignee.

## Design decisions and trade-offs

The dashboard is deliberately table-first: maintenance staff need to scan outstanding work before they need aggregate reporting. Operational widgets surface exceptions and workload signals. Age and last activity remain separate, so an old but recently active ticket is not confused with a stale one. Freshness and widget metrics derive from existing ticket data rather than additional domain state.

The implementation stays proportional to the assessment:

- The API has no database, authentication, mutations, pagination, or controller and repository layers
- The frontend has no server-state cache or global state library
- URL parameters persist shareable filters; `localStorage` persists only dashboard presentation
- Draggable widgets satisfy configurable dashboard content without adding a second drag system for table columns
- The quick-look dialog shows the latest event; the full record displays the complete history

## Deployment

Cloudflare Pages serves the frontend at `butler.rchrd.dev`. A shared Cloudflare Worker proxies `/api/*` on the same hostname to the Express service on Railway:

```text
butler.rchrd.dev
├── /*       -> Cloudflare Pages
└── /api/*  -> Cloudflare Worker -> Railway API
```

The ingress Worker lives in a separate shared repository and is not required for local development. Vite proxies `/api` directly to Express locally.

The same-origin route removes the need for browser-facing Cross-Origin Resource Sharing (CORS) middleware. Railway infrastructure and monorepo deployment watch paths live in `.railway/railway.ts`.

## Verification

Run the repository checks from the workspace root:

```sh
pnpm check
pnpm test
pnpm build
```
