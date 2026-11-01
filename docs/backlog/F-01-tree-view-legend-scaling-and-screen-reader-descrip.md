---
id: F-01
title: "[F-01] Tree view: legend, scaling and screen-reader descriptions"
labels: frontend, should
---

**Priority:** Should  
**Depends on:** none  
**Requirements:** FR-02, NFR-06, ID figure 4

## Why

The basic renderer works. Students also need a legend for the node states, and a 15-node skewed tree must still be readable.

## What to do

- Add a legend under the tree showing the five states (copy the look of ID figure 4).
- Check a skewed 15-node tree (insert 1, 2, 3, ... 15) fits and is readable; adjust spacing or allow vertical scroll.
- Announce state changes for screen readers (for example "30 is the current node").

## Done when

- [ ] Legend visible on explorer screens
- [ ] Skewed 15-node tree is readable on a 1366x768 laptop
- [ ] Screen reader announces the current node
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/components/tree-view.js`
- `src/main/resources/static/css/styles.css`
