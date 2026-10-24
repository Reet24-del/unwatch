# Build status — 24 October 2026

## Submission-readiness pass

- Added a pre-watch review callout that explains exactly what is excluded, including an honest zero-skip state. All / Left out / Included filters make long watchlists easier to inspect without changing selections.
- Verified the review flow in the browser with the illustrative React example: three excluded sections, evidence dialog, and a saved screenshot at `docs/design/review-flow.png`.
- Created `docs/SUBMISSION.md` with prioritized suggestions, a DEV article draft, sponsor evidence boundaries, and a final checklist.
- Initialized a local Git repository for the challenge window. It has no commit or public remote yet; `.env`, `.data`, `dist`, and `node_modules` are ignored.
- Current suite: 16 passing tests; TypeScript and production build pass. The initial sandbox test run could not bind a loopback port; rerunning with local socket permission passed.

## Later live-integration work

- SerpApi and Ultramarine keys were configured and exercised against real YouTube links. One Docker tutorial had no YouTube captions; SerpApi returned no transcript, so the comparison correctly stopped without fabricating results.
- Added an optional ElevenLabs Scribe v2 fallback that sends the canonical YouTube URL when SerpApi reports no captions. It groups word timestamps into bounded snippets, caches the result, identifies AI-transcribed sources in the UI and reserves a maximum of three attempts by default.
- The fallback is covered by a mocked provider/cache test and the whole suite has 13 passing tests. A credentialed run of the two Docker links succeeded: ElevenLabs transcribed `qN1CzLdCq5g` in Hindi, SerpApi supplied `H8Lyj2D_cWo`, and Ultramarine returned a validated watchlist. The browser displayed the AI transcript label and editable comparison. This verifies one pair, not broad reliability across YouTube.
- A later run exposed an Ultramarine response with invalid section citations. The server now retains valid sections and conservatively keeps any unverified spans instead of rejecting the entire watchlist. The same Docker links completed in the browser after this change; the 14-test suite and production build pass.
- A 126-minute Docker tutorial (`exmSJpJvIPs`) exposed the initial 60-minute/60-KB cap. The app now accepts source transcripts under three hours/400 KB and compares a long second video in bounded parts against the first, retaining the full timeline. The exact pair with `qN1CzLdCq5g` completed through the API and browser; 15 tests and the production build pass. The returned watchlist remains conservative because most of the long course adds material beyond the short introduction.
- Putting that 126-minute tutorial first exposed the combined model-input cap. The app now chunks a long first video as well, compares the short second video against every part, and skips a second-video section only when a full, cited match is verified. The exact pair with `Ulxmu3bgFRU` succeeded through the API and browser. The current suite has 16 passing tests and the production build passes.

## Delivered in the first build

- Complete PRD with scope, acceptance criteria, sponsor/free-credit plan, privacy, budgets and release gates.
- Original UI concept and working React implementation, responsive desktop/mobile workspace.
- Two-link input, URL validation, new-material / combined modes and explicit error states.
- Timeline review, evidence dialogs, inclusion/reset/select-all controls and computed padded durations.
- Clearly labeled authored example and interactive player preview.
- YouTube iframe player implementation with full-video mode and pause-aware interval advancement.
- Local saved sessions and explicit knowledge markers; browser reload persistence verified and a reload overwrite bug fixed.
- SerpApi and Ultramarine server adapters connected through an actual Mastra workflow.
- Validation prevents malformed/out-of-bounds model citations, missing evidence and low-confidence overlap from silently removing material.
- Transcript cache, atomic budget reservations, input/output bounds, rate limits and same-origin checks.
- Optional MongoDB store, Auth0 identity verification, isolated Backboard assistants and manual Sentry spans.
- Free Render blueprint, `.env.example`, setup instructions, MIT license and locked dependencies.

## Visual polish completed

- Custom glass video-ribbon illustration in the workspace and empty saved-library state; optimized transparent WebP is 60,784 bytes.
- Two-line editorial hero, larger form/row text, refined paper/lime/lavender surfaces, and mobile touch targets.
- Spring-driven illustration tilt, shared navigation highlight, page transitions, animated duration totals, and dialog transitions. CSS and Motion respect the system reduced-motion preference; no continuous decorative animation.
- Auth0 loads only when configured, removing the previous oversized initial bundle warning.

## Verification completed

- `npm test`: 16 passing tests. Domain rules, mocked retrieval/cache, actual Mastra workflow with mocked provider I/O, long-video chunking, local budget concurrency/persistence/corruption, API validation, missing-provider handling and cross-origin rejection.
- `npm run build`: TypeScript checks and Vite production compilation passed.
- In-app browser: editable selection, evidence review, example playback, explicit progress, save/reload/reopen, combined mode and missing-credential error.
- Desktop 1440×1000, tablet 768px, mobile 390×844 and narrow phone 320×740; both phone document widths equal viewport widths after fixing illustration overflow.
- Production bundle loaded under the Express security headers; empty library and evidence dialogs worked, no browser console warnings/errors.
- Keyboard evidence dialog open/close returns focus to the trigger.
- Generated concept and rendered screenshots inspected with `view_image`; visual comparison recorded in `docs/design/QA.md`.

## Still required before a real launch

1. The core SerpApi, Ultramarine and ElevenLabs credentials have been used locally; verify any additional partner accounts before claiming their categories. Do not commit `.env`.
2. A real SerpApi + Ultramarine run from the intended hosting environment; evaluate five diverse tutorial pairs and inspect every proposed skip. Three Docker pair configurations have passed local live analysis, but do not substitute for this quality sample.
3. Actual YouTube playback, seek and embedding-failure checks with accessible live video sources. The example does not pretend to play a real video.
4. Auth0 login/logout, two-user isolation, MongoDB restart persistence and Backboard returning-user memory tests against real accounts.
5. Sentry dashboard evidence, Render deployment and an actual Entire captured development session. Entire is not installed or enabled here.
6. Optional erase-memory controls for Backboard, before wider public use of persistent memory.
7. Demo recording and final submission article. A local draft is in `docs/SUBMISSION.md`; neither publication nor hackathon submission has been performed.

## Known engineering limits

The sign-in SDK is now a separate lazy-loaded chunk; production compilation no longer emits the previous >500 KB chunk warning. Local Node 22.13 ran the checks successfully, but a transitive SDK dependency requests Node 22.22+, so the Render blueprint specifies 22.22.0. Broader model quality is unmeasured. Core provider paths have been exercised locally; optional adapters are not claimed as credentialed end-to-end verified services.
