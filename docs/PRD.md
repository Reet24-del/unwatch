# UNWATCH — Product requirements

Version 1.0 · 24 October 2026 · Status: approved direction, implementation in progress

## Product promise

“I already learned this. Show me what the next tutorial adds.”

UNWATCH compares the spoken explanations in two YouTube tutorials, proposes an editable watchlist, and plays the original videos at selected timestamps. A learner keeps useful examples while avoiding repeated explanations. No downloads, subtitle uploads, extension, screen access, or video rehosting.

## Problem and audience

Learners often open multiple tutorials because the first explanation leaves gaps. Each new video repeats introductions and foundational material, while useful differences are buried. Summaries do not preserve the original demonstration; faster playback still makes users sit through repetition.

Primary audience: self-directed learners who already watched an introductory tutorial and want the additional material in a second. Secondary audience: beginners combining two explanations. Optimise for minimal input and reversible suggestions, not an automatic claim of mastery.

## Outcome and boundaries

Success means a user can paste two public, embeddable YouTube URLs, understand why sections are suggested for inclusion or omission, change the list, and watch it in the app. The first release compares spoken text: available YouTube captions or an optional ElevenLabs transcript when captions are missing. Some videos will remain inaccessible to both providers. Silent demonstrations, code shown without explanation, diagrams, and transcript errors cannot be assessed reliably. Keep uncertain material by default.

No promise of universal YouTube access, perfect equivalence, measured learning gains, or unlimited free service. Estimated time avoided is selected timeline duration, never a claim of actual time saved. Watching is not mastery. Never manufacture a comparison when a provider fails.

## MVP scope and priority

P0: two-link form; URL validation; caption retrieval/cache; conservative comparison; evidence links; editable segment selection; source timelines; embedded playback; explicit example data; local saved sessions; budget limits; useful failure states; responsive and keyboard-accessible UI.

P1: Auth0 sign-in; authenticated MongoDB session sync; Backboard assistant with isolated learner memory and caption-grounded answers; Sentry traces; deployed Render service; Entire development evidence.

P2: more than two sources, language selection/translation, full course playlists, cross-session automatic recommendations, quiz validation, voice recap, transcript export, collaboration, video/diagram analysis. No browser automation, video downloads, or new paid services in the MVP.

The first implementation should connect P0 end to end and provide configuration-gated P1 adapters. Missing credentials must not stop a clearly labeled, zero-network example experience. A configured provider is not equivalent to a verified integration.

## User journey and acceptance criteria

### 1. Start

Workspace opens with two empty URL fields and an explicitly illustrative comparison below. “Try an example” loads a fixture without calling sponsor services. Navigation includes Workspace, Saved sessions, and How it works. Local mode says saved on this device; it never claims account sync.

### 2. Add sources

Accept youtube.com/watch, youtu.be, /embed, /shorts, /live and supported YouTube subdomains; extract an 11-character video ID. Reject lookalike hosts, malformed URLs, duplicates, non-HTTPS URLs and arbitrary destinations. Always construct provider requests from the ID; never fetch a user-controlled URL.

Modes: “Find what's new” treats A as previously watched and selects added material in B. “Combine both” retains A as the base and appends useful additions from B; it is not an optimised pedagogical reorder. The UI must make this difference explicit.

### 3. Retrieve and compare

Server checks configuration and reserves budget before any billable request. SerpApi returns caption snippets with start/end times. If it reports no captions and ElevenLabs is configured, Scribe v2 receives a canonical YouTube `source_url` and returns timestamped words that are grouped into snippets. Cache by video ID, language and schema version. Missing captions, blocked/private videos, quota exhaustion, upstream timeouts and malformed data get distinct actionable messages. Do not silently replace the requested links with a demo.

Initial bounds evolved after live testing: two videos, each under three hours and 400,000 UTF-8 bytes of transcript text. One long tutorial can be analyzed in bounded parts against a shorter one in either field; the shorter transcript must fit within 90 KB. Comparing two long courses together is outside this prototype. Reject larger input rather than silently truncate. Transcript end is not necessarily video end; check actual duration in the player and label it transcript coverage elsewhere.

Mastra workflow: fetch/canonicalise captions → compare content with Ultramarine → validate and build watchlist. Send captions as untrusted source data, with no model tools. Request structured sections with source evidence. Validate every citation, range, ordering and confidence. Omit only well-supported equivalent explanations; retain uncertain sections, extra examples and gaps with no captions. Prefer larger coherent segments over sentence-level cuts. Include context padding for playback, merged without double-counting.

### 4. Review

Show both source timelines, selected duration, estimated omitted duration, and per-section classification: new material, useful example, overlap, or uncertain. Every suggested omission identifies evidence in A and B. The evidence drawer shows the exact supplied caption text and a source timestamp link. AI labels are suggestions, not facts.

All inclusion controls work with keyboard and touch. Restoring a section updates the duration immediately. Provide Select all and Reset suggestions. Never remove source access or hide uncertain material to inflate the reduction percentage.

### 5. Watch

Use the official YouTube iframe API with the original visible controls. Start only after user action; auto-advance among selected sections while the player is actually playing. Pause must stay paused. Show the current source and next/previous segment controls. Full-video mode disables automatic skips. Handle embedding-disabled, video-unavailable and iframe initialization failures with a source link.

An illustrative fixture uses invented caption examples and a local interactive player preview, not fabricated claims about real YouTube videos. Live comparisons use actual YouTube embeds.

### 6. Save and return

Local sessions retain the comparison, selections and per-topic status (“Got it”, “Keep practising”, “Not marked”). Persist only explicit user updates. Reloading recovers saved sessions; deleting removes them from the device. Do not persist raw API keys, access tokens or provider prompts in browser storage.

With Auth0 and MongoDB enabled, session documents are keyed to verified token subject; a user cannot read/update another user's records. Backboard uses a separate assistant per user, never a global shared memory. Memory is opt-in; MongoDB remains the source of truth for explicit progress. Answers must cite current caption evidence and say when the text cannot answer a question.

## Interface specification

Use the revised generated concept in `docs/design/concept-polished.png`: pale paper, dark ink, lime new-material highlights, lavender overlap, editorial serif headings and sans-serif controls. A narrow left navigation rail, a compact source form, horizontal timeline strips, and a readable watchlist form the desktop workspace. Mobile turns the rail into a compact top navigation and stacks the fields/timelines. The hero uses a custom glass tutorial-frame illustration; short transitions support selection and navigation, with reduced-motion support. No advertising landing page or fake metrics. See `docs/design/spec.md` for tokens, deliberate corrections to illustrative concept data, and component ownership.

## Architecture

React + TypeScript + Vite frontend; Node + Express backend; shared Zod schemas. One Render web service serves the production build and API. Provider secrets remain server-side. Mastra is the open-source workflow core, not a logo-only dependency. MongoDB is optional locally and required for public live usage with durable budgets. No GPU or always-on background worker.

Endpoints: GET /api/config (public nonsecret capability status), POST /api/compare, GET/PUT/DELETE /api/sessions, POST /api/assistant, GET /api/health. Local comparisons are synchronous bounded requests; persist results before response. Client reports actual request state, not a fake progress percentage. Provider timeouts are bounded and cancellation/error states are visible.

## Sponsor plan and evidence

| Sponsor       | Real responsibility                              | Free basis                               | Evidence required before claiming                   |
| ------------- | ------------------------------------------------ | ---------------------------------------- | --------------------------------------------------- |
| SerpApi       | Timestamped captions                             | 250 requests/month, 50/hour              | Real two-link run and cache-hit test                |
| ElevenLabs    | Speech transcription when captions are missing   | Free Scribe credits, account-dependent   | Real captionless source-URL run and usage record    |
| Ultramarine   | Caption comparison and reasoned additions        | $5 event credit, must be claimed         | Real output, validation, token/cost record          |
| Mastra        | Typed fetch/compare workflow                     | Apache-2.0 framework                     | Workflow executed by live route; code and trace     |
| MongoDB Atlas | Cached captions, owned sessions, budget counters | 512 MB free                              | Restart persistence and access isolation test       |
| Auth0         | Learner sign-in and API identity                 | Free plan                                | Login/logout and denied cross-user access           |
| Backboard     | Opt-in isolated learning assistant memory        | $5 new-account credit/30 days            | Separate assistants and returning-user conversation |
| Render        | App and API hosting                              | Free web service; 750 shared hours/month | Working public URL; document cold start             |
| Sentry        | Provider latency/errors, model token/cost spans  | Free Developer quota                     | Real trace screenshot and an issue diagnosed        |
| Entire        | Development session capture                      | MIT CLI                                  | Actual captured session referenced in write-up      |

ElevenLabs is an optional fallback rather than a dependency for captioned videos. Its API receives only validated, canonical YouTube URLs; the app does not download or host video files. The fallback has a three-attempt app cap by default, and real sponsor evidence requires a successful credentialed test. Do not add Browserbase, Temporal, a paid domain or DigitalOcean just to increase the count. Sponsor eligibility is subject to the actual challenge category requirements; no category or prize is guaranteed.

## Zero-spend controls

Provider keys are absent by default. Explicit `ENABLE_LIVE=true` activates billable paths after credits are claimed. No automatic top-ups; never add a paid billing plan. Public live mode requires authentication and durable budget storage. Local live testing can use a disk ledger, which must not be advertised as durable on Render.

Conservative initial app allocation: 200 SerpApi attempts total and 40/hour, counted before calls (including errors for safety); 100 comparisons total; $4 Ultramarine reservation budget, leaving $1 reserve. Bound input bytes and output tokens. Price snapshot: Ultramarine input $0.15/M tokens and output including reasoning $0.50/M; refresh before activation. Reserve a conservative $0.10 per comparison and never recycle uncertain reservations. Actual cost is shown separately. Counters need atomic updates to prevent concurrent overspend. These app limits do not account for other apps sharing the same provider key.

Backboard is off unless configured with a chosen model and an operator-reviewed allowance. Restrict each question length, source context and total calls; provider prepaid balance/no top-up is the ultimate spending boundary. ElevenLabs transcription is off unless keyed and has a separate `ELEVENLABS_MAX_ATTEMPTS` cap. A narrated recap remains out of scope. Sample and cap Sentry telemetry; omit transcript/user text and all credentials. Store text only in MongoDB, with cache expiry and document-size limits.

At budget exhaustion, block new analysis before calling providers. Existing local/saved results remain usable. These are prototype credits, not free service forever. Never assert exact run capacity before measuring actual token usage.

## Security and privacy

Validate requests and model output; use fixed upstream origins and bounded response sizes; no arbitrary code/tool execution. Caption text is untrusted data. Source text and model content render as text, never raw HTML. Use secure production headers and Auth0 JWT issuer/audience verification. Rate-limit expensive endpoints. Secret values must not appear in API errors, source control, client bundles or logs. Do not forward auth tokens to YouTube, SerpApi, Backboard or model providers.

Inform users before sending captions/questions to providers. Allow local deletion and authenticated deletion. Public caption cache is independent of private learning progress. Avoid collecting emails when only an opaque user ID is required. Transcript cache TTL: seven days; private sessions retained until deletion in prototype, clearly documented.

## Validation and release gate

- Unit tests: accepted/rejected URL forms, range validation, missing/invalid evidence, uncertain material retained, timeline gaps, merged playback padding and duration totals, atomic budget limits, data ownership.
- API tests with mocked providers: success, cache hit, missing keys, quota exhausted, unavailable captions, malformed model response and timeout; mocks never pass as sponsor verification.
- Browser: example → toggle sections → evidence → player preview → mark progress → save → reload → reopen → delete. Real playback tests must use accessible videos after live setup.
- Responsive checks at 1440px desktop and 390px mobile; labels, focus, escape behavior and reduced motion.
- Manual quality evaluation before publishing: at least five real tutorial pairs, including overlapping topic/different explanation, largely unrelated material, poor captions, and a visual demonstration. Review every proposed skip. Release only if no necessary distinct explanation is incorrectly omitted in this small set; report sample size honestly.
- No deployment claims until hosted URL works; no live-provider claims without credentialed end-to-end test. Include known limitations in README/submission.

## Build order and delivery

1. PRD, concept and design tokens.
2. Working local comparison review, illustrative player and persistence.
3. SerpApi + Ultramarine + Mastra backend with validation and budget controls.
4. Configurable Auth0/MongoDB/Backboard/Sentry adapters and setup guide.
5. Build/tests/browser review, then real credentialed run and deploy once accounts are configured.
6. Record a truthful demo and write submission with measured before/after examples, integration evidence and failures learned from.

Contest deadline supplied by official rules: 26 October 2026, 12:29 PM IST. Re-check before submission. Writing quality is heavily weighted; reserve time for the demo and article. This task starts the build and does not authorise submission on the user's behalf.

## Sources checked 24 October 2026

- https://dev.to/challenges/hacktoberfest-week3-2026-10-19
- https://serpapi.com/youtube-video-transcript and https://serpapi.com/pricing
- https://docs.paperinstruments.com/docs/ultramarine/chat-completions and /billing
- https://docs.backboard.io/dashboard and https://docs.backboard.io/concepts/messages
- https://mastra.ai/pricing and https://mastra.ai/docs/workflows/overview
- https://www.mongodb.com/pricing
- https://auth0.com/pricing
- https://render.com/docs/free
- https://sentry.io/solutions/ai-observability/
- https://github.com/entireio/cli
- https://developers.google.com/youtube/iframe_api_reference
