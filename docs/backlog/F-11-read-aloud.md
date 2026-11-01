---
id: F-11
title: "[F-11] Read aloud"
labels: frontend, could
---

**Priority:** Could  
**Depends on:** F-02  
**Requirements:** FR-17, ID VARK table (aural)

## Why

Optional audio for students who prefer listening.

## What to do

- Add a "Read aloud" toggle using the browser's `speechSynthesis` to read each step explanation.
- Off by default; never plays at the same time as the student is reading unless switched on.

## Done when

- [ ] Works in Chrome and Edge; hidden where speechSynthesis is unavailable
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/components/step-player.js`
