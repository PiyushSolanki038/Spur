# Spur Take-Home — AI Live Chat Agent

A mini AI customer support agent for a live chat widget, built for the Spur founding engineer
take-home. Full assignment spec preserved in [ASSIGNMENT.md](ASSIGNMENT.md).

- **Backend**: Node.js + TypeScript + Express + SQLite (better-sqlite3)
- **Frontend**: Svelte + Vite (TypeScript)
- **LLM**: OpenRouter (`meta-llama/llama-3.1-8b-instruct:free` by default — free model, no paid key needed)

## 1. Running locally

### Prerequisites
- Node.js 18+
- An OpenRouter API key (free, get one at https://openrouter.ai/keys)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit .env and set OPENROUTER_API_KEY
npm run migrate         # creates the SQLite db + tables at backend/data/spur.db
npm run dev              # starts on http://localhost:3001
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev               # starts on http://localhost:5173, proxies /chat to :3001
```

Open http://localhost:5173 and start chatting. Without a valid `OPENROUTER_API_KEY`, the backend
still runs and responds with a friendly "AI agent isn't configured" message instead of crashing —
useful for verifying the rest of the stack before wiring up a real key.

## 2. Database setup

SQLite is used for zero-friction local setup. The schema ([backend/src/db/schema.sql](backend/src/db/schema.sql))
is applied automatically on startup (and via `npm run migrate`), so there's no separate
migration tool — just two tables:

- `conversations (id, session_id, created_at)`
- `messages (id, conversation_id, sender, text, created_at)`

The db file lives at `backend/data/spur.db` (path configurable via `DB_PATH` env var).

## 3. Environment variables

Set in `backend/.env` (see `backend/.env.example`):

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes (for real replies) | OpenRouter API key. Without it, the backend runs but returns a friendly "not configured" message. |
| `OPENROUTER_MODEL` | No | Defaults to `meta-llama/llama-3.1-8b-instruct:free`. Swap to any OpenRouter model id (free or paid). |
| `PORT` | No | Backend port, defaults to `3001`. |
| `DB_PATH` | No | SQLite file path, defaults to `./data/spur.db`. |

Frontend uses `VITE_API_BASE` (optional) if the API is hosted on a different origin than the
frontend; leave unset for the local dev proxy / single-service deploy.

## 4. Architecture overview

```
backend/src/
  routes/chat.ts        — POST /chat/message, GET /chat/history/:sessionId (validation + wiring)
  services/llm.ts        — generateReply(history, userMessage): OpenRouter call, encapsulated & swappable
  services/conversation.ts — getOrCreateConversation, getHistory, saveMessage (persistence layer)
  knowledge/faq.ts        — hardcoded store FAQ + system prompt
  middleware/errorHandler.ts — HttpError class + centralized error handler, guarantees no raw crash
  db/                     — SQLite client + schema
  server.ts               — Express app wiring, serves built frontend in production

frontend/src/
  App.svelte    — chat UI: message list, composer, typing indicator, error banner
  api.ts         — thin fetch wrapper around the backend API
```

**Design decisions:**
- **LLM call is fully encapsulated** in `services/llm.ts` behind `generateReply()`. It uses the
  `openai` SDK pointed at OpenRouter's OpenAI-compatible endpoint, so swapping models (or moving to
  direct OpenAI/Anthropic) or adding tool calls later only touches this one file — routes and
  persistence are unaware of which provider is in use.
- **Channel-agnostic persistence**: `conversations`/`messages` are keyed by an opaque `sessionId`,
  not tied to "web chat" specifically. Adding a WhatsApp or Instagram channel later means adding a
  new route that maps an external user/thread id to the same `sessionId` concept — the service
  layer and schema don't need to change.
  - `sender` is currently `'user' | 'ai'`; a real multi-channel system would likely add a `channel`
    column, left out here to keep the schema minimal for the assignment's scope.
- **Errors never reach the client as raw exceptions.** `LlmServiceError` carries a friendly,
  user-safe message; the global Express error handler is the only place that returns JSON errors,
  so there's a single place to guarantee the API never 500s with a stack trace.
- **History capping** (last 10 messages) and **max_tokens=300** on the completion call keep cost
  bounded — documented in `services/llm.ts`.

## 5. LLM notes

- **Provider**: OpenRouter, using the `openai` SDK with `baseURL` pointed at OpenRouter's
  OpenAI-compatible API. Default model is `meta-llama/llama-3.1-8b-instruct:free` — a free model,
  so no billing setup is required to run this end-to-end. Swappable via `OPENROUTER_MODEL`.
- **Prompting**: a single system prompt combines the support-agent persona with a hardcoded FAQ
  knowledge block for a fictional store ("Lumen Goods") covering shipping, returns, and support
  hours — see [backend/src/knowledge/faq.ts](backend/src/knowledge/faq.ts). The agent is
  instructed to say "I don't know" rather than hallucinate when asked something outside that
  knowledge.
- **Context**: the last 10 messages of conversation history are passed alongside the new user
  message so replies stay contextual without unbounded cost growth.
- **Guardrails**: invalid API key, rate limits, and generic API errors are each caught and mapped
  to a friendly, distinct message; the underlying error is logged server-side only, never leaked
  to the client.

## 6. Deployment

`render.yaml` defines a single Render web service that builds the Svelte frontend, builds the
backend, and runs the backend (which serves the built frontend as static files and exposes
`/chat/*` API routes from the same origin) — no CORS or split-deploy complexity.

**Note**: Render's free tier has an ephemeral filesystem, so the SQLite db resets on redeploy/restart.
Fine for a take-home demo; a production deploy would point `DB_PATH` at a persistent disk or swap
to Postgres.

Steps:
1. Push this repo to GitHub.
2. Create a new Render Web Service from the repo (it will pick up `render.yaml`).
3. Set the `OPENROUTER_API_KEY` env var in the Render dashboard (marked `sync: false` in
   `render.yaml` so it's never committed).
4. Deploy.

## 7. Trade-offs / if I had more time

- **No Redis caching** — left out as optional per the spec; would help if rate-limiting or caching
  repeated FAQ answers became necessary at scale.
- **No streaming responses** — replies come back as one chunk rather than token-by-token; streaming
  would improve perceived latency for longer answers.
- **No retry/backoff on LLM rate limits** — currently a 429 surfaces immediately as a friendly
  error; a production version would retry once with backoff before giving up. This matters more
  than usual here since the free OpenRouter model tier has tighter rate limits than a paid plan.
- **FAQ knowledge is hardcoded**, not DB-backed — fine for a fixed fictional store, but a real
  multi-tenant version would store per-store FAQ in the DB and inject it dynamically.
- **No automated tests** — given the timebox, I prioritized manual smoke-testing (empty messages,
  oversized messages, malformed JSON, missing API key) over writing a test suite. With more time
  I'd add integration tests for the `/chat/message` route covering those same edge cases.
- **Single SQLite file** — fine for this scope; a real deployment would use Postgres for
  concurrent-write safety and persistent storage across deploys.
