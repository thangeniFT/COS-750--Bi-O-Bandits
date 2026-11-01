---
id: Q-03
title: "[Q-03] Demo script and backup recording"
labels: qa, must
---

**Priority:** Must  
**Depends on:** Q-01  
**Requirements:** ID section 12.3, SE risks table

## Why

The 10-minute demo must show the instructional design working, and must survive a failure on the day.

## What to do

- Write the demo path (ID section 12.3) as a script with who says what.
- Record a backup screen capture.
- Keep a built `dfs-tutor.jar` on two laptops.

## Done when

- [ ] Two full rehearsals within 10 minutes
- [ ] Backup recording saved
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `docs/demo-script.md`
