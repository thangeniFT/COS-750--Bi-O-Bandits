---
id: D-01
title: "[D-01] Update the SE document to match the skeleton"
labels: docs, must, good first issue
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** SE sections 6, 7, 8, 10

## Why

Building the skeleton changed a few details. The submitted document must match the code.

## What to do

- API (section 8): add `POST /api/tree/preview`, the optional `values` field on search/traverse, and the `INVALID_JSON` and `NOT_IMPLEMENTED` error codes.
- Technology (section 4): Spring Boot 3.5.16; Node 22 only for running frontend tests.
- Project structure (section 10): the `js/components`, `js/screens`, `js/quiz` and `static/data` folders.
- Class diagram: add `StepExplanations` and `TutorProperties`.

## Done when

- [ ] SE PDF rebuilt and committed in docs/
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `docs/COS212_DFS_SE_Document.tex`
