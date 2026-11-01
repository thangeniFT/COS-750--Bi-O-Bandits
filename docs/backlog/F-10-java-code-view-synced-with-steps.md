---
id: F-10
title: "[F-10] Java code view synced with steps"
labels: frontend, should
---

**Priority:** Should  
**Depends on:** F-02  
**Requirements:** FR-16

## Why

Some students understand better from code. Showing the matching line links the picture to the algorithm.

## What to do

- Add a "Show Java code" toggle on explorer screens with the search method from SE listing 1.
- Highlight the line that matches the current step (pop / compare / push right / push left).

## Done when

- [ ] Toggle works; highlighted line matches each step of the worked example
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/screens/explorer-screen.js`
