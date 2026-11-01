---
id: Q-01
title: "[Q-01] Peer pilot (one-to-one and small group)"
labels: qa, must
---

**Priority:** Must  
**Depends on:** most Must tickets  
**Requirements:** ID section 13, SE section 11.3

## Why

The evaluation plan in the ID document depends on it, and it is the only evidence that the design works.

## What to do

- Run two one-to-one think-aloud sessions, then a small group of 3 to 5.
- Use the instruments in ID appendix D (pre/post test, SUS, open questions, observation checklist).
- Record findings in `docs/pilot-findings.md`; open bug issues for anything to fix.

## Done when

- [ ] Findings written up
- [ ] Fix-only issues created
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `docs/pilot-findings.md`
