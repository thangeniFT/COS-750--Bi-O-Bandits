## What this changes

<!-- One or two sentences. Link the ticket so GitHub closes it on merge: -->
Closes #

## How to check it

<!-- Steps a reviewer can follow, for example: "Open #/worked-example, press Next step 6 times." -->

## Checklist

- [ ] `./mvnw verify` passes locally
- [ ] `npm test` passes locally
- [ ] If I enabled skipped/disabled tests for my ticket, they now pass
- [ ] Public Java methods have Javadoc; exported JS functions have JSDoc
- [ ] No `TODO(...)` left for this ticket (`grep -rn "TODO(<ticket>)" src`)
- [ ] Learner-facing text follows the ID writing rules (short, second person, says why)
- [ ] Checked in the browser, including with the keyboard only
- [ ] Screenshot attached if the change is visible
