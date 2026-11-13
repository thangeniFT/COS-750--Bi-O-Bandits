# Pilot findings (Q-01)

Formative evaluation of the COS212 DFS Tutor, following ID document section 13 and SE section 11.3.
How to run the sessions and the instruments: [`docs/pilot/README.md`](pilot/README.md).

> **Status:** template. Every `TBD` below must be replaced with what actually happened in the sessions.
> Do not estimate or fill in numbers that were not measured.

## 1. Sessions

| Round | Date | Participants | Facilitator | Observer(s) | App version (commit) |
|---|---|---|---|---|---|
| Expert review | TBD | COS212 tutor | TBD | – | TBD |
| One-to-one | TBD | P1, P2 | TBD | TBD | TBD |
| Small group | TBD | P3–P? | TBD | TBD | TBD |

Participant profile: TBD (for example "2nd-year BSc students who have not taken COS212").
Setting: TBD (venue or online, device and browser used).

Deviations from the plan in ID 13.2 (dates, numbers, anything skipped) and why: TBD

## 2. Results against the success criteria

Paste the output of `node scripts/pilot/summarise.js` here.

```
TBD: per-participant table
TBD: criteria table (mean gain, no one lower, SUS ≥ 68, median time 15–30 min, ≤ 1 confused per screen)
TBD: threshold table and reading
```

**Overall verdict:** TBD. With n = TBD these figures are indicators, not proof (ID 13.4).

## 3. Answers to the evaluation questions (ID 13.1)

1. **Do students learn DFS from the app?** TBD (pre/post gain, which questions improved most, using the per-question columns in `results.csv`)
2. **Do they find it usable and worth their time?** TBD (SUS, session time, quotes from "what helped most")
3. **Which screens or questions cause confusion?** TBD (see section 4)
4. **Is 6/8 a sensible pass mark for offering the guided review?** TBD (pass-mark table; say it can only point in a direction)

## 4. Observations by screen

From the observer sheets and the think-aloud notes. One row per distinct problem; merge duplicates
and count how many participants hit it.

| Screen | What happened (observed or said) | Participants | Severity | Issue |
|---|---|---|---|---|
| TBD | TBD | TBD | High / Medium / Low | #TBD |

Severity: **High** blocks progress or teaches something wrong · **Medium** causes hesitation over 10 s
or a hint · **Low** cosmetic or wording.

Representative quotes (anonymised, for example "P2, quiz screen: ..."):

- TBD

## 5. Open-question themes

| Question | Recurring themes (participants) |
|---|---|
| What helped most to understand DFS? | TBD |
| Was anything confusing? Where? | TBD |
| One thing to change | TBD |

## 6. Changes made

Only fixes that remove confusion, no new features (ID 13.2).

| Issue | Change | After round | PR |
|---|---|---|---|
| #TBD | TBD | One-to-one / small group | #TBD |

Found but not fixed (and why): TBD

## 7. Limitations

- Small, convenient sample (n = TBD), so results are indicative only.
- Participants may not match real COS212 students: TBD
- Pre/post Q4 has the same answer as Q2 on both forms (the right-most leaf is last in pre-order), so it adds little separate evidence for LO4 (see `pilot/answer-key.md`).
- Kirkpatrick levels 3 and 4 are not measured (ID 13.1).
- TBD: anything else, such as observer effect in think-aloud or time pressure

## 8. Summary for the ID document

A three to five sentence paragraph to copy into ID section 13, as SE 11.3 asks:

> TBD
