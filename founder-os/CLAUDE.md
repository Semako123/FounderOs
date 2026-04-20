# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Read the bundled docs first

This is **Next.js 16.2.4** — it has breaking changes from versions in your training data. Before writing any code, read the relevant guide in `node_modules/next/dist/docs/`. Key ones:

- `01-app/01-getting-started/05-server-and-client-components.md` — Server vs Client Components
- `01-app/01-getting-started/15-route-handlers.md` — API routes
- `01-app/01-getting-started/11-css.md` — Tailwind v4 (no config file; uses `@import "tailwindcss"` in globals.css)
- `01-app/02-guides/instant-navigation.md` — if fixing slow client-side navigations, `Suspense` alone is not enough; export `unstable_instant` from the route

## Commands

```bash
npm run dev       # start dev server (localhost:3000)
npm run build     # production build
npm run lint      # ESLint
npx tsc --noEmit  # type check without building
```

No test suite is configured.

## Architecture

FounderOS is an AI-powered startup co-founder tool. A founder submits a one-paragraph idea and receives four AI-generated modules (pitch deck, marketing kit, investor memo, financial model). They can then chat with three AI personas (CFO, CMO, Lawyer) that can update those modules mid-conversation.

### Data flow

1. **Idea submission** (`/`): `IdeaForm` calls `POST /api/generate`, which fires 4 parallel Claude calls and returns all modules as JSON. The store is pre-seeded with `loading: true` on all modules before the redirect to `/dashboard`.
2. **Dashboard** (`/dashboard`): Reads from Zustand store. Redirects to `/` if no idea is stored (hydration guard pattern — `useEffect` + `hydrated` flag to avoid SSR mismatch).
3. **Chat** (`/dashboard` → `ChatPanel`): `POST /api/chat` streams SSE. The stream may include `<module_update>{...}</module_update>` XML tags that the route strips from the text stream and re-emits as separate `module_update` SSE events. `ChatPanel` applies these via `onModuleUpdate` callback → Zustand → `ModuleCard` flashes indigo.
4. **CFO unlock**: `POST /api/upload` extracts text from the uploaded file. The content is stored in Zustand (`cfoContext`) and injected into the CFO's system prompt on subsequent chat calls.

### State (`src/store/dashboard.ts`)

Single Zustand store with `persist` middleware. Persisted to `localStorage`: `idea`, `cfoUnlocked`, `cfoContext`, `modules` (content only — not chat messages). Chat messages are session-only.

### API routes (`src/app/api/`)

All Claude calls are server-side only. `src/lib/anthropic.ts` is the singleton client — never import it from client components.

- `generate/route.ts` — `Promise.all` over 4 Claude calls, returns JSON
- `chat/route.ts` — streams SSE, parses `<module_update>` tags out of the stream
- `upload/route.ts` — `FormData` file extraction; PDF support is best-effort (text stream extraction)

### Personas (`src/lib/personas.ts`)

Each persona has a `systemPrompt` that includes the module update protocol. The CFO system prompt gets `cfoContext` appended server-side when provided. Model used throughout: `claude-sonnet-4-6`.

### Styling

Tailwind v4 — **no `tailwind.config.ts`**. Configuration is done via CSS variables in `src/app/globals.css`. Dark-mode colors are set unconditionally (no `prefers-color-scheme` media query — the app is always dark). Custom scrollbar styles are in globals.css.

Path alias: `@/*` → `src/*`.
