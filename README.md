# COS212 DFS Tutor

A short, self-paced web app that teaches **depth-first search (DFS) on a binary search tree** to
COS212 students before the lecture. Students read a few short screens, watch DFS step through a
tree with the stack visible, predict the next step themselves, and take a readiness quiz with
feedback and a guided review.

COS750 Educational Software Development, University of Pretoria, 2026.
Design documents: [SE document](docs/COS212_DFS_SE_Document.pdf) ·
[ID document](docs/COS212_DFS_ID_Document.pdf) · [Backlog](docs/BACKLOG.md) ·
[How to contribute](CONTRIBUTING.md)

---

## Project status

This is a **walking skeleton**: it runs end to end, and the remaining work is split into tickets.

| Area | State |
|---|---|
| Spring Boot app, REST API, error handling, config | Done |
| `BinarySearchTree` (insert, duplicates rejected, reset to the example tree) | Done |
| DFS search and traversal (`DepthFirstSearch`) | Tickets **B-01**, **B-02**: tests written and disabled; the API answers 501 until done |
| Frontend shell, navigation, lesson content, tree drawing, sandbox insert/reset | Done |
| Step player, stack panel, predict mode | Tickets **F-02**, **F-03**, **F-05** |
| Quiz engine, quiz screen, guided review | Tickets **F-06**, **F-07**, **F-08** |
| Lesson text and quiz bank (from the ID document) | Seeded; review in **C-01**, **C-02** |

Every unfinished piece is marked in the code with `TODO(<ticket>)`, shows a dashed
"Not built yet (ticket)" box in the app, and has its expected behaviour already written as a
skipped test. See [docs/BACKLOG.md](docs/BACKLOG.md).

---

## Quick start

### You need

- **JDK 21** (for example [Eclipse Temurin 21](https://adoptium.net/temurin/releases/?version=21)).
  Check with `java -version`.
- **Git**.
- **Node.js 22 or newer**, only to run the frontend tests. The app itself does not need Node.

You do **not** need to install Maven: the project includes the Maven Wrapper (`mvnw`), which
downloads the right version the first time.

### Run the app

```bash
./mvnw spring-boot:run
```

On Windows (PowerShell or Command Prompt):

```bat
mvnw.cmd spring-boot:run
```

Then open <http://localhost:8080>. The first run downloads Maven and the dependencies, so it needs
internet access and takes a minute or two.

Jump straight to any screen with its id, for example
<http://localhost:8080/#/worked-example> or <http://localhost:8080/#/sandbox>.

### Run the tests

```bash
./mvnw verify   # Java: build plus all JUnit tests (this is what CI runs)
npm test        # Frontend and content tests (Node's built-in runner, no npm install needed)
```

Tests for unfinished tickets are **skipped**, not failing, so both commands are green on a fresh
clone. Picking up a ticket starts with enabling its tests.

### Build a runnable JAR (for the demo)

```bash
./mvnw package
java -jar target/dfs-tutor.jar
```

---

## How the code is organised

```
src/main/java/za/ac/up/dfstutor/
  DfsTutorApplication.java     starts the app
  config/                      TutorProperties (limits, example tree), TutorConfig (beans)
  controller/                  TreeController (REST API), ApiExceptionHandler (all error JSON)
  service/                     TreeService (sandbox tree, rules BR-1/4/5), TutorException
  model/                       BinarySearchTree, TreeNode, DepthFirstSearch, StepExplanations,
                               DfsResult, DfsStep, TraversalOrder   (plain Java, no Spring)
  dto/                         request/response records, ErrorCode

src/main/resources/
  application.properties       port, value range, node limit, example tree
  static/                      the frontend, served as-is (no build step)
    index.html                 page frame
    css/styles.css             design tokens and node-state styles
    data/                      lesson.json, quiz-bank.json, trees.json, glossary.json
    js/app.js                  loads content, URL-hash navigation between screens
    js/api.js                  the only code that calls the server
    js/util.js                 small helpers (safe text, input parsing, DOM helper)
    js/components/             tree-view, stack-panel, step-player, predict-mode
    js/screens/                one file per screen type (text, choice, explorer, warmup, ...)
    js/quiz/quiz-engine.js     rule-based quiz logic (no DOM)

src/test/java/...              JUnit 5 tests
src/test/js/                   Node tests for the pure frontend logic and the content files
docs/                          SE and ID documents, backlog tickets
scripts/                       create-github-issues.sh
```

---

## API

All endpoints are under `/api` and use JSON. Full contracts are in the Javadoc of
`TreeController`.

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/api/tree` | | the sandbox tree (`TreeView`) |
| POST | `/api/tree/insert` | `{"value": 65}` | the updated sandbox tree |
| POST | `/api/tree/reset` | | the example tree |
| POST | `/api/tree/preview` | `{"values": [45, 25, 65]}` | a tree built from the values, not stored |
| POST | `/api/dfs/search` | `{"target": 60}` or `{"target": 55, "values": [...]}` | `DfsResult` |
| POST | `/api/dfs/traverse` | `{"order": "IN_ORDER"}` (optionally `values`) | `DfsResult` |

Without `values`, search and traverse use the sandbox tree. With `values`, the server builds a
temporary tree, so lesson screens are never affected by what a student did in the sandbox.

Errors always look like `{"error": "DUPLICATE_VALUE", "message": "..."}`. The message is written
for students. Codes: `MISSING_VALUE`, `INVALID_NUMBER`, `INVALID_ORDER`, `DUPLICATE_VALUE`,
`TREE_FULL`, `INVALID_JSON` (all 400 or 415), `NOT_IMPLEMENTED` (501, skeleton only),
`INTERNAL_ERROR` (500).

Try it:

```bash
curl -s localhost:8080/api/tree
curl -s -X POST localhost:8080/api/tree/insert -H 'Content-Type: application/json' -d '{"value": 65}'
```

---

## Configuration

`src/main/resources/application.properties`:

| Key | Default | Meaning |
|---|---|---|
| `server.port` | 8080 | web server port |
| `tutor.min-value`, `tutor.max-value` | 0, 99 | allowed node values (BR-1) |
| `tutor.max-nodes` | 15 | largest tree (BR-5) |
| `tutor.example-tree` | 50,30,70,20,40,60,80 | insertion order of the example tree |

Any key can be overridden when starting, for example
`./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081`.

---

## Development tips

- **Frontend changes:** edit, save, refresh the browser.
- **Java changes:** Spring Boot DevTools restarts the app automatically when your IDE recompiles
  (or run `./mvnw compile` in a second terminal).
- **IDE:** open the folder in IntelliJ IDEA or VS Code (with the Java extension pack); it is a
  standard Maven project. Run `DfsTutorApplication` to start.
- **Find work for a ticket:** `grep -rn "TODO(F-02)" src` (or search in your IDE).

## Troubleshooting

| Problem | Fix |
|---|---|
| `This project needs JDK 21 or newer` | `JAVA_HOME` points at an older JDK. macOS: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`. Windows: set `JAVA_HOME` in System Properties > Environment Variables. |
| `./mvnw: Permission denied` | `chmod +x mvnw` (and commit it with `git update-index --chmod=+x mvnw`). |
| `Port 8080 was already in use` | Stop the other app, or use another port (see Configuration). |
| PowerShell says `mvnw.cmd` is not recognised | Use `.\mvnw.cmd spring-boot:run`. |
| A screen shows "still being built" | Expected: that ticket is not done yet. |
