---
id: C-02
title: "[C-02] Verify the quiz bank against the Java output"
labels: content, must
---

**Priority:** Must  
**Depends on:** B-01, B-02  
**Requirements:** ID section 11.1

## Why

Every number in a quiz answer must match what the real algorithm does. The ID document promises this check.

## What to do

- For every item, compute the answer with the running app (or a small JUnit test) and compare with quiz-bank.json.
- Fix any mismatch and note it in the PR.

## Done when

- [ ] A checklist of all 12 items, each ticked by two members
- [ ] Optionally: a JUnit test that reads quiz-bank.json and checks order items automatically
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/data/quiz-bank.json`
