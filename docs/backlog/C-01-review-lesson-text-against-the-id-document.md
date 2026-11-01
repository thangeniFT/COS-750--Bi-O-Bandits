---
id: C-01
title: "[C-01] Review lesson text against the ID document"
labels: content, must, good first issue
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** ID appendix A, ID section 7.2

## Why

lesson.json was seeded from the ID document. It needs a human pass for tone, accuracy and length on screen.

## What to do

- Read every screen in the running app.
- Check each against the writing rules (about 60 words, one idea, second person).
- Fix in `data/lesson.json` only; run `npm test` (content checks) before the PR.

## Done when

- [ ] Every screen reviewed and signed off in the PR description
- [ ] `npm test` passes
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/data/lesson.json`
