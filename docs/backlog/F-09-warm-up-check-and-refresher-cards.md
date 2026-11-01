---
id: F-09
title: "[F-09] Warm-up check and refresher cards"
labels: frontend, must, good first issue
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** ID Gagné event 3, ID section 8.3

## Why

The app cannot assume prior knowledge. The warm-up catches students who need the tree or stack refresher.

## What to do

- Build the warm-up screen as described in `warmup-screen.js` (content is in lesson.json).
- Draw the three small diagrams for question w1 as inline SVG (tree, cycle, two pieces).

## Done when

- [ ] Wrong answers open the right refresher card
- [ ] Next is never blocked
- [ ] Keyboard accessible
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/screens/warmup-screen.js`
