---
id: B-05
title: "[B-05] Generate a relabelled quiz variant (variant C)"
labels: backend, could
---

**Priority:** Could  
**Depends on:** B-01, B-02, F-06  
**Requirements:** ID section 10.2

## Why

The ID document promises a third quiz variant on a second retry, made by relabelling the values of a tree while keeping its shape, with answers computed by Java.

## What to do

- Add an endpoint that returns a relabelled copy of tree A or B and the DFS answers the quiz needs.
- Teach the quiz engine to build items from it.

## Done when

- [ ] A student on a third attempt sees new numbers on the same tree shapes, and grading is correct
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/java/za/ac/up/dfstutor/controller/TreeController.java`
