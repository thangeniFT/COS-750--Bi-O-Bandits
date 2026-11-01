---
id: F-07
title: "[F-07] Quiz screen and ordering widget (also practice 2)"
labels: frontend, must
---

**Priority:** Must  
**Depends on:** F-06  
**Requirements:** FR-11, FR-12, ID figure 6

## Why

Students need to answer one question at a time, rate their confidence, and see the feedback.

## What to do

- Build the quiz screen described in `quiz-screen.js` (choice, tree-click and order items; confidence rating; feedback panel).
- Build a reusable ordering widget: drag-and-drop plus a typed alternative using `parseNumberList`.
- Use the widget for Practice 2 (in-order of tree B), checked against `api.traverse` output.
- Block global Next until the quiz is finished (`ctx.setNextEnabled`).

## Done when

- [ ] All 6 slots work for variants A and B
- [ ] Quiz is fully usable by keyboard
- [ ] Matches the wireframe in ID figure 6
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/screens/quiz-screen.js`
- `src/main/resources/static/js/screens/practice-screen.js`
