# Real-video development evaluation — 24 October 2026

Five successful comparison configurations after the distinct-detail guard was added. All five reused real cached transcripts; the Docker cache includes a previously verified ElevenLabs transcription. These checks did not make five new transcription requests. Two configurations reverse the same pair, so this is **not five independent topic groups**. The Docker examples helped tune the prompt; this is a development regression sample, not a held-out benchmark.

| Case                             | Already watched → up next (YouTube IDs) | Up next | Selected, with context | Left out | Skips | Model input / output tokens | Estimated model cost |
| -------------------------------- | --------------------------------------- | ------- | ---------------------- | -------- | ----- | --------------------------- | -------------------- |
| React: counter → interactive 3D  | O6P86uwfdR0 → 3AIS-okLSUw               | 09:56   | 08:57                  | 00:59    | 1     | 19,563 / 2,170              | $0.00401945          |
| React, reversed                  | 3AIS-okLSUw → O6P86uwfdR0               | 15:46   | 15:46                  | 00:00    | 0     | 19,563 / 1,499              | $0.00368395          |
| Docker, captionless first source | qN1CzLdCq5g → H8Lyj2D_cWo               | 19:33   | 19:33                  | 00:00    | 0     | 31,525 / 2,885              | $0.00617125          |
| Docker, reversed                 | H8Lyj2D_cWo → qN1CzLdCq5g               | 08:16   | 08:16                  | 00:00    | 0     | 31,525 / 3,718              | $0.00658775          |
| Unrelated React → Docker         | O6P86uwfdR0 → Ulxmu3bgFRU               | 05:37   | 05:37                  | 00:00    | 0     | 22,432 / 1,053              | $0.00389130          |

Times are formatted down to whole seconds in the UI. The React omission is 59.481 seconds after context padding, about 10% of the assessed second video's timeline. The caption end can differ from the actual video end. These figures describe selected video intervals, not measured learning gains or a claim that a user saved that much time.

## Caption-level review

There was one proposed skip across these five runs. In tutorial B it spans 63.199–126.68 seconds and defines useState as a function accepting an initial value and returning the current state plus setter. The cited A interval, 265.16–332.63 seconds, explains the same signature and array ordering. The retained B sections include the interactive 3D rotation, pointer events, color and scale examples. The caption-level review found the proposed skip supportable; it does not prove that no useful visual information occurs in that interval.

The four zero-skip results preserve their full assessed second-video timelines. This is conservative behavior; it is not evidence of strong duplicate-detection recall. More overlapping topic groups and human review of the actual videos are needed before making broad quality claims.

## Failure found and fixed

An earlier long-course result excluded a Docker/VM section whose explanation also contained an OS-compatibility caveat. Exact citation validation caught invalid references but did not catch this semantic distinction. The model now explicitly assesses whether each section adds useful details, examples, caveats or practical steps. Missing or positive assessments keep the section. A regression test verifies this rule.

A new long-course run then returned malformed model output for one part. The old behavior rejected the whole comparison. The corrected chunk handler keeps that entire part as unassessed, preserves other valid parts, and displays a notice. When model usage is incomplete, it omits the total-cost estimate rather than understating it. Provider failures and exhausted budgets still stop the request. This recovery is regression tested; a new full long-course run is pending because the application reservation ledger is near its limit.

## Cost and budget interpretation

The five successful runs total **$0.02435370 in estimated Ultramarine model usage**, using returned token counts and the adapter's configured rates. This excludes transcription, caption retrieval, older runs, and the failed long-course request; it is not a provider invoice or total account spend. The application ledger reached $3.90 of its $4 reservation limit. Reservations are deliberately conservative and are not refunded, so that ledger differs from the token-based estimate. The ledger has not been reset.

## Browser verification

On `http://127.0.0.1:5173/#main`, the saved real React comparison loaded. The original YouTube embed loaded, playback started, the second selected interval started near 02:04, the elapsed display reached 02:05, pause was confirmed by the Play control at 02:11, and full-video mode was selectable. The source link pointed to the expected video. Screenshot: `docs/design/live-playback.png`. The saved result used the earlier section boundaries; it is playback evidence, not the numeric result in the table above.

Remaining: independent topics, a human visual review of every omitted interval, final mobile/console checks on the deployed app, and a live rerun of long-course recovery when the operator has verified sufficient free allowance.

## Additional screen-recorded long comparison — 25 October

The owner’s supplied recording shows a fresh comparison titled “Core React Concepts vs Ultimate React Course (First Hour)”. Its result retains roughly 80 minutes, with zero omissions. The edited demo includes the input, wait (shortened), result, and evidence review. This is separate from the five configurations above and is not a deliberately triggered malformed-part recovery test. The movie then switches to the labelled saved React useState comparison. The raw recording was not committed or published.
