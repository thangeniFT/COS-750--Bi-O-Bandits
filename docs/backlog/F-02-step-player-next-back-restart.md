---
id: F-02
title: "[F-02] Step player: next, back, restart"
labels: frontend, must
---

**Priority:** Must  
**Depends on:** B-01 (to try it live; the tests use fixtures)  
**Requirements:** FR-06, FR-07, FR-08

## Why

This turns a DfsResult into the step-by-step walk students watch. It is the core of the worked example.

## What to do

- Implement `stateForStep` and remove the skip in `src/test/js/step-player.test.js`.
- Implement `load`, `next`, `back`, `restart`, `render` as described in the JSDoc.
- After the last step of a search, add the outcome sentence (found after N visits / not in the tree).

## Done when

- [ ] `npm test` passes with the step-player tests enabled
- [ ] Worked example plays all 6 steps forwards and backwards with correct highlights and stack
- [ ] Going back restores the previous display exactly
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/components/step-player.js`
- `src/test/js/step-player.test.js`
