---
id: F-04
title: "[F-04] Explorer controls and result summary"
labels: frontend, must
---

**Priority:** Must  
**Depends on:** F-02  
**Requirements:** FR-03, FR-09, NFR-04

## Why

The explorer works but its controls are basic. Students need a clear result and controls that fit each screen.

## What to do

- Hide the search box on the worked example (the target is fixed at 60).
- Show a result line after each run: found / not found and the number of nodes visited.
- Keyboard shortcuts for steps (left/right arrow) when focus is in the explorer.
- Disable Run buttons while a request is in flight.

## Done when

- [ ] Acceptance checks "Search for 60", "Search for a missing value", "Insert invalid input" (SE section 11.2) pass by hand
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/screens/explorer-screen.js`
