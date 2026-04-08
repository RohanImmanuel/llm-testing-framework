# Backend

This service sits between our frontend test apps and Gemini.

The job is intentionally small: accept a request from a frontend, call Gemini with the configured API key, and return the response. Keeping that logic in one local backend means multiple frontends can share the same integration point without each app needing to know about secrets or direct Gemini wiring.

## What it does

- runs locally for development
- reads secrets from `.env` on your machine
- reads secrets from GitHub Actions env vars in CI
- exposes a simple health endpoint
- exposes a single Gemini proxy endpoint that frontend apps can reuse

The codebase uses TypeScript, ESM, `zod` validation, and a small service layer so it stays easy to test and extend without turning into a big framework exercise.

## Running it locally

From the repo root:

```bash
npm install
cp backend/.env.example backend/.env
npm run backend:dev
```

Or if you prefer working directly inside the backend folder:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

By default the server starts on `http://localhost:3001`.

To sanity check that it is up:

```bash
curl http://localhost:3001/health
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values you need.

| Variable | Required | Notes |
| --- | --- | --- |
| `PORT` | No | Server port. Defaults to `3001`. |
| `GEMINI_API_KEY` | Yes | Gemini API key used for outbound requests. |
| `GEMINI_MODEL` | No | Defaults to `gemini-2.5-flash`. |
| `CORS_ORIGIN` | No | `*` by default, or a comma-separated allowlist. |

Example:

```env
PORT=3001
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=*
```

## API

### `GET /health`

Simple health check for local smoke testing and CI.

### `POST /api/gemini`

This is the main endpoint your frontends should call.

You can send either a simple `prompt`:

```json
{
  "prompt": "Explain llm testing in one paragraph."
}
```

or a full Gemini-style `contents` payload when you need more control:

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "Explain snapshot testing in one paragraph." }]
    }
  ]
}
```

If needed, you can also pass `generationConfig`, and it will be forwarded to Gemini unchanged.

Example request:

```bash
curl -X POST http://localhost:3001/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Give me a one-sentence summary of test automation."}'
```

## Scripts

Inside `backend/`:

```bash
npm run dev
npm run check
npm run test
npm run build
npm start
```

From the repo root:

```bash
npm run backend:dev
npm run backend:check
npm run backend:test
npm run backend:build
npm run backend:start
```

## GitHub Actions and secrets

Locally, the backend reads from `.env`.

In GitHub Actions, it reads from environment variables that are typically populated from repository secrets. The workflow in [backend-smoke.yml](/Users/rohansunder/stack/projects/llm-testing-framework/.github/workflows/backend-smoke.yml) uses this pattern:

```yaml
env:
  PORT: 3001
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

That keeps the backend code the same in both environments. The only thing that changes is where the env vars come from.

## Project layout

```text
src/
  app.ts                  Express app setup
  server.ts               server entrypoint
  config/env.ts           env loading and validation
  routes/gemini.ts        request parsing and route handling
  services/gemini-service.ts
  lib/
tests/
```
