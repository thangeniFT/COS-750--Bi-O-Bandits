---
id: B-03
title: "[B-03] Write the full step explanations"
labels: backend, should
---

**Priority:** Should  
**Depends on:** B-01, B-02 (for checking on screen)  
**Requirements:** FR-08, ID section 7.2, ID appendix A

## Why

The explanation under the tree is where the student learns *why* each step happens. The placeholders only say what happened.

## What to do

- Replace the three method bodies in `StepExplanations` with the wording given in its Javadoc (two children, one child, leaf, leaf with empty stack; three traversal orders).
- Pair with whoever owns the ID document so the wording matches the lesson script.
- Add a `StepExplanationsTest` covering each case.

## Done when

- [ ] Each case in the Javadoc produces the documented sentence
- [ ] Wording follows the ID writing rules (short, second person, says why)
- [ ] New tests pass
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/java/za/ac/up/dfstutor/model/StepExplanations.java`
