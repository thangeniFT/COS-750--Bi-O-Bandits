---
id: F-12
title: "[F-12] Accessibility pass"
labels: frontend, must
---

**Priority:** Must  
**Depends on:** F-02, F-05, F-07  
**Requirements:** NFR-06, ID section 7.1

## Why

Keyboard use and colour-blind safety are requirements, not extras.

## What to do

- Complete every screen with the keyboard only.
- Check contrast (WCAG AA) and that no state is shown by colour alone.
- Run Lighthouse accessibility audit and fix issues above minor.

## Done when

- [ ] Acceptance check "Keyboard only" passes
- [ ] Lighthouse accessibility score of 90 or more on each screen type
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/css/styles.css`
