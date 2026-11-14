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

Work is tracked as tickets on the GitHub issues board and in [docs/BACKLOG.md](docs/BACKLOG.md).
Anything still unfinished is marked in the code with `TODO(<ticket>)`, and its expected
behaviour is written as a skipped test.

---

## Quick start

Use **Terminal** on macOS and Linux, and **PowerShell** on Windows. Each step says what you should
see, so you know it worked before moving on. The operating systems this has been tested on are
listed under [Tested on](#tested-on).

### 1. Install the tools (once per laptop)

You need **Git**, **JDK 21** and **Node.js 22 or newer**. You do **not** need Maven: the project
includes the Maven Wrapper (`mvnw`), which downloads the right version the first time.
Node is only used for the frontend tests; the app itself runs without it.

| | Windows 10/11 | macOS | Linux (Ubuntu/Debian) |
|---|---|---|---|
| **Git** | [git-scm.com](https://git-scm.com/download/win), keep the defaults | Already there: run `git --version` and accept the prompt to install the command line tools if it appears | `sudo apt install git` |
| **JDK 21** | [Temurin 21 .msi](https://adoptium.net/temurin/releases/?version=21&os=windows). In the installer, turn on **Set JAVA_HOME** | [Temurin 21 .pkg](https://adoptium.net/temurin/releases/?version=21&os=mac) (pick *aarch64* on Apple silicon M1–M4, *x64* on Intel) | `sudo apt install openjdk-21-jdk` |
| **Node.js 22+** | [nodejs.org](https://nodejs.org), the LTS .msi | [nodejs.org](https://nodejs.org), the LTS .pkg | The `apt` version is usually too old. Use [nvm](https://github.com/nvm-sh/nvm): `nvm install 22` |
| Or with a package manager | `winget install Git.Git`, then `winget install EclipseAdoptium.Temurin.21.JDK`, then `winget install OpenJS.NodeJS.LTS` | `brew install --cask temurin@21`, then `brew install node` | |

**Close the terminal and open a new one** after installing, then check:

```bash
git --version     # any version
java -version     # must say 21 (or newer)
node --version    # must say v22 or newer
```

### 2. Get the code

```bash
git clone https://github.com/thangeniFT/COS-750--Bi-O-Bandits.git
cd COS-750--Bi-O-Bandits
```

Every command below is run from this folder.

### 3. Run the app

| macOS / Linux | Windows (PowerShell) |
|---|---|
| `./mvnw spring-boot:run` | `.\mvnw.cmd spring-boot:run` |

The first run downloads Maven and the dependencies, so it needs internet access and takes a minute
or two. It is ready when the last lines include **`Started DfsTutorApplication`**.

Open <http://localhost:8080>. You should see the welcome screen. Jump straight to a screen with its
id, for example <http://localhost:8080/#/worked-example>, `#/practice` or `#/quiz`.

Stop the app with **Ctrl+C** in the terminal.

### 4. Run the tests

| | macOS / Linux | Windows (PowerShell) |
|---|---|---|
| Java (build and JUnit, what CI runs) | `./mvnw verify` | `.\mvnw.cmd verify` |
| Frontend and content | `npm test` | `npm test` |

`./mvnw verify` should end with **`BUILD SUCCESS`**. `npm test` should end with **`# fail 0`**. It
needs no `npm install`, because the tests use Node's built-in runner. Tests for unfinished tickets
are skipped, not failing.

### 5. Build a runnable JAR (for the demo)

| macOS / Linux | Windows (PowerShell) |
|---|---|
| `./mvnw package` | `.\mvnw.cmd package` |
| `java -jar target/dfs-tutor.jar` | `java -jar target\dfs-tutor.jar` |

The JAR runs with only Java installed, with no internet and no Node, so it is the safest option on a
borrowed laptop. Build it in advance and copy `target/dfs-tutor.jar` across.

### Tested on

Following this README from a fresh clone (ticket Q-02). Add a row when you test a new laptop.

| OS and version | Java | Node | App runs | `mvnw verify` | `npm test` | JAR | Tested by | Date |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

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
    css/                       one stylesheet per screen (quiz.css, practice.css, ...)
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
| macOS: `Unable to locate a Java Runtime` | Java is not installed. Install JDK 21 (step 1), then open a new terminal. |
| `java` or `npm`: `command not found` / `is not recognized` | The tool is not installed, or the terminal was opened before installing. Install it (step 1) and open a **new** terminal. |
| `java -version` shows 17 or older | Another JDK comes first. macOS: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`. Windows: reinstall Temurin 21 with **Set JAVA_HOME** on, or set `JAVA_HOME` in System Properties > Environment Variables. Linux: `sudo update-alternatives --config java`. |
| `This project needs JDK 21 or newer` | Same cause and fix as the row above. |
| `npm test` fails with a message about the test pattern, or `node --version` is below 22 | Node is too old. Install Node 22 or newer (step 1). |
| PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled` | Run `npm.cmd test` instead, or use Command Prompt. |
| First `mvnw` run fails to download | It needs internet access (campus Wi-Fi can block it; try a hotspot), or build the JAR in advance (step 5). |
| `./mvnw: Permission denied` | `chmod +x mvnw` (and commit it with `git update-index --chmod=+x mvnw`). |
| `Port 8080 was already in use` | Stop the other app, or use another port (see Configuration). |
| PowerShell says `mvnw.cmd` is not recognised | Use `.\mvnw.cmd spring-boot:run`. |
| A screen shows "still being built" | Expected: that ticket is not done yet. |
| `git push` asks for a password and rejects it | GitHub needs a personal access token instead of your password (GitHub > Settings > Developer settings > Personal access tokens). Never share the token. |
