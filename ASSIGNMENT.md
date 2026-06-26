# Spur – Founding Full-Stack Engineer Take-Home

Deadline: 1st July 2026

## Context
Spur is a "boring makes money" customer engagement & automation platform.
We power:
- AI agents on WhatsApp, Instagram, live chat & Facebook
- WhatsApp bulk messaging & automation
- Integrations with Shopify, Zoho, Stripe, Razorpay, LeadSquared, etc.

For this assignment: build a mini AI support agent for a live chat widget.

## Tech Stack (Guidelines, not hard rules)
- Backend: Node.js + TypeScript
- Frontend: Svelte (or SvelteKit). React/Vue okay if faster.
- Database: PostgreSQL (or simple SQL DB; SQLite fine)
- Cache: Redis (optional, nice-to-have)
- No Shopify/Facebook/Instagram/WhatsApp API integration needed — just LLM integration.

## The Assignment: AI Live Chat Agent

### Goal
Small web app simulating customer support chat where an AI agent answers user questions using a real LLM API (OpenAI / Claude / etc.).

### Core User Flow
1. User opens web page with chat widget/panel.
2. User types a message ("What's your return policy?", "Do you ship to USA?", etc.).
3. Frontend sends message to backend.
4. Backend:
   - Logs/persists the conversation.
   - Calls an LLM API with some prompt/context.
   - Returns the LLM's reply.
5. Frontend displays AI agent's answer in chat UI.

## Functional Requirements

### 1. Chat UI (Frontend)
- Simple live chat interface:
  - Scrollable message list.
  - Clear distinction between user and AI messages.
  - Input box + send button (Enter should also send).
  - Auto-scroll to latest message.
- Basic UX niceties (examples, not mandatory):
  - Disabled send button while request in flight.
  - Optional: "Agent is typing…" indicator.

### 2. Backend API
- Implement backend server in TypeScript.
- Expose at least:
  - `POST /chat/message` – accepts `{ message: string, (optional) sessionId: string }`
  - Returns `{ reply: string, sessionId: string }`
- Backend should:
  - Persist every message (user + AI) to a database.
  - Associate messages with a session/conversation.
  - Call a real LLM API to generate the reply.

### 3. LLM Integration (Required)
- Integrate with any major LLM provider (OpenAI, Anthropic/Claude, etc.).
- Use API key via environment variables (don't commit secrets).
- Wrap LLM call behind a function/service, e.g. `generateReply(history, userMessage)`.
- Prompt design up to you, but do something simple like:
  - System prompt: "You are a helpful support agent for a small e-commerce store. Answer clearly and concisely."
  - Include some conversation history so replies are contextual.
- Add basic guardrails:
  - Handle LLM/API errors (timeouts, invalid key, rate limit) gracefully and return a friendly error message to the user.
  - Optionally cap max tokens / messages for cost control (document any assumptions).

### 4. FAQ / Domain Knowledge
- Seed agent with basic "knowledge" about a fictional store, e.g.:
  - Shipping policy
  - Return/refund policy
  - Support hours
- Can:
  - Hardcode in the prompt, or
  - Store in DB and include in prompt
- AI should answer these FAQs reliably.

### 5. Data Model & Persistence
- Persist at least:
  - `conversations` (id, createdAt, maybe metadata)
  - `messages` (id, conversationId, sender: "user" | "ai", text, timestamp)
- On reload:
  - Given a sessionId (or conversationId), fetch past messages and render history.
- No auth required.

### 6. Robustness & Idiot-Proofing
They will try to "break" the app. Please:
- Validate input:
  - Don't accept empty messages.
  - Handle very long messages sensibly (truncate / warn / still work).
- Make sure:
  - Backend never crashes on bad input.
  - LLM/API failures caught and surfaced as clean error messages in UI.
  - No hard-coded secrets in repo.
  - Graceful failure > silent failure.

## Non-Requirements (don't need to do)
- No real Shopify / Facebook / Instagram / WhatsApp integrations.
- No auth/login, unless really wanted.
- No fancy design system.
- No Kubernetes / Docker wizardry required.
- If extra time and want to show off: improve code quality, architecture, or UX rather than bolting on random features.

## Timebox
- Designed to be doable in a weekend (8–12 hours).
- Don't kill yourself over it.
- If things left out due to time, document in README.

## Submission
- GitHub repository link (public) with all source code, clear instructions to run backend & frontend.
- Deployed project URL (Render, Vercel, Netlify, etc.)
- Submit via form once ready.

## README Must Include
- How to run it locally, step by step.
- How to set up DB (migrations/seed).
- How to configure env vars (e.g. OPENAI_API_KEY or ANTHROPIC_API_KEY).
- Short architecture overview:
  - How backend is structured (layers, modules).
  - Any interesting design decisions.
- LLM notes:
  - Which provider used.
  - How prompting works.
- Trade-offs & "If I had more time…" section.

## How We'll Evaluate
- **Correctness**: End-to-end chat works, sane AI answers, conversations persisted, basic error cases handled.
- **Code Quality & Best Practices**: Clean, readable, idiomatic TypeScript/JS. Logical structure (routes/services/data/UI separation). Sensible naming, no obvious foot-guns.
- **Architecture & Extensibility**: Easy to see where to plug more channels (WhatsApp, IG) or more tools later. LLM integration nicely encapsulated. Schema makes sense.
- **Robustness**: Doesn't break on weird input or poor network conditions. Errors handled and surfaced nicely. No "one tiny change and everything explodes" moments.
- **Product & UX Sense**: Chat experience intuitive, not annoying. Answers phrased like a helpful support agent. Feels like a small but realistic piece of a real product.
