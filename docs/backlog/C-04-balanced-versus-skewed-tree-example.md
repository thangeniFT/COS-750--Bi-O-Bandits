---
id: C-04
title: "[C-04] Balanced versus skewed tree example"
labels: content, should
---

**Priority:** Should  
**Depends on:** B-02, F-02  
**Requirements:** FR-15

## Why

Shows that DFS stack depth depends on tree height, and prepares the lecture on balancing.

## What to do

- Add tree C (values inserted in sorted order) to `data/trees.json`.
- Add an explorer screen comparing tree A and tree C, with a short explanation (ID writing rules).

## Done when

- [ ] Screen in the lesson; content tests pass
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/data/trees.json`
- `src/main/resources/static/data/lesson.json`
