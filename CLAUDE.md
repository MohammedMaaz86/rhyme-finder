# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install

# Requires GEMINI_API_KEY in the environment
GEMINI_API_KEY=your_key npm start
```

Server runs on `http://localhost:3000` by default; override with the `PORT` env var. There is no build step, linter, or test suite.

## Architecture

Two files, no bundler:

- **`server.js`** (ESM) — Express server with a single endpoint `POST /api/rhymes`. Takes `{ word }` in the request body, calls Gemini 2.0 Flash with a system prompt that enforces JSON-only output (`{ perfect: string[], near: string[] }`), strips any accidental markdown fences from the response, and returns the parsed object. Also serves `index.html` as a static file.
- **`index.html`** — Self-contained frontend with all JS inline (no framework). Extracts the last word from the user's input (supports multi-word phrases), posts to `/api/rhymes`, and renders results as chips that copy to clipboard on click.

`GEMINI_API_KEY` must be set at runtime — there is no fallback or caching.