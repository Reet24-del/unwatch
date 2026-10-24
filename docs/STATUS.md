# Build status — 24 October 2026

## Delivered

- React/TypeScript comparison workspace with animated illustration, timelines, exact source links, section review, inclusion controls and saved local sessions.
- Clear pre-watch review panel, All / Left out / Included filters and an honest zero-skip state.
- A labeled illustrative example and a recorded real React comparison replay. Both load without new API calls. The recorded public sample publishes only short caption excerpts, not entire transcripts.
- Original YouTube embedded playback with selected intervals, pause-aware advance and full-video mode.
- Express/Mastra retrieval → comparison → validation workflow with SerpApi, Ultramarine and optional ElevenLabs Scribe fallback.
- Distinct-detail assessment retains mixed content, useful caveats, examples and uncertain intervals. A malformed long-video part is retained with a notice. Partial usage does not produce an understated total-cost estimate.
- Budget reservations, caching, URL/schema checks, rate limits, same-origin enforcement, and optional MongoDB/Auth0/Backboard/Sentry adapters.
- Public source: https://github.com/Reet24-del/unwatch.
- Free Render preview: https://unwatch-byeb.onrender.com. New public analysis is disabled pending production accounts. The first build issue (production npm omitting build tools) was fixed with `npm ci --include=dev`.
- A 73-second narrated walkthrough from real captured UI states: https://unwatch-byeb.onrender.com/demo/. It is edited and uses offline synthetic speech.
- A complete DEV article draft, demo script, evaluation and ordered tracker: `DEV_ARTICLE.md`, `DEMO_SCRIPT.md`, `QUALITY.md`, `TODO.md`.

## Verified

- 18 automated tests and the production build pass.
- Five short-video comparison configurations completed after the detail guard. The one proposed skip was reviewed at caption level. Reversed pairs are included, so this is not five independent topics or a held-out benchmark.
- A previous real ElevenLabs source-URL transcription supplied the captionless Docker cache. Long-course comparisons worked before the latest recovery change; a later malformed result led to the tested recovery path.
- Real embedded playback, selected timestamp, Next section, pause, full-video selection and source URL checked in the browser. The public player also automatically advanced across the omitted interval to its second selected range at 02:04.
- Latest local interface inspected at 390px and 320px; console warning/error collection was empty. Screenshot: `design/mobile-final.png`.
- Git uses the owner's private noreply address. `.env`, `.data`, `.qa`, dependencies and build output are ignored. A pre-publication scan found no configured provider secrets in staged files.

## Remaining

1. Atlas project and free cluster are created; the database user is restricted to `unwatch`, and the approved laptop/Render network entries are active. Auth0 SPA, RS256 API, exact callback/logout/origin URLs and user-delegated access are configured. Local and Render Auth0 configuration respond correctly. Local MongoDB connection and app-store write/read/remove checks passed; all six reservation counters were migrated without resetting them, and the TTL index was verified. The local API was restarted with MongoDB. Remaining: saving the URI on Render (awaiting credential-storage approval), completed login, hosted persistence and user-isolation verification. Google sign-in reaches its consent page; a completed authenticated session is not yet verified.
2. A live rerun of long-course recovery and additional independent topic groups. The local reservation ledger is near its limit; it has not been reset.
3. Final user review of the saved DEV draft. The user-approved AI-assisted disclosure is saved. The deployed replay/evidence/save/reload checks passed; the public walkthrough played and reported a 73.535-second duration.
4. Publication of the DEV article through the official submission template. It is saved as an unpublished draft under Reet Singh; nothing has been submitted.
5. Optional partner paths need their own live evidence before those categories are added. Backboard memory deletion controls remain a wider-launch follow-up.
