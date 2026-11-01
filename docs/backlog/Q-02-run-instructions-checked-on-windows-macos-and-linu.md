---
id: Q-02
title: "[Q-02] Run instructions checked on Windows, macOS and Linux"
labels: qa, must
---

**Priority:** Must  
**Depends on:** none  
**Requirements:** NFR-09

## Why

The demo must run on whichever laptop is available.

## What to do

- Follow the README from a fresh clone on each operating system the team has.
- Fix anything unclear in the README.

## Done when

- [ ] Each OS ticked in the PR with the person who tested it
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `README.md`
