# UNWATCH

**Your learning, minus the replay.** Compare two YouTube tutorials, review what the second adds, and watch an editable selection of original sections.

## Run locally

Requires Node 22.22+ (Node 22.13 was used for the initial local checks; a transitive SDK dependency recommends 22.22+).

```sh
npm ci
npm run dev
```

Open http://localhost:5173. The labeled example, evidence review, selection controls, player preview, progress markers and local saved sessions work without credentials. The example is authored fixture data, **not a live analysis of real videos**.

```sh
npm test
npm run build
```

Production:

```sh
NODE_ENV=production npm start
```

The production server serves `dist/` and `/api` from one origin. Build first. The repository contains a Render free-service blueprint; no deployment has been performed.

## Documents

- [Product requirements](docs/PRD.md): scope, user journey, acceptance criteria, sponsors, spending limits, release gates.
- [Provider setup](docs/SETUP.md): credentials, quotas, Auth0, storage and deployment.
- [Implementation status](docs/STATUS.md): what works now versus what requires live verification.
- [Submission plan](docs/SUBMISSION.md): prioritized improvements, honest sponsor evidence, article draft, and remaining work.
- [Work tracker](docs/TODO.md), [real-video evaluation](docs/QUALITY.md), [DEV article](docs/DEV_ARTICLE.md), and [demo script](docs/DEMO_SCRIPT.md).
- [Design contract](docs/design/spec.md) and [QA notes](docs/design/QA.md).

## Implementation

- React + TypeScript + Vite frontend with a responsive comparison workspace.
- Custom 3D-style glass illustration, Motion transitions, reduced-motion support and self-hosted fonts.
- Express server with strict schemas, fixed upstream origins, same-origin checks and rate limits.
- Mastra workflow: retrieve/cache transcripts → Ultramarine comparison → citation/range validation.
- SerpApi caption adapter with an ElevenLabs Scribe fallback for videos without captions; no app-side video download or rehosting.
- Conservative rules keep low-confidence overlap, uncaptioned gaps, and sections without valid evidence.
- A distinct-detail assessment keeps mixed sections with new caveats or examples. Malformed long-video parts remain included with a notice; partial usage never produces an understated cost total.
- YouTube iframe player with selected-interval navigation, pause-aware automatic advance and full-video mode.
- MongoDB cache/session/budget adapter, with a local JSON store for development only.
- Optional Auth0 JWT-protected accounts, Backboard per-user assistants, and manually instrumented Sentry spans.

## Zero-spend default

Live providers are **disabled by default**. Copy `.env.example` to `.env`, claim the free credits, configure the services, then set `ENABLE_LIVE=true`. Keys never go into client-side variables. Public production live mode requires MongoDB and Auth0.

App-wide limits default to 200 SerpApi attempts total, 40/hour, 100 comparison attempts, and a $4 Ultramarine reservation budget. Every model request reserves $0.10, so the default reservation gate permits at most 40 attempts even if the 100-comparison limit has room. Actual usage is typically less, but the safety reservation is deliberately not refunded. Budget counters do not reset automatically. Other applications using the same key are outside these limits. Keep provider auto-top-up disabled.

Backboard requires an explicit model selection and has a separate 20-question cap. ElevenLabs is optional: if a SerpApi transcript is unavailable and `ELEVENLABS_API_KEY` is configured, the server sends the canonical YouTube URL to Scribe v2. The fallback reserves at most three attempts by default (`ELEVENLABS_MAX_ATTEMPTS`), including failures. Provider usage is still subject to the account's free allowance; do not enable paid top-up.

## What is not verified yet

The ElevenLabs fallback has passed both mocked tests and one real source-URL transcription of a captionless Docker tutorial. This verifies a specific video pair, not broad reliability across YouTube. The five-pair quality evaluation, login, cloud persistence and Backboard memory behavior still require live verification. Render is not deployed; Entire is not installed/capturing sessions in this workspace. These must be completed before claiming the corresponding sponsor integration in a submission.

## Limitations

- Two sources, each under three hours and 400 KB of transcript text. One long tutorial can be compared in bounded parts against a shorter one, whichever field it occupies; both timelines are retained. The shorter transcript must fit in 90 KB. Comparing two long courses together is outside this prototype. Each model call stays under 250 KB of indexed input.
- English requested first; SerpApi can return another available language. No translation UI yet.
- Speech analysis cannot reliably evaluate diagrams or silent coding. Keep visual sections when unsure.
- Caption end is not guaranteed to be video end; the player exposes full-video access and notes when more material exists.
- “Combine both” keeps A as the foundation and appends additions from B; it does not reorder a course pedagogically.
- Local sessions persist in this browser, up to 20. Cloud sync and account loading are explicit actions.
- Render free services sleep; their local disk is ephemeral. Use MongoDB for public live mode.
- This prototype is not unlimited free hosting/inference and has not been submitted to a hackathon.

## Data and privacy

The example uses no provider requests. Live caption requests send video IDs to SerpApi. If captions are unavailable and the optional fallback is configured, the canonical YouTube URL is sent to ElevenLabs for transcription. Comparisons send transcript text to Paper Instruments. Assistant use sends the question and bounded transcript excerpts to Backboard; memory is opt-in. Each learner receives an isolated assistant. Exact explicit progress remains in sessions, not inferred from memory.

Sentry automatic integrations are disabled: only manual spans and sanitized error codes are sent, avoiding request URLs containing API keys and caption/question content. Provider secrets stay on the server. Public transcript caches expire after seven days. Saved sessions remain until deleted; deleting a session does not erase separately opted-in Backboard memories. Full memory deletion controls are a follow-up requirement before wider launch.

## Sources and credits

See the PRD for official API, sponsor and challenge references. Frontend icons: Lucide (ISC). UI font: DM Sans via Fontsource (OFL). Visual concept and glass illustration: built-in imagegen; all app controls are implemented in HTML/CSS/React. Sponsor libraries retain their original licenses. Demo caption excerpts are original illustrative text.

## Project layout

```text
src/                 UI, local persistence, Auth0 client, YouTube player
shared/domain.ts     Schemas, URL parsing, comparison validation, duration logic
server/              API, workflow, providers, budgets, storage and identity
tests/               Domain, provider-mock, workflow and persistence checks
docs/                PRD, setup, status and design evidence
render.yaml          Free-service deployment blueprint
```
