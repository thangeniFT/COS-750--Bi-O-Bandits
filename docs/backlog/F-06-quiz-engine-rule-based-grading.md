---
id: F-06
title: "[F-06] Quiz engine (rule-based grading)"
labels: frontend, must
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** FR-11, FR-12, FR-13, ID section 10

## Why

All quiz feedback is rule-based from quiz-bank.json. The engine is pure logic and can be built and tested before any UI exists.

## What to do

- Implement `selectItems`, `gradeAnswer`, `scoreQuiz`, `planReview` exactly as their JSDoc describes.
- Remove the skips in `src/test/js/quiz-engine.test.js`.

## Done when

- [ ] `npm test` passes with all quiz-engine tests enabled
- [ ] No DOM code in quiz-engine.js
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/quiz/quiz-engine.js`
- `src/test/js/quiz-engine.test.js`
