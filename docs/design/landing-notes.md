# Separate landing page — 25 October

The supplied orange laptop reference drives the new `/` landing page. `/workspace` contains the comparison app. Legacy `/#main` links and the existing Auth0 root callback still open the workspace. Logout returns home. Landing content renders without waiting for API configuration; workspace and Auth0 code load separately.

## Design and assets

- Hero concept: `landing-hero-concept.webp`.
- Process/footer concept: `landing-flow-concept.webp`.
- Production ribbon: `../../public/images/orange-ribbon.webp` (164 KB, transparent WebP).
- Built-in Image Gen was used for both concepts and the ribbon. Product preview text, timelines, laptop frame and controls are native HTML/CSS. The preview is labelled illustrative and is exposed as an image, not a working comparison.

Prompt briefs: a vermilion #ee4b16 Swiss grotesk landing hero, exact headline “Skip the replay. Keep the discovery.”, black workspace CTA, walkthrough link, tilted cream-screen laptop and orange chrome ribbon; a coordinated white process section with three numbered open rows and a black final CTA/footer. Standalone asset prompt: two broad molten orange chrome ribbon loops on transparent background, no text/UI/laptop, sharp studio highlights.

## Visual verification

Inspected concepts and IAB screenshots with `view_image`. Compared headline/copy, hierarchy and gutters, orange/black/white palette, angled product scene, row dividers, footer and mobile reflow. The implementation preserves the two-section composition, nav, headline, body, CTAs and process copy. An arrow was added to the header workspace link; the preview uses labelled illustrative lessons instead of generated faces, titles or claims. These are intentional adaptations for clarity and honest demonstration.

Fixed decorative artwork spilling into the process section. Checked 1440px desktop, 855px tablet and 390/320px phones. The small-screen product illustration crops deliberately; primary content and actions remain inside the viewport. CSS transform animation, hover transitions and anchor scrolling respect reduced-motion preferences. No WebGL dependency is required.

The browser interaction flow is landing → process anchor → workspace → example → caption-evidence dialog → home → walkthrough. The walkthrough recording still shows an earlier interface and is explicitly labelled captured/edited footage.

## Provider error reporting

SerpApi-unavailable → ElevenLabs errors now distinguish insufficient credits, authentication/permissions, throttling, source rejection, upstream outages, timeout and unreadable/network responses. Only safe predefined messages and HTTP statuses reach the client; raw provider bodies and credentials are excluded. Mocked tests cover each failure category. Existing production logs erased the original ElevenLabs response, so the earlier video's exact cause cannot be recovered from those logs. No new paid transcription was used for this change.
