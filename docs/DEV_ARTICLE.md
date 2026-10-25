---
title: 'UNWATCH: finding what a second tutorial actually adds'
published: false
tags: devchallenge, hf26challenge
---

_This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)._

## What I Built

My sister is preparing for her board exams and entrance exams at the same time. There is a lot to cover, and not enough time to watch every explanation from the beginning.

She opens another video to understand a topic better. But she has to watch part of it just to find out that she already knows that part. What she needs might be further ahead: a different explanation, a new example, or the one step she did not understand before.

That is the problem behind **UNWATCH**: how do you find what the next tutorial adds before spending your study time replaying what you already know?

I built it to compare those two tutorials. Paste the YouTube link you've watched and the one you're considering. UNWATCH reads the available captions, identifies possible repetitions, and creates an editable watchlist of the original video sections. New examples and uncertain material stay included.

The useful part happens before you press Play. Each proposed skip comes with source caption excerpts. You can check the reasoning, restore a section, and watch the original video at the selected intervals. No subtitle upload or extension is needed.

The theme is “Slow and Steady.” For someone juggling two sets of exams, spending less time finding the useful part leaves more time to work through it.

## Demo

[Try UNWATCH](https://unwatch-byeb.onrender.com) · [Watch the short walkthrough](https://unwatch-byeb.onrender.com/demo/)

Choose **Replay a real result** to open the exact measured comparison without spending credits. The public site also includes a clearly labeled illustrative example. The 2 minute 21 second walkthrough is edited from my real screen recording, with local synthetic narration, captions, and an original ambient score. Waiting is shortened. It shows a fresh long React comparison and then the separately labelled saved React result. The live results below come from real YouTube captions and a real transcription path, rather than that example.

In one React comparison, the second tutorial used an interactive 3D scene to teach state. UNWATCH kept those examples and proposed omitting only a repeated explanation of the state value and setter. Its assessed timeline went from **9:56 to 8:57**, with **59.481 seconds** left out after context padding. I checked both cited caption excerpts. I can include the section again with one click.

Four other comparison configurations kept everything. That includes an unrelated React/Docker pair: two videos sharing words like “application” does not make their explanations interchangeable.

## Code

[Source code and setup](https://github.com/Reet24-del/unwatch)

The project uses React, TypeScript, Express, and shared validation schemas. The workflow lives in `server/workflow.ts`, provider adapters in `server/providers.ts`, and section validation and playback ranges in `shared/domain.ts`. The repository includes an MIT license, setup instructions, application budget controls, and known limitations.

## How I Built It

The core path is simple: retrieve timed speech, compare the explanations, validate the proposed sections, then let the learner review them. Seven partner services support that path. Each has a specific job.

### Mastra: make the comparison a workflow

The open-source Mastra workflow runs caption retrieval and then comparison, with typed input and output schemas between the steps. Citation and timeline validation run inside that comparison path. This makes the boundary between retrieved evidence and a suggested watchlist visible in the code. For the learner, it means the app can stop with a useful error instead of presenting an unsupported result. [Workflow code](https://github.com/Reet24-del/unwatch/blob/main/server/workflow.ts).

### SerpApi: turn a YouTube link into timed source material

UNWATCH calls SerpApi's `youtube_video_transcript` engine to retrieve captions and their timestamps. Those timestamps connect a proposed section to the original video and support the evidence links. The user pastes a link instead of downloading a video or uploading subtitles. This is caption retrieval, rather than a general web-search feature. [Retrieval adapter](https://github.com/Reet24-del/unwatch/blob/main/server/providers.ts).

### ElevenLabs: recover speech when captions are missing

When the caption route has no usable text, the optional Scribe fallback submits the canonical YouTube URL as `source_url` and requests timed transcription. A real captionless Docker source passed through this path during development; later runs reused the cached transcript. This widens the set of videos the app can compare, but source access, account allowance, and the prototype's attempt cap still apply. The demo's voiceover uses local Kokoro speech; ElevenLabs is integrated for tutorial transcription. [Transcription adapter](https://github.com/Reet24-del/unwatch/blob/main/server/providers.ts).

### Ultramarine: compare explanations, not just matching words

Paper Instruments' Ultramarine model reads the timed transcripts and proposes sections, reasons, caption references, and an assessment of whether each section adds a distinct detail. The server checks those references before showing the result. A repeated term alone should not remove a new example or caveat. The measured React result below records its tokens and estimated model cost. [Comparison adapter](https://github.com/Reet24-del/unwatch/blob/main/server/providers.ts).

### MongoDB Atlas: remember sessions and preserve the allowance

Atlas stores account-scoped comparisons and expiring caption caches, so a saved session can reopen and a cached transcript can be reused. It also stores the shared provider-budget ledger. Atomic conditional reservations check the remaining allowance before a call, including when requests arrive together; restarting the server does not reset that ledger. This keeps a public prototype manageable within its configured allowance. [Store implementation](https://github.com/Reet24-del/unwatch/blob/main/server/store.ts).

### Auth0: connect the workflow to the right account

Auth0 handles sign-in and supplies access tokens. The backend verifies their signature, issuer, and audience, then uses the verified user identity to scope saved-session access. A learner can explicitly sync a comparison and reopen it from their account. Sign-in and session sync passed a real one-account public test; owner isolation also has automated coverage. The project does not use Token Vault or fine-grained authorization. [Authentication code](https://github.com/Reet24-del/unwatch/blob/main/server/auth.ts).

### Render: put the whole app behind one public URL

A free Render web service hosts the built React interface and Express API together. Provider credentials stay on the server, and the frontend calls the same-origin API. Judges can open the workspace or replay a saved real result without installing the project. A free instance may need time to wake up. [Deployment configuration](https://github.com/Reet24-del/unwatch/blob/main/render.yaml).

The first hard lesson was that a citation can be valid while a skip is wrong. An early result marked a Docker/VM explanation as repeated, even though it added an OS-compatibility caveat. I tightened the prompt and added an explicit check for distinct details. A section stays included when the model identifies an extra example, caveat, or practical step—or fails to supply that assessment.

Long videos exposed another problem. One malformed model response could throw away the entire comparison. The chunk handler now retains an unassessed part and preserves usable parts around it. It tells the user what happened. It also withholds a total-cost estimate if usage data is incomplete. That recovery has a regression test. The screen recording also shows a fresh long React comparison retaining roughly 80 minutes and omitting nothing. It demonstrates the normal long-video path; malformed-part recovery was tested with simulated responses rather than deliberately triggered in production.

The current automated suite has **20 passing tests**. It covers source validation, caption caching and transcription fallback, grounded section references, long-video timelines, conservative recovery, and budget isolation. The production build passes. In browser checks, a real YouTube embed started at a selected timestamp, paused, navigated to another interval, and offered full-video mode.

The real React run returned 19,563 input and 2,170 output tokens: **$0.00401945 in estimated model usage** at the adapter's configured rates. Five successful configurations totaled $0.02435370. Those figures exclude caption/transcription usage and failed requests. They are token-based estimates, not provider billing statements. The full development evaluation is included with the code.

## Why Does Open Innovation Matter?

Mastra is the open-source framework at the center of the app's AI workflow. Its steps are explicit and inspectable: fetch the source, compare it, then validate what can be shown to the learner. The validation rules and provider adapters are also available in the project source, so another builder can change the comparison behavior or substitute a provider.

That mattered when I found the bad skip. I could change the validation boundary and add a focused regression test. The learner's review UI did not need to change. This is a hosted-model prototype; I am not claiming offline inference or an open-weight model.

## The Lazy Payoff

My sister has tried the prototype. Her situation shaped the problem: she has already covered part of a topic and needs another explanation without restarting the whole lesson. The examples measured here are programming tutorials; I have not yet established how well the app works on board-exam or entrance-exam material.

UNWATCH takes on the comparison work: finding the repeated explanation, showing its evidence, and lining up the remaining intervals. The learner keeps the final decision.

The current pilot is deliberately modest: five configurations, with reversed pairs among them, covering two main topic groups plus an unrelated-topic check. Only one section was proposed for omission. It is enough to demonstrate the workflow, but not enough to claim general accuracy or improved learning. Caption analysis also cannot judge silent demonstrations reliably, so those deserve extra care.

My next improvement would be a broader review set and feedback on which suggested skips people restore. For this prototype, I want each suggested shortcut to be explainable and easy to undo.

## Prize Categories

- **Best Use of Render:** the public React interface and Express API run together on a real free Render web service. The public replay lets judges inspect a saved live result without new inference requests.
- **Best Use of Mastra:** the actual comparison route executes the open-source workflow for retrieval, comparison and validation.
- **Best Use of Ultramarine:** it reasons over the real transcripts; the token counts and estimated run costs above show what it did.
- **Best Use of ElevenLabs:** Scribe transcribed a real captionless Docker source and supplied timed text to the workflow. Later evaluation runs reused that cached transcript.
- **Best Use of SerpApi:** its YouTube transcript API supplies source captions and timestamps that ground the comparison. This is the project's specific use of SerpApi.

- **Best Use of MongoDB Atlas:** account sessions, expiring caption caches, and atomic provider-budget reservations use the connected Atlas database.
- **Best Use of Auth0 for AI Agents:** Google sign-in and verified access tokens protect live comparisons and account session sync.

I used Codex to help implement, test, and edit the project. The demo narration uses local Kokoro synthetic speech. Backboard and Sentry are not connected and are not category claims. Public live requests remain subject to provider availability and the application allowance; the saved real result stays available without new provider calls.
