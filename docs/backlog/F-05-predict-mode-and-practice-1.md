---
id: F-05
title: "[F-05] Predict mode and practice 1"
labels: frontend, must
---

**Priority:** Must  
**Depends on:** F-02  
**Requirements:** FR-10, ID sections 10.4 and 11.3

## Why

Predicting before seeing is where learning happens (engagement taxonomy: responding).

## What to do

- Implement `checkPrediction` and remove the skip in `src/test/js/predict-mode.test.js`.
- Implement `PredictMode` (clickable, keyboard-focusable nodes; hint ladder; reveal).
- Build Practice 1 on the practice screen: tree B, search for 55.

## Done when

- [ ] `npm test` passes with predict-mode tests enabled
- [ ] Practice 1 can be completed with mouse only and keyboard only
- [ ] After two level-3 hints the app suggests replaying the worked example
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/components/predict-mode.js`
- `src/main/resources/static/js/screens/practice-screen.js`
