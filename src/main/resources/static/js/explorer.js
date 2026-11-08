/* ---------- State ---------- */
const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80];
const MODES = ["Pre-order", "In-order", "Post-order"];
let root = null, target = null, mode = 0, steps = [], idx = 0;

/* ---------- BST helpers ---------- */
const insertNode = (n, v) => !n ? { v, l: null, r: null }
  : (v < n.v ? (n.l = insertNode(n.l, v)) : (n.r = insertNode(n.r, v)), n);
const contains = (n, v) => !n ? false : v === n.v || contains(v < n.v ? n.l : n.r, v);

function resetTree() {
  root = null;
  DEFAULT_VALUES.forEach(v => root = insertNode(root, v));
  target = null;
}

/* ---------- Build DFS steps (iterative, explicit stack) ----------
   Stack frames are {n, a}: a = "explore" (expand node) or "visit" (record node).
   Expanding pushes frames so the traversal order falls out of the stack order. */
function stepText(n) {
  const l = n.l?.v, r = n.r?.v;
  if (mode === 0) {
    if (l === undefined && r === undefined) return `Visit ${n.v}. It is a leaf, so backtrack and pop the next node.`;
    const parts = [];
    if (r !== undefined) parts.push(`right child ${r}`);
    if (l !== undefined) parts.push(`left child ${l}`);
    return `Visit ${n.v}. Push ${parts.join(", then ")}.`;
  }
  if (mode === 1) return `Visit ${n.v} (its left subtree is finished). ${r !== undefined ? `Next, explore right child ${r}.` : "It has no right child, so backtrack."}`;
  return `Visit ${n.v} now that both of its subtrees are finished.`;
}

function buildSteps() {
  steps = [];
  if (!root) return;
  const visited = [];
  const stack = [{ n: root, a: "explore" }];
  const snap = (cur, text, extra = {}) => steps.push({
    cur, text, visited: [...visited],
    stack: stack.map(f => ({ v: f.n.v, a: f.a })).reverse(), // top first
    ...extra
  });
  snap(null, `Start: push the root (${root.v}) onto the stack.`);

  while (stack.length) {
    const { n, a } = stack.pop();
    if (a === "explore") {
      const R = n.r && { n: n.r, a: "explore" };
      const L = n.l && { n: n.l, a: "explore" };
      const V = { n, a: "visit" };
      const order = mode === 0 ? [R, L, V] : mode === 1 ? [R, V, L] : [V, R, L]; // last = top of stack
      order.forEach(f => f && stack.push(f));
    } else {
      visited.push(n.v);
      if (n.v === target) { snap(n.v, `Found ${n.v}! The search stops here.`, { found: true }); return; }
      snap(n.v, stepText(n));
    }
  }
  snap(null, target !== null ? `Traversal finished: ${target} is not in the tree.` : "Traversal complete: the stack is empty.");
}

/* ---------- Rendering ---------- */
function drawTree(step) {
  const NS = "http://www.w3.org/2000/svg", GAP = 46, ROW = 70, PAD = 30;
  const pos = {}; let i = 0, maxD = 0;
  (function walk(n, d) {
    if (!n) return;
    walk(n.l, d + 1);
    pos[n.v] = { x: PAD + i++ * GAP, y: PAD + d * ROW, n };
    maxD = Math.max(maxD, d);
    walk(n.r, d + 1);
  })(root, 0);
  const W = Math.max(300, PAD * 2 + (i - 1) * GAP), H = PAD * 2 + maxD * ROW;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = "";
  const add = (html) => svg.insertAdjacentHTML("beforeend", html);

  Object.values(pos).forEach(({ x, y, n }) => [n.l, n.r].forEach(c => {
    if (c) add(`<line class="edge" x1="${x}" y1="${y}" x2="${pos[c.v].x}" y2="${pos[c.v].y}"/>`);
  }));
  Object.entries(pos).forEach(([val, { x, y }]) => {
    const v = Number(val);
    let cls = "node";
    if (step.cur === v) cls += step.found ? " found" : " current";
    if (v === target) cls += " target";
    const tick = step.visited.includes(v) ? `<text class="tick" x="${x + 15}" y="${y - 14}">✓</text>` : "";
    add(`<g class="${cls}"><circle cx="${x}" cy="${y}" r="17"/><text class="val" x="${x}" y="${y}">${v}</text>${tick}</g>`);
  });
}

function render() {
  const s = steps[idx];
  drawTree(s);
  document.getElementById("visited").textContent = s.visited.length ? "Visited: " + s.visited.join(" → ") : "Visited: none yet";
  document.getElementById("explain").textContent = s.text;

  const ul = document.getElementById("stack");
  ul.innerHTML = s.stack.length ? s.stack.map((f, k) => {
    const note = mode === 0 ? "" : `<small>${f.a}</small>`;
    return `<li><span>${f.v}${note}</span><span class="tag">${k === 0 ? "NEXT" : "PENDING"}</span></li>`;
  }).join("") : `<li class="empty">Stack is empty</li>`;

  document.getElementById("counter").textContent = `STEP ${idx + 1} OF ${steps.length}`;
  document.getElementById("crumb").textContent = `Interactive explorer / Step ${idx + 1} of ${steps.length}`;
  document.getElementById("prevBtn").disabled = idx === 0;
  document.getElementById("nextBtn").disabled = idx === steps.length - 1;
  document.getElementById("restartBtn").disabled = idx === 0;
}

function rebuild(msg, isErr = false) {
  buildSteps(); idx = 0; render();
  setStatus(msg, isErr);
}
function setStatus(msg = "", isErr = false) {
  const el = document.getElementById("status");
  el.textContent = msg; el.className = isErr ? "err" : "";
}

/* ---------- Events ---------- */
const svg = document.getElementById("tree");
const parse = (id) => {
  const raw = document.getElementById(id).value.trim();
  return /^-?\d{1,3}$/.test(raw) ? Number(raw) : null;
};

document.getElementById("insertBtn").onclick = () => {
  const v = parse("insertInput");
  if (v === null) return setStatus("Enter a whole number between -999 and 999.", true);
  if (contains(root, v)) return setStatus(`${v} is already in the tree.`, true);
  root = insertNode(root, v);
  document.getElementById("insertInput").value = "";
  rebuild(`Inserted ${v}. The traversal has restarted.`);
};

document.getElementById("searchBtn").onclick = () => {
  const raw = document.getElementById("targetInput").value.trim();
  if (raw === "") { target = null; return rebuild("Target cleared. Showing the full traversal."); }
  const v = parse("targetInput");
  if (v === null) return setStatus("Enter a whole number to search for.", true);
  target = v;
  rebuild(`Searching for ${v}. Step through to follow the DFS.`);
};

document.getElementById("resetBtn").onclick = () => {
  resetTree();
  document.getElementById("insertInput").value = "";
  document.getElementById("targetInput").value = "";
  rebuild("Tree reset to the default values.");
};

document.getElementById("modeBtn").onclick = (e) => {
  mode = (mode + 1) % MODES.length;
  e.target.textContent = `Traversal: ${MODES[mode]}`;
  rebuild(`Switched to ${MODES[mode].toLowerCase()} traversal.`);
};

document.getElementById("nextBtn").onclick = () => { if (idx < steps.length - 1) { idx++; render(); } };
document.getElementById("prevBtn").onclick = () => { if (idx > 0) { idx--; render(); } };
document.getElementById("restartBtn").onclick = () => { idx = 0; render(); };

["insertInput", "targetInput"].forEach(id =>
  document.getElementById(id).addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById(id === "insertInput" ? "insertBtn" : "searchBtn").click();
  }));
document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  if (e.key === "ArrowRight") document.getElementById("nextBtn").click();
  if (e.key === "ArrowLeft") document.getElementById("prevBtn").click();
});

/* ---------- Start ---------- */
resetTree();
rebuild();