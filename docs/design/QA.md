# Visual and interaction review

Current reference: `concept-polished.png` (built-in imagegen; original `concept.png` preserved); implementation: `desktop.png`, `mobile.png`, `player.png`. Browser method: Codex in-app browser via CUA. No Playwright fallback browser was needed; documented browser locators were used for interaction checks. Screenshots were saved from the browser, not reconstructed from HTML. Both reference and implementation were directly inspected with `view_image`.

## Fidelity ledger

| Comparison point  | Concept → implementation                                                                                              | Resolution                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Composition       | Left learning rail, two-line editorial heading, glass illustration, two-source panel, comparison timelines, watchlist | Preserved; responsive rail becomes a compact top navigation                                                                         |
| Palette           | Pale warm paper, white surfaces, charcoal, lime, lavender                                                             | Preserved in CSS tokens; custom glass illustration is the one deliberate asset addition                                             |
| Typography        | Editorial serif headline with sans-serif UI controls                                                                  | Georgia headings + self-hosted DM Sans; font files bundled, no Google Fonts dependency                                              |
| Source form       | Numbered A/B fields, two mode choices, dark comparison CTA                                                            | Preserved; proper labels, radio semantics and visible errors added                                                                  |
| Timeline          | Two colored topic strips with source labels                                                                           | Preserved; corrected contradictory source content and times from the generated concept                                              |
| Watchlist         | Topic/reason/time/include columns and selected playback                                                               | Preserved; five actual example sections instead of a cropped three-row design; source evidence and reversible controls added        |
| Icons             | Thin outline navigation with a fast-forward wordmark                                                                  | Lucide outline controls and a filled fast-forward mark; consistent sizes                                                            |
| Responsive layout | Primary concept was desktop                                                                                           | Extended the same system to stacked fields, full-width metrics and readable row sections at 390px and 320px; no horizontal overflow |

## Intentional differences

- The original concept was 1504×1043; the revised concept is 1482×1061. Browser review uses 1440×1000. Main structure is retained; below-fold content expands to show all five example sections.
- The original concept's inconsistent 30-minute/50-minute figures were corrected to a 50-minute B. Selected playback includes 2-second context padding, merged to avoid double counting: 18:04 selected and 31:56 omitted, rounded to 18/32 minutes in the overview.
- “32 min of overlap” became “32 min left out” because user edits and padding make the displayed metric a selection duration, not a guaranteed semantic overlap measurement.
- Tutorial A shows only baseline material, and B's new cleanup explanation is not also labeled as already covered by A.
- No unsupported dotted correspondence lines. Caption evidence establishes actual correspondence when available.
- “View evidence”, saving, selection reset and source-coverage notes are necessary PRD functionality and intentional additions. The comparison is plainly labeled illustrative; the preview never uses unrelated video footage.

Above-the-fold copy was checked against the design contract: brand, tagline, navigation, headline, subtitle, numbered fields, mode labels, compare CTA and example label match. Metric wording and accurate source titles are the documented corrections above. No invented marketing claims or sponsor-count metrics appear in the workspace.

## Interaction checks

1. Restore an omitted section → durations and selected count update.
2. Open caption evidence → both authored source excerpts visible; close dialog restores workspace.
3. Reset → two default example sections selected, 18:04 including context.
4. Watch selected → clearly labeled preview, explicit Got it / Keep practising controls and completion state.
5. Save → reload → Saved sessions → Continue. A reload overwrite bug was caught, fixed, and rechecked: one explicitly understood topic survived reload.
6. Combine both → A retained plus B additions, 8 of 11 sections, 66:04 selected.
7. Submit two valid URLs without keys → setup error, no invented result or silent demo substitution.
8. Workspace connections → honest provider status; mobile icon buttons have accessible names.

The implementation was reviewed for fidelity to the selected concept with the deliberate functional/data corrections above. Live provider quality and actual YouTube playback are separate release gates, not implied by visual verification.

## Final polish review

- Hero composition: the two-line heading and right-hand glass video frames match the revised direction. The asset is decorative, a transparent WebP, and responds to mouse movement with a restrained spring tilt.
- Typography: native Georgia and DM Sans reproduce the editorial/UI contrast. The revised concept's heavier display serif is approximated, not claimed as an exact font match.
- Palette: paper and charcoal remain dominant; lavender marks familiar material and lime marks useful additions. The duration panel uses a lighter lime so it does not compete with the main button.
- Geometry: 224px rail, 40px desktop gutters, 10px panel corners, paired URL inputs, and consistent 44px primary controls are retained.
- Timeline deviation: A remains segmented and interactive rather than a single decorative strip. Both sources have real accessible labels, caption coverage scales and evidence dialogs.
- Watchlist deviation: all five example rows, view-evidence buttons and reversible selection controls remain. This makes the page taller than the cropped three-row concept.
- Copy diff: main heading, subtitle, source labels, mode labels and compare CTA are preserved. Placeholder copy is “Paste a YouTube link” rather than a pseudo-URL; A/B topic text and exact durations are tied to the authored fixture. No extra claims, logos or marketing statistics were added.
- Generated macOS window buttons are excluded: they belong to mockup chrome, not the app.
- Mobile: the illustration scales to 100–130px; navigation stays on one line; input font is 16px; rows stack. Checked at 390×844 and 320×740 with document width exactly equal to viewport width. Tablet at 768px has no document overflow.
- Animation: short page/dialog transitions, shared navigation highlight, animated selected-duration totals, and pointer tilt. CSS media queries and Motion's reduced-motion hook/config disable decorative movement when requested. This preference was code-reviewed; OS preference switching was not exercised in the browser.

The two reference/rendered designs were inspected directly with `view_image`, including desktop, narrow-phone and tablet captures. Remaining differences are deliberate functional additions and font/layout approximations documented above; this is not a pixel-identical reproduction.

Post-polish checks: selection changed 18/32 to 30/20 then reset; save/reopen and an understood topic survived reload; the production bundle loaded its local assets with no console warnings/errors; empty library and its create-watchlist action worked; provider-disabled errors stayed explicit. Keyboard Enter opens evidence and Escape returns focus to the triggering topic button after the dialog focus cleanup was strengthened. Eleven regression tests and TypeScript/production build pass. Live caption comparison and YouTube playback still require credentials and separate verification.
