# Final submission work tracker

Updated 24 October 2026. Work proceeds in the order below. No secrets belong in submitted material.

1. [x] Inspect the existing provider ledger and reuse cached transcripts.
2. [x] Run five real comparison configurations after the detail-retention fix; review every proposed skip against its caption evidence. See `QUALITY.md`. This is a narrow pilot, not a learning-outcome study.
3. [x] Fix the discovered mixed-content false skip: require an explicit assessment that a section adds no distinct detail before omitting it. An absent assessment keeps the section.
4. [x] Recover malformed parts of long-video analysis by retaining those parts. Do not hide missing cost data or provider/budget failures. Regression tested.
5. [ ] Repeat the corrected long-video path live. A fresh long-course attempt failed before recovery was added; the remaining application budget cannot fund another complete long-course run. Do not reset the ledger to bypass the limit.
6. [x] Verify a real YouTube embed loads, starts near its selected timestamp, pauses, navigates to the next interval, and offers full-video mode and a source link.
7. [x] Check the latest local interface at 390px and 320px and inspect console health. Screenshot: `docs/design/mobile-final.png`. The public replay, evidence dialog, save/reload, health endpoint and walkthrough playback also passed.
8. [x] Run automated tests and production compilation: 18 tests pass.
9. [x] Initialize Git and verify `.env`, `.data`, build output, dependencies and private QA data are ignored.
10. [x] Commit and publish code under **Reet24-del**, the owner selected by the user: https://github.com/Reet24-del/unwatch. Network-enabled CLI verification succeeded; a private noreply commit address was used.
11. [x] Deploy the public example on the free Render service and verify its health: https://unwatch-byeb.onrender.com. The recorded real-result replay and narrated walkthrough are included in the release. A fully live public service additionally needs verified Atlas and Auth0 configuration. A public example plus a recorded local live demo is a valid fallback for demonstration.
12. [x] Prepare a demo script and accurate article content using measured results and proven integrations.
13. [x] Export a 73-second narrated walkthrough from actual captured UI states and insert the public demo/video/source URLs in `DEV_ARTICLE.md`. Video: `/demo/`. It is labeled as an edited walkthrough with synthetic narration.
14. [ ] Verify any additional partner account paths before listing their categories. These are optional: do not delay the core submission merely for more logos.
15. [ ] Final user review of the actual DEV article, AI disclosure, eligibility and publication. The complete unpublished draft is saved under Reet Singh on DEV with both required tags. Submit before the deadline in `SUBMISSION.md`.
