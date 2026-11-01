# Backlog

Every task is a ticket in [`docs/backlog/`](backlog/). Each file becomes a GitHub issue when you run
`scripts/create-github-issues.sh` (see [CONTRIBUTING.md](../CONTRIBUTING.md#setting-up-github)).

Ticket ids (B = backend, F = frontend, C = content, Q = testing with people, D = documents) are
used in `TODO(...)` comments and in skipped tests, so `grep -rn "TODO(F-02)" src` finds
everything for a ticket. Tickets marked *good first issue* are small and self-contained.

Dates follow the plan in the SE document (section 12). Documents are due on ClickUP before 08:00
on 16 November 2026.

## Phase 1 (1-3 Nov): foundations, can start now in parallel

| Ticket | Title | Area | Priority | Depends on |
|---|---|---|---|---|
| [B-01](backlog/B-01-implement-dfs-search-iterative-pre-order.md) | Implement DFS search (iterative, pre-order) | backend | must | none |
| [B-02](backlog/B-02-implement-dfs-traversal-pre-in-post-order.md) | Implement DFS traversal (pre-, in-, post-order) | backend | must | none |
| [F-03](backlog/F-03-stack-panel.md) | Stack panel (good first issue) | frontend | must | none |
| [F-06](backlog/F-06-quiz-engine-rule-based-grading.md) | Quiz engine (rule-based grading) | frontend | must | none |
| [F-09](backlog/F-09-warm-up-check-and-refresher-cards.md) | Warm-up check and refresher cards (good first issue) | frontend | must | none |
| [C-01](backlog/C-01-review-lesson-text-against-the-id-document.md) | Review lesson text against the ID document (good first issue) | content | must | none |
| [D-01](backlog/D-01-update-the-se-document-to-match-the-skeleton.md) | Update the SE document to match the skeleton (good first issue) | docs | must | none |

## Phase 2 (4-7 Nov): needs phase 1 pieces

| Ticket | Title | Area | Priority | Depends on |
|---|---|---|---|---|
| [B-03](backlog/B-03-write-the-full-step-explanations.md) | Write the full step explanations | backend | should | B-01, B-02 (for checking on screen) |
| [F-01](backlog/F-01-tree-view-legend-scaling-and-screen-reader-descrip.md) | Tree view: legend, scaling and screen-reader descriptions | frontend | should | none |
| [F-02](backlog/F-02-step-player-next-back-restart.md) | Step player: next, back, restart | frontend | must | B-01 (to try it live; the tests use fixtures) |
| [F-04](backlog/F-04-explorer-controls-and-result-summary.md) | Explorer controls and result summary | frontend | must | F-02 |
| [F-05](backlog/F-05-predict-mode-and-practice-1.md) | Predict mode and practice 1 | frontend | must | F-02 |
| [F-07](backlog/F-07-quiz-screen-and-ordering-widget-also-practice-2.md) | Quiz screen and ordering widget (also practice 2) | frontend | must | F-06 |

## Phase 3 (6-9 Nov): complete the learning journey

| Ticket | Title | Area | Priority | Depends on |
|---|---|---|---|---|
| [F-08](backlog/F-08-guided-review-after-the-quiz.md) | Guided review after the quiz | frontend | must | F-06, F-07 |
| [F-10](backlog/F-10-java-code-view-synced-with-steps.md) | Java code view synced with steps | frontend | should | F-02 |
| [F-12](backlog/F-12-accessibility-pass.md) | Accessibility pass | frontend | must | F-02, F-05, F-07 |
| [C-02](backlog/C-02-verify-the-quiz-bank-against-the-java-output.md) | Verify the quiz bank against the Java output | content | must | B-01, B-02 |
| [C-03](backlog/C-03-glossary-tooltips.md) | Glossary tooltips | content | should | none |
| [C-04](backlog/C-04-balanced-versus-skewed-tree-example.md) | Balanced versus skewed tree example | content | should | B-02, F-02 |

## Phase 4 (8-9 Nov): test with real students

| Ticket | Title | Area | Priority | Depends on |
|---|---|---|---|---|
| [Q-01](backlog/Q-01-peer-pilot-one-to-one-and-small-group.md) | Peer pilot (one-to-one and small group) | qa | must | most Must tickets |
| [Q-02](backlog/Q-02-run-instructions-checked-on-windows-macos-and-linu.md) | Run instructions checked on Windows, macOS and Linux | qa | must | none |

## Phase 5 (10-11 Nov): submission and demo

| Ticket | Title | Area | Priority | Depends on |
|---|---|---|---|---|
| [Q-03](backlog/Q-03-demo-script-and-backup-recording.md) | Demo script and backup recording | qa | must | Q-01 |
| [D-02](backlog/D-02-update-the-genai-acknowledgement.md) | Update the GenAI acknowledgement | docs | must | none |

## Later (Could): only if time allows

| Ticket | Title | Area | Priority | Depends on |
|---|---|---|---|---|
| [B-04](backlog/B-04-give-each-browser-its-own-sandbox-tree.md) | Give each browser its own sandbox tree | backend | could | none |
| [B-05](backlog/B-05-generate-a-relabelled-quiz-variant-variant-c.md) | Generate a relabelled quiz variant (variant C) | backend | could | B-01, B-02, F-06 |
| [F-11](backlog/F-11-read-aloud.md) | Read aloud | frontend | could | F-02 |
