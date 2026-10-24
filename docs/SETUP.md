# Connect the free-tier prototype

Nothing here requires buying credits. If an account has no free allowance, leave that feature disabled. Do not paste secrets into chat, screenshots or frontend source.

## 1. Local setup

Run `npm ci`, copy `.env.example` to `.env`, and run `npm run dev`. In `.env`, keep `ENABLE_LIVE=false` until the core credits are available. The example already works.

## 2. Core analysis

**SerpApi:** create/use a free account at https://serpapi.com. Put its key in `SERPAPI_API_KEY`. The free plan currently lists 250 requests/month, 50/hour. The app reserves 200 total and 40/hour before requests. One transcript call normally covers one video. YouTube oEmbed supplies a title when available without using SerpApi quota.

**ElevenLabs fallback:** if you have free Scribe credits, set `ELEVENLABS_API_KEY`. When SerpApi confirms that captions are unavailable, the server sends the canonical YouTube URL to ElevenLabs Scribe v2 using `source_url`; the user still only pastes links. This can transcribe spoken audio, including videos without YouTube captions, but depends on ElevenLabs being able to access that particular URL. The app reserves at most three transcription attempts by default (`ELEVENLABS_MAX_ATTEMPTS=3`), including failed attempts, and caches successful transcripts. This is an attempt cap, not a precise credit cap. Check the provider dashboard's remaining free allowance and leave paid top-up disabled.

**Ultramarine:** claim the event's $5 promo at https://hacktoberfest.com/my/promos, then use the separate API console at https://platform.paperinstruments.com/keys to create a Paper Instruments API key. A Feather signup can show a waitlist; the official API documentation directs key creation to this platform console. Separate console availability does not guarantee that your account has API access. If the console also blocks key creation, leave this provider disabled; do not buy credits to work around access gating. Set `PAPERINSTRUMENTS_API_KEY`. The adapter uses `https://api.paperinstruments.com/v1/chat/completions`, model `ultramarine-1-flash`, JSON output, bounded completion tokens and low reasoning effort. Verify the promo was applied; ordinary API registration is not a guarantee of free credit. Do not add paid funds or enable auto top-up.

Once SerpApi and Ultramarine are available, set `ENABLE_LIVE=true` and restart. Test two short public tutorials first. Add ElevenLabs only if you want the no-captions fallback. Review every proposed omission against both actual videos. Test long and visual tutorials separately before claiming coverage.

Current documented rates used for estimates: $0.15/M input tokens, $0.50/M output including reasoning (24 October 2026). Cost estimates ignore cache discounts and are conservative. Recheck https://docs.paperinstruments.com/docs/ultramarine/billing before enabling a new account. The $0.10 per-call reservation is not the measured cost and is not refunded on failure. `MAX_COMPARISONS` is an additional cap, not a promise of capacity. Do not reset the ledger to evade the free-credit limit.

## 3. MongoDB Atlas

Create a Free cluster (512 MB), a dedicated database user restricted to the UNWATCH database, and configure network access for the actual host. Put its URI in `MONGODB_URI`, database name in `MONGODB_DATABASE`. Do not blindly open unrestricted network access. The application creates `records` and `budgets`; records get a TTL index for caption expiry. Budget increments are atomic. Session keys are prefixed with the verified owner's hashed subject.

Without MongoDB, local development writes `.data/store.json` with mode 0600. It fails closed on corrupt budget storage. This single-process fallback is not safe for multiple app instances or Render's ephemeral disk; production live mode refuses to start billable requests without MongoDB configured. A bad MongoDB connection stops server initialisation instead of falling back and losing budget counters.

## 4. Auth0

Create a Single Page Application and an API with an audience such as `https://unwatch-api`. Set:

```text
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-public-client-id
AUTH0_AUDIENCE=https://unwatch-api
```

Configure callback, logout and allowed web origins for `http://localhost:5173` (and `http://127.0.0.1:5173` if used), then the exact deployed HTTPS origin. The frontend obtains tokens in memory; the backend verifies RS256, issuer and audience. No client secret belongs in the SPA. Local development without Auth0 uses one local server owner; the frontend still saves sessions locally by default. Production API actions require a verified user.

After login, use **Sync session** to save the current comparison to your account. **Load account sessions** on Saved sessions merges cloud sessions onto this device. Verify two test accounts cannot access each other's data before public use.

## 5. Optional Backboard memory

New accounts currently list $5 for 30 days without a card. Set `BACKBOARD_API_KEY`, `BACKBOARD_PROVIDER`, and an available, low-cost `BACKBOARD_MODEL` verified in your account. No model is silently selected because pricing and availability vary. Default question cap: 20. Keep the account prepaid and auto-top-up off. Questions include limited excerpt context and ask for short replies, but model output length/memory charges are not a strict dollar cap; the provider's prepaid balance is the final boundary.

Open **Learning companion**, ask a question, and optionally enable memory. The server creates a unique assistant per verified user; threads do not share a global assistant. Session sync happens before the question. Test memory isolation with two accounts. The optional checkbox sends confirmed progress/preferences for memory; full erase-memory controls are not yet implemented, so keep this an opt-in prototype feature.

## 6. Optional Sentry

Create a Developer-plan project and set the server-only `SENTRY_DSN`. The app uses manual spans for the workflow, caption retrieval and model calls, with token/cost attributes when available. Automatic integrations are intentionally disabled to avoid leaking provider query strings or transcript content. Sampling is 20%. Verify a trace in the actual dashboard before claiming Sentry integration. Monitor the free quota; no paid plan is required.

## 7. Render deployment

`render.yaml` configures one free Node web service. Connect a repository containing this code using Render's dashboard/blueprint workflow. Build command: `npm ci --include=dev && npm run build`. The explicit include is required because the production environment otherwise omits TypeScript and Vite. Start command: `npm start` with `NODE_ENV=production`. Health path: `/api/health`. Use Node 22.22 or newer.

Set `APP_ORIGIN` on Render to `https://unwatch-byeb.onrender.com`, configure MongoDB/Auth0 first, then add server-side provider secrets. Add that same origin to Auth0 callback/logout/web-origin settings. Keep local `.env` origins pointed at localhost for local development. Before public live mode, preserve existing budget reservations when moving to MongoDB or reconcile allowance against the provider dashboard; a new database must not silently reset the same keys’ spending limits. Free services sleep after inactivity and have ephemeral disk. Do not rely on local file storage or an always-on worker. Use the default Render domain; a paid domain is unnecessary.

Verify health, login, same-origin API, real captions, playback, persistence after restart and quota behavior. Keep live mode false if any required account remains unconfigured.

## 8. Entire and submission

Entire is not installed/capturing here yet. Once this directory is a Git repository and the official CLI is installed, run `entire enable` following https://github.com/entireio/cli. Capture actual subsequent agent work; do not invent historical session evidence. Existing Codex access does not imply other coding agents are free.

Keep at least five manually reviewed tutorial pairs and one real failure case for the submission. Include actual provider usage and trace evidence. A configured SDK or illustrative example alone does not establish a sponsor category entry.
