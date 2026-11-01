---
id: B-01
title: "[B-01] Implement DFS search (iterative, pre-order)"
labels: backend, must
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** FR-05, FR-09, BR-6 to BR-11

## Why

This is the algorithm the whole app teaches. Until it exists, `/api/dfs/search` answers 501 and the worked example cannot play.

## What to do

- Implement `DepthFirstSearch.search` with an explicit `ArrayDeque` stack, following the Javadoc and SE document section 9, listing 1.
- Record every visit with `DfsResult.Builder.visit(...)` *after* pushing the children, so `stackAfter` is the stack at the end of the step.
- Use `StepExplanations.searchVisit` / `searchFound` for the wording (placeholders are fine; B-03 improves them).
- Remove `@Disabled` from `DepthFirstSearchTest.Search` and `TreeControllerTest.Search`.

## Done when

- [ ] All tests in `DepthFirstSearchTest.Search` and `TreeControllerTest.Search` pass
- [ ] `./mvnw verify` is green
- [ ] The worked example screen no longer shows "still being built"
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/java/za/ac/up/dfstutor/model/DepthFirstSearch.java`
- `src/test/java/za/ac/up/dfstutor/model/DepthFirstSearchTest.java`
