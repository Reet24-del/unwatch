# UNWATCH submission plan

Target: [Hacktoberfest Open-Source AI Challenge: Week 3](https://dev.to/challenges/hacktoberfest-week3-2026-10-19). The [contest rules](https://dev.to/page/hacktoberfest-week3-2026-10-19-contest-rules) set the deadline at **October 25, 2026, 11:59 PM PDT**, or **October 26, 2026, 12:29 PM IST**. Writing quality is the most heavily weighted criterion; the final post should explain one real learning problem and demonstrate a real result, rather than list sponsor logos.

## Product suggestions and status

| Priority | Suggestion | Status |
| --- | --- | --- |
| P0 | Put excluded sections in a clear pre-watch review step and let people restore them after reading evidence | Built. The callout and “Left out” filter lead directly to the excluded sections. |
| P0 | Make long watchlists scannable | Built. All / Left out / Included filters work without losing selection. |
| P0 | Say plainly when the comparison finds no safe shortcut | Built. The zero-skip state explains that no material was removed. |
| P0 | Keep an honest, no-key example for judges | Built. It is labeled illustrative; saved screenshot: `docs/design/review-flow.png`. |
| P0 | Verify a live captionless video and a long-course comparison | Done for specific Docker links. Do not generalize to all YouTube videos. |
| P1 | Review real pairs and measure omitted time and false skips | Five short-video configurations completed; see `QUALITY.md` for sample limitations. Additional topic groups and long-course recovery need review. |
| P1 | Verify real YouTube embed seeking and the fallback source link | Verified on the saved React pair: embed, playback, seeking, pause, full-video mode and correct source URL. |
| P1 | Publish a public demo and code repository | Open. Public live analysis requires durable MongoDB budgets and Auth0 identity; keep live mode off until those are configured and tested. |
| P1 | Capture a short, narrated before/after demo | Open. Show the inputs, evidence, a restored skip, actual playback, and a candid failure/zero-skip state. |
| P2 | Verify optional sponsor paths: MongoDB, Auth0, Backboard, Sentry, Render, Entire | Open. An adapter or blueprint alone does not qualify as a real integration. |

## Sponsor claims that the current evidence supports

- **Mastra:** a real workflow performs transcript retrieval, model comparison, and validation on the live route. It is the open-source AI framework at the center of the system.
- **Ultramarine:** real Docker-link comparisons produced structured sections that passed citation validation. Fresh token counts and model-cost estimates are recorded in `QUALITY.md`; distinguish them from provider billing.
- **ElevenLabs:** one captionless Docker video was transcribed via Scribe v2 `source_url`, then compared successfully. Its reliability depends on source accessibility and free account allowance.
- **SerpApi:** real caption retrieval worked for captioned Docker tutorials and fed the workflow. Its category examples emphasize live search/RAG; transcript retrieval is a real use, but the fit may be less compelling than the three above. Explain the specific API call and why it matters.

Do not list Auth0, Backboard, MongoDB Atlas, Render, Sentry Agent Tracing, Entire, or a .tech domain as entered categories until the relevant account path works and the post shows evidence. Do not list DigitalOcean: this project has no credits for it. The challenge says a project can enter every partner category it **genuinely uses**, but can win only once per challenge.

## Draft DEV article

Suggested title: **I built UNWATCH so a second tutorial starts where my understanding ends**

Tags: `devchallenge`, `hf26challenge`

### What I Built

I keep opening a second tutorial because the first explanation almost worked. The frustrating part is that the second video starts from the beginning again. UNWATCH takes two YouTube links: one I have watched and one I am considering. It reads available captions (or transcribes speech when captions are missing), compares the explanations, and creates an editable watchlist of the original video sections. It shows which parts look repeated, which add a new example, and which are too uncertain to remove.

The important interaction happens *before* playback. I can open the exact caption excerpts behind a suggested skip, include that section again, and then watch selected time ranges in the original YouTube player. When the evidence is weak, UNWATCH keeps the section. In a 126-minute Docker course compared with a five-minute introduction, it found almost no safe time saving: the full course adds too many practical details. That is a useful answer too. The app does not pretend every second tutorial is redundant.

### Demo

**Add before publishing:** public app URL or a 60–90 second narrated video. Begin with the labeled example to explain the interface, then use one **real** pair and disclose exactly how many minutes the app selected and omitted. Show the evidence dialog and restore one skipped section. Include `docs/design/review-flow.png` as a supporting screenshot, clearly labeled as illustrative data.

### Code

**Repository:** https://github.com/Reet24-del/unwatch. Link to `server/workflow.ts`, `shared/domain.ts`, and `server/providers.ts`. The repository should include the setup steps and `.env.example`, never `.env` or stored transcripts.

### How I Built It

Mastra runs the fetch → compare → validate workflow. SerpApi supplies timestamped YouTube captions. When a video has no captions, the optional ElevenLabs Scribe path accepts its canonical YouTube URL; UNWATCH does not require users to download or upload video. Ultramarine proposes bounded sections, reasons, and caption references. The server validates timestamps and citations and retains any section it cannot justify omitting. The React interface displays both timelines and lets the learner change the watchlist. The backend reserves provider budget before requests so a free-credit prototype has a hard application-side limit.

The first real captionless Docker link failed as it should: no captions meant no invented comparison. Adding the ElevenLabs path made that specific pair work. A later model response contained invalid citations; instead of trusting it, the validator kept unverified intervals. A 126-minute tutorial then exposed an input limit, so long transcripts are compared in bounded chunks while retaining a full timeline. These failures shaped the product's promise: save time only when the evidence supports it.

### Why Does Open Innovation Matter?

The open-source Mastra workflow is the core orchestration, with explicit retrieval, comparison, and validation steps that can be inspected and changed. The provider calls are replaceable server adapters, while the product's safety rule—never silently remove an unsupported section—lives in our shared, testable code. This does **not** run offline and the current model is **not** claimed to be open-weight. The open framework matters because the logic is auditable and another builder can substitute a model or transcript source without rewriting the learner's review flow.

### My Agent Session (optional)

**Add only if captured and shareable:** a real agent-session link. Do not invent one from this write-up.

### The Lazy Payoff

The goal is to avoid replaying an explanation I already understand while preserving the new example that finally makes it click. **Add measured real-pair result:** “In [pair], the second video was [X] minutes, the selected watchlist was [Y], and [Z] minutes were left out after reviewing [N] proposed skips.” Include a zero-skip case to show the system's boundary. These are estimated video minutes, not measured learning gains or guaranteed time saved.

### Prize Categories

Candidate categories after final evidence check: Best Use of Mastra, Best Use of Ultramarine, Best Use of ElevenLabs, and possibly Best Use of SerpApi. For each one, give a concrete sentence and proof (workflow trace/code, token/cost figure, transcription result, caption retrieval). Add any optional category only after its live path and evidence are verified. The official category wording is on the [challenge page](https://dev.to/challenges/hacktoberfest-week3-2026-10-19).

## Final submission checklist

1. Confirm eligibility and DEV account access in the [official rules](https://dev.to/page/hacktoberfest-week3-2026-10-19-contest-rules). The project and its repository must be started and completed in the challenge window; note any later commits in the README. The project is committed and public at https://github.com/Reet24-del/unwatch.
2. Make the repository public with no secrets or local cache. Add a short license/credits section and a link to the live demo or video.
3. Run the five-pair quality table: two similar tutorials, largely unrelated tutorials, captionless speech, a visually dependent demo, and a long/short pair. Record video IDs, caption source, selected/omitted minutes, every proposed skip's correctness, and provider cost. Publish the actual sample size.
4. Test playback, seek, pause, full-video link, saved-session reopen, and narrow-screen layout on the final deploy/demo pair. Keep the zero-skip state in the recording or article.
5. If using a public live site, configure and verify Atlas/Auth0 and the exact production origin before `ENABLE_LIVE=true`; otherwise host the no-key example and show the real analysis in a recorded local demo.
6. Record the short demo, replace placeholders in the article, attach the screenshot with its illustrative label, and list only proven partner categories.
7. Publish one English DEV post through the official submission template with `devchallenge` and `hf26challenge` tags before the deadline. Check every link in a private preview before publishing.
