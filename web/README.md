# Test Assistant Web UI

This is a small React chat app that talks to the local backend Gemini wrapper to:
- manually exercise the wrapper
- run UI automation against
- verify chat behavior across empty, loading, success, and error states

## How it works

The browser never talks directly to Gemini.

Instead:

1. the app checks backend health using `GET /health`
2. the user sends a message from the chat composer
3. the frontend sends the current conversation to `POST /api/gemini`
4. the backend wrapper calls Gemini
5. the response comes back through the backend and is rendered in the chat

In local development, Vite proxies `/health` and `/api/*` to `http://localhost:3001`, so you do not need extra frontend config just to get started.

If the backend is running somewhere else, you can parameterize the backend URL with an env var.

Copy the example file:

```bash
cp web/.env.example web/.env
```

Then set:

- `VITE_API_BASE_URL`: used by both the frontend request helper and the Vite dev proxy

Example:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Local development

### Prerequisites

- Node 18+
- repo dependencies installed with `npm install`
- the backend configured with a valid Gemini API key

The backend reads its env from the backend setup, not from this `web/` folder.

If the backend is not running, the UI will still load, but the status indicator will show offline and sends will fail.

### Start everything

From the repo root:

```bash
npm install
npm run backend:dev
npm run web:dev
```

If you changed `web/.env`, restart the Vite dev server so it picks up the new values.

### Useful commands

From the repo root:

```bash
npm run web:dev
npm run web:check
npm run web:build
```

From inside `web/`:

```bash
npm run dev
npm run check
npm run build
npm run preview
```

## What to expect in the UI

The app is a single-screen chat interface:

- header with connection status
- scrollable message area
- empty-state view before the first message
- bottom-pinned message composer

The DOM is intentionally kept stable for test automation. We use semantic markup plus `data-testid` hooks for key surfaces.

Examples:

- `chat-shell`
- `chat-header`
- `connection-status`
- `messages-panel`
- `empty-state`
- `message-input`
- `send-button`

Messages also expose their role through attributes like:

- `data-message-role="user"`
- `data-message-role="model"`

## Project structure

```text
src/
  App.tsx
  components/
    ChatComposer.tsx
    ChatEmptyState.tsx
    ChatHeader.tsx
    MessageList.tsx
  lib/
    chat.ts
  types.ts
  styles.css
```

High-level responsibilities:

- `App.tsx`: orchestration, reducer-driven chat flow, health loading, submit handling
- `components/`: small UI pieces
- `lib/chat.ts`: small frontend helpers
- `types.ts`: shared frontend types
- `styles.css`: all app styling

## Notes for engineers

Some implementation choices here are deliberate:

- The app is small on purpose. We avoided adding a router, component library, or global state library.
- The UI is split into small React components so behavior is easy to follow.
- Chat state uses a reducer so send success and failure paths stay predictable.
- Styling is plain CSS so the rendered DOM stays easy to inspect and test.

If you are extending this app, try to preserve those properties unless there is a real reason to change them.

## Common issues

### The app loads but says offline

Usually this means the backend is not running, or the backend failed its own startup because env vars are missing.

Check:

```bash
curl http://localhost:3001/health
```

### Sending messages fails

Usually one of these is true:

- the backend is not running
- the backend has no valid Gemini API key
- the backend returned an error from Gemini

Start by checking the backend logs.

## Recommended next steps after cloning

If you want to verify the whole flow quickly:

1. start the backend
2. start the web app
3. load the page in the browser
4. confirm the header status shows online
5. send a short message like `hello`

If that works, the frontend-backend integration is healthy.
