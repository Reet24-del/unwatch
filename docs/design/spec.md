# UI implementation contract

Current reference: `concept-polished.png` (original preserved as `concept.png`), generated with the built-in imagegen tool on 24 October 2026. This is the selected implementation direction, not an assertion of separate user design approval.

Tokens: paper #f7f7f2; white surface #ffffff; ink #20231e; muted #6a736e; border #dedfd6; lime #d5f96b; lavender #ede9f6. Heading: Georgia/serif; UI: self-hosted DM Sans. Desktop sidebar 224px; main max-width 1240px, 40px horizontal gutters. Corners 6–10px. No gradients. Thin outline icons from Lucide. Native UI text and controls; the concept is not used as a screenshot background.

Ownership: App (navigation/composition), ComparisonForm (inputs/modes), ComparisonView (timelines/summary), Watchlist (selection/evidence), Player (source playback), Library (saved sessions), AssistantPanel (optional learning memory), Settings (capability details), shared domain/state helpers.

Primary copy: UNWATCH; Your learning, minus the replay.; Workspace; Saved sessions; How it works; Local workspace; Saved on this device; My workspace / New comparison; Try an example; Less replay. More progress.; Find what the next tutorial actually adds.; Already watched; Up next; Paste a YouTube link; Find what's new; Combine both; Compare tutorials; EXAMPLE COMPARISON · Illustrative data; A shorter route through React; Your watchlist; Watch selected; TOPIC; WHY IT'S HERE; TIME; INCLUDE; Suggestions use captions. Keep visual demonstrations when unsure.

Intentional concept corrections: the generated image's 30-minute source and 50-minute savings arithmetic conflict; use consistent 50-minute fictional B with 18 minutes selected and 32 omitted. A does not show new cleanup material if B's cleanup is labelled new. Connection lines are omitted when no precise correspondence is proven. Add evidence disclosure, selection reset, save and transcript-only coverage labels because the PRD requires them. Keep all example source text and timings clearly fictional. Demo player is an interactive preview and never an unrelated video misrepresented as the example.

Mobile: sidebar becomes top bar; navigation stays on one compact line; source fields stack; timeline labels sit above horizontally readable strips; table rows become topic sections with paired inclusion controls. Primary mobile controls use 44px touch targets and visible focus. Motion respects reduced-motion.

Concept prompt: full desktop tool workspace, editorial paper/ink/lime, left rail, two-link input panel, labelled illustrative two-source comparison, colored topic timeline, watchlist with inclusion controls. The exact generation brief is in `prompt.txt`.

## Requested visual refinement

The user requested a top-quality website with animation and 3D illustration. The revised concept uses a two-line hero, with a custom transparent glass ribbon of tutorial frames in the upper-right. The image is decorative and stays out of the review controls. Native React/CSS remains the interface. The original PNG is archived as `learning-ribbon.png`; the app serves the optimized 800px WebP at 60,784 bytes.

Desktop hero: 76px maximum serif heading, 330px illustration column, 248px reserved height. Mobile: 30–51px headline, illustration 100–130px, a two-line subtitle when needed. The visual's restrained mouse tilt springs back on pointer leave. No endless floating animation. Navigation, route changes, numerical totals and dialogs use short meaningful transitions. Reduced-motion users get static placement and immediate totals.

Concept prompt direction for this revision: keep the established UNWATCH paper/ink/lime/lavender workspace, enlarge the editorial two-line headline, place the supplied glass-frame illustration to its right, retain the two-link input, 18/32 minute example overview, comparison timelines and readable watchlist. Any browser/window chrome in the generated concept is outside the application and is not implemented.
