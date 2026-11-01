---
id: F-03
title: "[F-03] Stack panel"
labels: frontend, must, good first issue
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** FR-07, SE figure 2, misconception M2

## Why

Seeing the stack is what makes backtracking make sense. The placeholder shows it as text.

## What to do

- Draw the stack as boxes, top at the top, top box highlighted (CSS classes already exist).
- Add a visually hidden aria-live announcement ("30 is now on top of the stack").
- Handle the empty stack.

## Done when

- [ ] Matches SE figure 2
- [ ] Works with keyboard and screen reader
- [ ] Reviewed by one other member
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/js/components/stack-panel.js`
