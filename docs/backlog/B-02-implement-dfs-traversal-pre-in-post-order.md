---
id: B-02
title: "[B-02] Implement DFS traversal (pre-, in-, post-order)"
labels: backend, must
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** FR-04, SE section 2.4

## Why

The "three orders, one walk" screen and the in-order practice task need traversal results from the server.

## What to do

- Implement `DepthFirstSearch.traverse` recursively with a private `walk(...)` helper (SE document, listing 2).
- Each step's `stackAfter` is the path from the root to the recorded node, top first (see the Javadoc example).
- Use `StepExplanations.traversalVisit` for the wording.
- Remove `@Disabled` from `DepthFirstSearchTest.Traversal` and `TreeControllerTest.Traverse`.

## Done when

- [ ] All tests in `DepthFirstSearchTest.Traversal` (including the 200 random trees) and `TreeControllerTest.Traverse` pass
- [ ] `./mvnw verify` is green
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/java/za/ac/up/dfstutor/model/DepthFirstSearch.java`
