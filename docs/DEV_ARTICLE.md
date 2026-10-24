---
title: "UNWATCH: finding what a second tutorial actually adds"
published: false
tags: devchallenge, hf26challenge
---

## What I Built

You finish a tutorial, understand most of it, and open another one for a better explanation. Ten minutes later, you're still watching the introduction you already know.

I built **UNWATCH** to compare those two tutorials. Paste the YouTube link you've watched and the one you're considering. UNWATCH reads the available captions, identifies possible repetitions, and creates an editable watchlist of the original video sections. New examples and uncertain material stay included.

The useful part happens before you press Play. Each proposed skip comes with source caption excerpts. You can check the reasoning, restore a section, and watch the original video at the selected intervals. No subtitle upload or extension is needed.

The theme is “Slow and Steady.” My version of laziness is spending less energy finding where the useful part begins.

## Demo

<!-- Replace these two links before publication. -->
[Try UNWATCH](https://unwatch-byeb.onrender.com) · [Watch the short walkthrough](https://unwatch-byeb.onrender.com/demo/)

Choose **Replay a real result** to open the exact measured comparison without spending credits. The public site also includes a clearly labeled illustrative example. The walkthrough uses captured UI states and an offline synthetic narration; it is edited rather than a continuous recording. The live results below come from real YouTube captions and a real transcription path, rather than that example.

In one React comparison, the second tutorial used an interactive 3D scene to teach state. UNWATCH kept those examples and proposed omitting only a repeated explanation of the state value and setter. Its assessed timeline went from **9:56 to 8:57**, with **59.481 seconds** left out after context padding. I checked both cited caption excerpts. I can include the section again with one click.

Four other comparison configurations kept everything. That includes an unrelated React/Docker pair: two videos sharing words like “application” does not make their explanations interchangeable.

## Code

<!-- Replace this link before publication. -->
[Source code and setup](https://github.com/Reet24-del/unwatch)

The project uses React, TypeScript, Express, and shared validation schemas. The workflow lives in `server/workflow.ts`, provider adapters in `server/providers.ts`, and section validation and playback ranges in `shared/domain.ts`. The repository includes an MIT license, setup instructions, application budget controls, and known limitations.

## How I Built It

**Mastra** runs the retrieval → comparison → validation workflow. **SerpApi** supplies timestamped YouTube captions. If captions are unavailable, the optional **ElevenLabs Scribe** path receives the canonical YouTube URL and transcribes speech. **Ultramarine** proposes sections and their corresponding caption references. The server checks those references and ranges before the UI receives the watchlist.

The first hard lesson was that a citation can be valid while a skip is wrong. An early result marked a Docker/VM explanation as repeated, even though it added an OS-compatibility caveat. I tightened the prompt and added an explicit check for distinct details. A section stays included when the model identifies an extra example, caveat, or practical step—or fails to supply that assessment.

Long videos exposed another problem. One malformed model response could throw away the entire comparison. The chunk handler now retains an unassessed part and preserves usable parts around it. It tells the user what happened. It also withholds a total-cost estimate if usage data is incomplete. That recovery has a regression test; a fresh long-video run remains pending within the free-credit allowance.

The current automated suite has **18 passing tests**. It covers source validation, caption caching and transcription fallback, grounded section references, long-video timelines, conservative recovery, and budget isolation. The production build passes. In browser checks, a real YouTube embed started at a selected timestamp, paused, navigated to another interval, and offered full-video mode.

The real React run returned 19,563 input and 2,170 output tokens: **$0.00401945 in estimated model usage** at the adapter's configured rates. Five successful configurations totaled $0.02435370. Those figures exclude caption/transcription usage and failed requests. They are token-based estimates, not provider billing statements. The full development evaluation is included with the code.

## Why Does Open Innovation Matter?

Mastra is the open-source framework at the center of the app's AI workflow. Its steps are explicit and inspectable: fetch the source, compare it, then validate what can be shown to the learner. The validation rules and provider adapters are also available in the project source, so another builder can change the comparison behavior or substitute a provider.

That mattered when I found the bad skip. I could change the validation boundary and add a focused regression test. The learner's review UI did not need to change. This is a hosted-model prototype; I am not claiming offline inference or an open-weight model.

## The Lazy Payoff

UNWATCH takes on the comparison work: finding the repeated explanation, showing its evidence, and lining up the remaining intervals. The learner keeps the final decision.

The current pilot is deliberately modest: five configurations, with reversed pairs among them, covering two main topic groups plus an unrelated-topic check. Only one section was proposed for omission. It is enough to demonstrate the workflow, but not enough to claim general accuracy or improved learning. Caption analysis also cannot judge silent demonstrations reliably, so those deserve extra care.

My next improvement would be a broader review set and feedback on which suggested skips people restore. For this prototype, I want each suggested shortcut to be explainable and easy to undo.

## Prize Categories

- **Best Use of Render:** the public React interface and Express API run together on a real free Render web service. The public replay lets judges inspect a saved live result without new inference requests.
- **Best Use of Mastra:** the actual comparison route executes the open-source workflow for retrieval, comparison and validation.
- **Best Use of Ultramarine:** it reasons over the real transcripts; the token counts and estimated run costs above show what it did.
- **Best Use of ElevenLabs:** Scribe transcribed a real captionless Docker source and supplied timed text to the workflow. Later evaluation runs reused that cached transcript.
- **Best Use of SerpApi:** its YouTube transcript API supplies source captions and timestamps that ground the comparison. This is the project's specific use of SerpApi.

I used Codex to help implement and test the project. Optional hosting, account, memory, and tracing adapters are documented separately; they are not included as proven prize-category claims here.
