# Peer pilot kit (Q-01)

Everything needed to run the pilot in ID section 13 and write it up in
[`docs/pilot-findings.md`](../pilot-findings.md).

| File | What it is |
|---|---|
| `participant-pack-A.pdf` | Print one per participant with an **odd** id (P1, P3, …): pre-test Form 1, post-test Form 2, SUS, open questions |
| `participant-pack-B.pdf` | Print one per participant with an **even** id (P2, P4, …): pre-test Form 2, post-test Form 1 |
| `observer-sheet.pdf` | Observation checklist (ID appendix D), one per participant, for the group member watching |
| `participant-pack.html` | Source of the PDFs. Open in a browser and print, or regenerate the PDFs from it |
| `answer-key.md` | Marking key for both test forms |
| `results.csv` | One row per participant. Fill it in after marking |

Alternating Pack A and Pack B gives the counterbalancing that appendix D asks for.

## Before you book sessions

The app's welcome screen estimates **65–90 minutes**, but the ID document's success criterion is a
median session of **15–30 minutes** (ID 13.4). Book slots of about 90 minutes so nobody is cut off,
and record real start and end times. The pilot will show which figure is right. If the team changes
the criterion, update `CRITERIA.sessionMinutes` in `scripts/pilot/scoring.js` to match.

## Rounds

| Round | Who | How |
|---|---|---|
| One-to-one × 2 | Students who have not done COS212 (or have forgotten DFS) | Think aloud, one observer per student. Fix wording, layout and hints between the two sessions if something is clearly broken. |
| Small group × 3–5 | Same profile, not the one-to-one students | Work alone and silently; observers take notes only. Fixes only after this round, no new features (ID 13.2). |

## Before the session

- [ ] App runs from `main` (`./mvnw spring-boot:run`, open http://localhost:8080) and the full journey works: welcome → BST → DFS → explorer → practice → quiz → review/summary.
- [ ] Browser cache cleared or a private window open, so no earlier quiz attempts are stored.
- [ ] Packs printed (A/B alternating), observer sheet printed, pens, a clock.
- [ ] Participant id assigned (P1, P2, …). **No names on any sheet.** Keep a separate consent list if your lecturer requires one.

## Facilitator script

Read this aloud so every participant hears the same thing.

> Thanks for helping. We are testing an app that teaches depth-first search before a COS212
> lecture. We are testing the app, not you, so there are no wrong moves. It can take up to about an
> hour and a half, and you can stop whenever you like.
> Your answers are anonymous, and you can stop at any time.
>
> First, a five-question test. Don't worry if you don't know the answers; that is expected.

1. **Pre-test** (page 1 of the pack). Note the start time on the observer sheet when they
   finish it and open the app. Do not help with the questions.
2. **App session.**
   - *One-to-one only:* "Please say out loud what you are thinking as you go: what you're looking at,
     what you expect to happen, anything that surprises you." If they go quiet for ~15 s, prompt with
     "What are you thinking now?" Do **not** explain DFS or point at the screen.
   - *Small group:* "Work through the app on your own. Raise your hand if you get completely stuck."
   - If asked a question, reply "What would you try?" Only step in if they are stuck for over two
     minutes, and record that on the observer sheet.
   - Write down the **quiz score** (out of 8) shown on the quiz's *My Results* tab.
3. **End time** on the observer sheet when they reach the summary screen.
4. **Post-test, SUS and open questions** (pages 2 to 4 of the pack).
5. Thank them. If they ask, show them the answers now.

## After the session

1. Mark both tests with `answer-key.md` (1 or 0 per question).
2. Add one row to `results.csv`. Column notes:
   - `round`: `one-to-one` or `small-group`
   - `pre_form`: `1` for Pack A, `2` for Pack B
   - `pre1`…`post5`: 0 or 1
   - `sus1`…`sus10`: the circled number, 1–5
   - `start`, `end`: `HH:MM`
   - `confusing_screens`: screen ids separated by `;` from the open question "Was anything confusing?",
     using these ids: `welcome`, `bst`, `dfs`, `explorer`, `practice`, `quiz`, `review`, `summary`
3. Run `node scripts/pilot/summarise.js` and paste the output into `docs/pilot-findings.md`.
4. For every confusion or bug, open a **Bug** issue (fix-only) and link it in the findings table.
