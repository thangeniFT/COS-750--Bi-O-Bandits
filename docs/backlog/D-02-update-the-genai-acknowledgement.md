---
id: D-02
title: "[D-02] Update the GenAI acknowledgement"
labels: docs, must
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** Examination specification section 2.1, ID appendix E

## Why

The skeleton was generated with AI assistance; the specification requires the prompt and tool to be acknowledged.

## What to do

- Add the prompt used to generate this skeleton to ID appendix E, with the tool and date.
- Fill in the ChatGPT row for the v1.0 draft.

## Done when

- [ ] ID PDF rebuilt and committed in docs/
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `docs/COS212_DFS_ID_Document.tex`
