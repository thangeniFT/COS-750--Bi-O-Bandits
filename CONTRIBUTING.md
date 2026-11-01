# Contributing

How the group works on this repository. Read this once before your first ticket.

## Working on a ticket

1. **Pick** an issue from *TODO*, assign yourself, and move it to *In progress*. Start with
   tickets whose dependencies are done (see [docs/BACKLOG.md](docs/BACKLOG.md)). *Good first issue*
   tickets are small and self-contained.
2. **Branch** from an up-to-date `main`. Name the branch after the ticket:
   ```bash
   git switch main && git pull
   git switch -c b-01-dfs-search
   ```
3. **Enable the ticket's tests.** Most tickets already have tests that describe the expected
   behaviour, skipped until someone starts:
   - Java: delete the `@Disabled(...)` line on the nested test class named in the ticket.
   - JavaScript: delete `{ skip: SKIP }` from the `describe(...)` calls in `src/test/js/`.

   Run them, watch them fail, then implement until they pass.
4. **Find everything for your ticket:** `grep -rn "TODO(B-01)" src`. Remove each `TODO(...)` as
   you complete it, and remove any `placeholder(...)` box your ticket replaces.
5. **Commit** in small steps, starting each message with the ticket id:
   `B-01: push right child before left`.
6. **Open a pull request** early (a draft is fine). Fill in the template and write
   `Closes #<issue number>` so the issue closes when it is merged.
7. **Review:** someone other than the author reviews within 24 hours. Check that it works, run it
   locally if it is visible, and look at the checklist. Approve, or request changes with a reason.
8. **Merge** with *Squash and merge* once CI is green and it is approved, then delete the branch.

If `main` has moved on while you worked, update your branch with `git pull origin main` and fix
any conflicts before asking for review.

## Definition of done

A ticket is done when:

- every item under *Done when* in the ticket is ticked;
- `./mvnw verify` and `npm test` pass locally and in CI;
- the ticket's tests are enabled and passing, and no `TODO(<ticket>)` remains;
- the change has been checked in the browser, including with the keyboard only;
- one other member has approved the pull request.

## Conventions

### Java

- Every public class and method has Javadoc that says **what it does, its inputs and outputs, and
  what it throws**. Explain *why* in comments where it is not obvious; do not restate the code.
- The `model` package must not import Spring. It is plain Java so it can be tested directly.
- Controllers stay thin: unpack the request, call the service, return the result. No try/catch.
- Report a broken rule by throwing `TutorException` with an `ErrorCode` and a message written for
  students. `ApiExceptionHandler` does the rest.
- Tests use JUnit 5 and AssertJ, with a `@DisplayName` that reads as a sentence.

### JavaScript

- Plain ES modules, no frameworks, no build step. Every exported function and class has JSDoc.
- Keep **logic** (pure functions, no DOM) separate from **drawing**, so the logic can be tested in
  Node. `quiz-engine.js`, `stateForStep` and `checkPrediction` are the models to follow.
- Only `js/api.js` calls `fetch` for the API.
- Never put text into `innerHTML` directly; use `formatText`, `paragraph` or `el` from `util.js`.
- One screen type per file in `js/screens/`, so two people rarely edit the same file.

### CSS

- Use the colour tokens at the top of `styles.css` (they match the diagrams in the documents).
- Show node states with `data-state` and CSS, and never with colour alone.

### Content (lesson text, quiz, glossary)

- Edit `static/data/*.json`, not JavaScript.
- Follow the ID writing rules: one idea per screen, about 60 words, second person, say *why*.
- Any number in a quiz answer must match what the Java DFS actually returns (ticket C-02).
- Run `npm test` after every content change; it checks the files for mistakes.

## Using AI tools

The examination specification allows generative AI for content and interface work, but every use
must be acknowledged with the **tool and the prompt** in the ID document (appendix E). If you use an
AI tool for your ticket, paste the prompt and tool name into your pull request description so it
can be added to the acknowledgement (ticket D-02). You are responsible for checking and
understanding anything you commit.
