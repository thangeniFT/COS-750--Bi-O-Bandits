---
id: F-08
title: "[F-08] Guided review after the quiz"
labels: frontend, must
---

**Priority:** Must  
**Depends on:** F-06, F-07  
**Requirements:** FR-13, ID section 10.5

## Why

The specification requires assessment that leads to extra scaffolding for students who are not ready.

## What to do

- Below the pass mark, offer a review built from `planReview` (confident mistakes first).
- For each missed outcome: replay the relevant worked-example step, ask an easier version with hint 1 shown, explain.
- Then offer a new attempt with unseen variants; keep seen ids in sessionStorage.
- Always offer "Continue to summary anyway". Show `worthALook` items on the summary.

## Done when

- [ ] Acceptance checks "Quiz score below 4/6" and "4/6 or higher" pass by hand
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/screens/quiz-screen.js`
