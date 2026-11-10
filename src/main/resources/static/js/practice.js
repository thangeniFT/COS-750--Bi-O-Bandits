const $ = id => document.getElementById(id);
const esc = DFSApi.esc;
const svg = $("tree"), optionsEl = $("options"), feedbackEl = $("feedback"),
      hintBtn = $("hintBtn"), titleEl = $("question-title"),
      ladderSpans = document.querySelectorAll("#ladder span");
let session = null, steps = [], stepIndex = 0, hintLevel = 0, solved = false;
const visited = new Set();

/* ---------- Built-in session (used only if the backend is unreachable) ---------- */
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

function localSession() {
  const N = (value, left = null, right = null) => ({ value, left, right });
  const tree = N(45, N(25, N(15), N(35, N(30))), N(65, N(55)));
  const TARGET = 55;
  const DISTRACTORS = { 45: [65, 15], 25: [35, 65], 15: [65, 55], 35: [65, 55], 30: [55, 25], 65: [35, 25] };
  const stack = [tree], out = [], order = [];
  while (stack.length) {
    const n = stack.pop();
    order.push(n.value);
    if (n.value === TARGET) break;
    if (n.right) stack.push(n.right);
    if (n.left) stack.push(n.left);
    const next = stack[stack.length - 1].value;
    out.push({
      visited: n.value, answer: next,
      stack: stack.map(x => x.value).reverse(),            // top first
      options: shuffle([next, ...DISTRACTORS[n.value]]),
      hints: {}
    });
  }
  return { target: TARGET, tree, steps: out, order };
}

/* ---------- Hints: use the backend's text, generate any that are missing ---------- */
function findNode(n, v) {
  if (!n) return null;
  return n.value === v ? n : findNode(n.left, v) || findNode(n.right, v);
}
function stackHTML(stack) {
  if (!stack.length) return "<em>empty</em>";
  return `<span class="stack">${stack.map(n => `<span>${Number(n)}</span>`).join("")}</span>`;
}
function fillHints(step) {
  const node = findNode(session.tree, step.visited);
  const leaf = node && !node.left && !node.right;
  const h = step.hints;
  const serverWorked = !!h.worked;
  h.nudge  ||= `After visiting ${step.visited}, which of its children go onto the stack? Which one is popped first?`;
  h.rule   ||= leaf
    ? `${step.visited} is a leaf, so backtrack: pop whatever is on top of the stack.`
    : "Push the right child first, then the left, so the left child is on top and is visited first.";
  h.worked ||= `The stack is now ${stackHTML(step.stack)} (top on the left), so we pop ${step.answer}.`;
  step._workedIsHtml = !serverWorked; // generated text carries our own safe markup
}

/* ---------- Loading the session ---------- */
async function init() {
  titleEl.textContent = "Loading your practice session…";
  optionsEl.innerHTML = "";
  hintBtn.disabled = true;
  try {
    session = await DFSApi.getPracticeSession();
    showNotice("");
  } catch (err) {
    console.warn(err);
    session = localSession();
    showNotice(`${err.message}. Showing the built-in example instead.`);
  }
  steps = session.steps;
  steps.forEach(fillHints);
  if (session.target !== null) {
    $("crumb").textContent = `Guided practice / Search for ${session.target}`;
  }
  stepIndex = 0;
  visited.clear();
  hintBtn.style.display = "";
  renderStep();
}

function showNotice(msg) {
  const el = $("notice");
  el.textContent = msg;
  el.hidden = !msg;
}

/* ---------- Tree drawing ---------- */
function drawTree(currentValue) {
  const GAP = 52, ROW = 80, PAD = 32;
  const pos = {}; let i = 0, maxD = 0;
  (function walk(n, d) {
    if (!n) return;
    walk(n.left, d + 1);
    pos[n.value] = { x: PAD + i++ * GAP, y: PAD + d * ROW, n };
    maxD = Math.max(maxD, d);
    walk(n.right, d + 1);
  })(session.tree, 0);
  const W = Math.max(300, PAD * 2 + (i - 1) * GAP), H = PAD * 2 + maxD * ROW;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = "";
  const add = html => svg.insertAdjacentHTML("beforeend", html);

  Object.values(pos).forEach(({ x, y, n }) => [n.left, n.right].forEach(c => {
    if (c) add(`<line class="edge" x1="${x}" y1="${y}" x2="${pos[c.value].x}" y2="${pos[c.value].y}"/>`);
  }));
  Object.entries(pos).forEach(([val, { x, y }]) => {
    const v = Number(val);
    let cls = "node";
    if (v === currentValue) cls += " current";
    else if (visited.has(v)) cls += " visited";
    if (v === session.target) cls += " target";
    add(`<g class="${cls}"><circle cx="${x}" cy="${y}" r="17"/><text x="${x}" y="${y}">${v}</text></g>`);
  });
}

/* ---------- Question flow ---------- */
function renderStep() {
  const step = steps[stepIndex];
  solved = false;
  hintLevel = 0;
  feedbackEl.innerHTML = "";
  hintBtn.disabled = false;
  updateLadder();
  titleEl.textContent = `DFS just visited ${step.visited}. Which node will it visit next?`;
  drawTree(step.visited);

  optionsEl.innerHTML = "";
  step.options.forEach((val, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerHTML = `<b>${String.fromCharCode(65 + i)}.</b> Node ${val}`;
    btn.addEventListener("click", () => choose(btn, val));
    optionsEl.appendChild(btn);
  });
}

function choose(btn, val) {
  if (solved) return;
  const step = steps[stepIndex];
  if (val === step.answer) {
    solved = true;
    btn.classList.add("correct");
    optionsEl.querySelectorAll(".option").forEach(b => b.disabled = true);
    hintBtn.disabled = true;
    const isLast = stepIndex === steps.length - 1;
    feedbackEl.innerHTML = `<div class="box good"><strong>Correct.</strong> ${workedHTML(step)}
      <br><button class="btn-next" id="nextBtn">${isLast ? "Continue" : "Next step"}</button></div>`;
    $("nextBtn").addEventListener("click", advance);
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    feedbackEl.innerHTML = `<div class="box bad"><strong>Not quite.</strong> Node ${val} is not next. Try again or ask for a hint.</div>`;
  }
}

/* Generated worked answers contain our own safe markup; backend text is always escaped. */
function workedHTML(step) { return step._workedIsHtml ? step.hints.worked : esc(step.hints.worked); }

function advance() {
  visited.add(steps[stepIndex].visited);
  stepIndex++;
  stepIndex >= steps.length ? finish() : renderStep();
}

function finish() {
  const last = steps[steps.length - 1].answer;
  const order = session.order || [...steps.map(s => s.visited), last];
  titleEl.textContent = `DFS visited ${last}. Search complete!`;
  visited.add(last);
  drawTree(last);
  optionsEl.innerHTML = "";
  hintBtn.style.display = "none";
  const goal = session.target !== null ? `You found ${session.target}. ` : "";
  feedbackEl.innerHTML = `<div class="box good"><strong>${esc(goal)}</strong>Visit order: ${order.map(Number).join(" → ")}. Ready to test yourself?</div>`;
}

/* ---------- Hint ladder ---------- */
function giveHint() {
  if (solved || hintLevel >= 3) return;
  hintLevel++;
  const step = steps[stepIndex];
  let html;
  if (hintLevel === 1) html = `<strong>Nudge:</strong> ${esc(step.hints.nudge)}`;
  else if (hintLevel === 2) html = `<strong>Rule:</strong> ${esc(step.hints.rule)}` +
    (step.stack.length ? `<br>Current stack: ${stackHTML(step.stack)}` : "");
  else { html = `<strong>Worked answer:</strong> ${workedHTML(step)}`; hintBtn.disabled = true; }
  feedbackEl.innerHTML = `<div class="box">${html}</div>`;
  updateLadder();
}
function updateLadder() { ladderSpans.forEach((s, i) => s.classList.toggle("on", i === hintLevel - 1)); }
hintBtn.addEventListener("click", giveHint);

init();