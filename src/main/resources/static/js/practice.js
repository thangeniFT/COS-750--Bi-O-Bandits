/* ---------- Data ---------- */
const TARGET = 55;
const ROOT = 45;

// Tree: value -> {left, right, x, y}
const TREE = {
  45: { left: 25,   right: 65,   x: 260, y: 40 },
  25: { left: 15,   right: 35,   x: 130, y: 120 },
  65: { left: 55,   right: null, x: 390, y: 120 },
  15: { left: null, right: null, x: 70,  y: 200 },
  35: { left: 30,   right: null, x: 190, y: 200 },
  55: { left: null, right: null, x: 330, y: 200 },
  30: { left: null, right: null, x: 150, y: 280 }
};

// Distractors for each step (the correct answer is added automatically)
const DISTRACTORS = {
  45: [65, 15],
  25: [35, 65],
  15: [65, 55],
  35: [65, 55],
  30: [55, 25],
  65: [35, 25]
};

/* ---------- Build the DFS (preorder, left first) with an explicit stack ---------- */
const steps = []; // each: { visited, next, stackAfter }
(function buildSteps() {
  const stack = [ROOT];
  const order = [];
  while (stack.length) {
    const n = stack.pop();
    order.push(n);
    if (n === TARGET) { steps.push({ visited: n, next: null, stackAfter: [...stack] }); break; }
    const { left, right } = TREE[n];
    if (right !== null) stack.push(right);
    if (left !== null) stack.push(left);
    steps.push({ visited: n, next: stack[stack.length - 1] ?? null, stackAfter: [...stack] });
  }
})();

/* ---------- State ---------- */
let stepIndex = 0;
let hintLevel = 0;   // 0 none, 1 nudge, 2 rule, 3 worked answer
let solved = false;
const visited = new Set();

/* ---------- Elements ---------- */
const svg = document.getElementById("tree");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const hintBtn = document.getElementById("hintBtn");
const titleEl = document.getElementById("question-title");
const ladderSpans = document.querySelectorAll("#ladder span");

/* ---------- Tree drawing ---------- */
function drawTree() {
  const NS = "http://www.w3.org/2000/svg";
  svg.innerHTML = "";
  // edges first so nodes sit on top
  for (const [val, n] of Object.entries(TREE)) {
    [n.left, n.right].forEach(child => {
      if (child === null) return;
      const c = TREE[child];
      const line = document.createElementNS(NS, "line");
      line.setAttribute("class", "edge");
      line.setAttribute("x1", n.x); line.setAttribute("y1", n.y);
      line.setAttribute("x2", c.x); line.setAttribute("y2", c.y);
      svg.appendChild(line);
    });
  }
  const current = steps[stepIndex].visited;
  for (const [val, n] of Object.entries(TREE)) {
    const v = Number(val);
    const g = document.createElementNS(NS, "g");
    let cls = "node";
    if (v === current) cls += " current";
    else if (visited.has(v)) cls += " visited";
    if (v === TARGET) cls += " target";
    g.setAttribute("class", cls);
    g.innerHTML = `<circle cx="${n.x}" cy="${n.y}" r="17"></circle><text x="${n.x}" y="${n.y}">${v}</text>`;
    svg.appendChild(g);
  }
}

/* ---------- Question rendering ---------- */
function shuffle(arr) {
  return arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(p => p[1]);
}

function renderStep() {
  const step = steps[stepIndex];
  solved = false;
  hintLevel = 0;
  feedbackEl.innerHTML = "";
  hintBtn.disabled = false;
  updateLadder();
  titleEl.textContent = `DFS just visited ${step.visited}. Which node will it visit next?`;
  drawTree();

  const letters = ["A", "B", "C"];
  const choices = shuffle([step.next, ...DISTRACTORS[step.visited]]);
  optionsEl.innerHTML = "";
  choices.forEach((val, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.dataset.value = val;
    btn.innerHTML = `<b>${letters[i]}.</b> Node ${val}`;
    btn.addEventListener("click", () => choose(btn, val));
    optionsEl.appendChild(btn);
  });
}

function choose(btn, val) {
  if (solved) return;
  const step = steps[stepIndex];
  if (val === step.next) {
    solved = true;
    btn.classList.add("correct");
    optionsEl.querySelectorAll(".option").forEach(b => b.disabled = true);
    hintBtn.disabled = true;
    const isLast = steps[stepIndex + 1].next === null;
    feedbackEl.innerHTML = `<div class="box good"><strong>Correct.</strong> ${explain(step)}
      <br><button class="btn-next" id="nextBtn">${isLast ? "Continue" : "Next step"}</button></div>`;
    document.getElementById("nextBtn").addEventListener("click", advance);
  } else {
    btn.classList.add("wrong");
    btn.disabled = true;
    feedbackEl.innerHTML = `<div class="box bad"><strong>Not quite.</strong> Node ${val} is not next. Try again or ask for a hint.</div>`;
  }
}

function advance() {
  visited.add(steps[stepIndex].visited);
  stepIndex++;
  if (steps[stepIndex].next === null) return finish();
  renderStep();
}

function finish() {
  const found = steps[stepIndex].visited;
  titleEl.textContent = `DFS visited ${found}. Search complete!`;
  drawTree();
  optionsEl.innerHTML = "";
  hintBtn.style.display = "none";
  feedbackEl.innerHTML = `<div class="box good"><strong>You found ${TARGET}.</strong>
    Visit order: ${steps.map(s => s.visited).join(" → ")}. Ready to test yourself?</div>`;
}

/* ---------- Hints: nudge -> rule -> worked answer ---------- */
function stackHTML(stack) {
  if (!stack.length) return "<em>empty</em>";
  // top of stack shown on the left
  return `<span class="stack">${[...stack].reverse().map(n => `<span>${n}</span>`).join("")}</span>`;
}

function explain(step) {
  return `The stack was ${stackHTML(step.stackAfter)} (top on the left), so we pop <strong>${step.next}</strong>.`;
}

function giveHint() {
  if (solved || hintLevel >= 3) return;
  hintLevel++;
  const step = steps[stepIndex];
  const node = TREE[step.visited];
  let html = "";
  if (hintLevel === 1) {
    html = `<strong>Nudge:</strong> After visiting ${step.visited}, which of its children go onto the stack? Which one is popped first?`;
  } else if (hintLevel === 2) {
    html = node.left === null && node.right === null
      ? `<strong>Rule:</strong> ${step.visited} is a leaf, so backtrack: pop whatever is on top of the stack.`
      : `<strong>Rule:</strong> Push the right child first, then the left, so the left child is on top and is visited first.`;
    html += `<br>Current stack: ${stackHTML(step.stackAfter)}`;
  } else {
    html = `<strong>Worked answer:</strong> ${explain(step)}`;
    hintBtn.disabled = true;
  }
  feedbackEl.innerHTML = `<div class="box">${html}</div>`;
  updateLadder();
}

function updateLadder() {
  ladderSpans.forEach((s, i) => s.classList.toggle("on", i === hintLevel - 1));
}

hintBtn.addEventListener("click", giveHint);

/* ---------- Start ---------- */
renderStep();