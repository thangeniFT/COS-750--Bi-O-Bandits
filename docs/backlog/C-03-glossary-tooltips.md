---
id: C-03
title: "[C-03] Glossary tooltips"
labels: content, should
---

**Priority:** Should  
**Depends on:** none  
**Requirements:** ID appendix C, ID section 7.2

## Why

Second-language readers benefit from instant definitions of bold terms.

## What to do

- Show a tooltip (and a keyboard-accessible popover) for bold terms that appear in `data/glossary.json`.
- Add a Glossary button to open the full list.

## Done when

- [ ] Every glossary term is defined where it first appears
- [ ] Works by keyboard
- [ ] Tests pass locally (`./mvnw verify` and `npm test`) and in CI
- [ ] Pull request reviewed and approved by one other member

## Where to start

- `src/main/resources/static/data/glossary.json`
- `src/main/resources/static/js/util.js`
