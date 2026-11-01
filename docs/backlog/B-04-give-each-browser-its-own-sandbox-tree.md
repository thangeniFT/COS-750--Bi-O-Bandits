---
id: B-04
title: "[B-04] Give each browser its own sandbox tree"
labels: backend, could
---

**Priority:** Could  
**Depends on:** none  
**Requirements:** TreeService Javadoc (note on sharing)

## Why

With no accounts there is one sandbox tree per server. That is fine for local use, but if the app is ever hosted for a class, students would see each other's inserts.

## What to do

- Store the sandbox `BinarySearchTree` per HTTP session (for example a `@SessionScope` bean or a map keyed by session id with a size limit).
- Keep the lesson trees stateless (they already are, through `values`).

## Done when

- [ ] Two browsers inserting different values see only their own changes
- [ ] A test proves isolation
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/java/za/ac/up/dfstutor/service/TreeService.java`
