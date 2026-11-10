/* ---------- State ---------- */
const DEFAULT_VALUES = [50, 30, 70, 20, 40, 60, 80]; // used only if the backend is unreachable
const MODES = [
  { key: "preorder",  label: "Pre-order" },
  { key: "inorder",   label: "In-order" },
  { key: "postorder", label: "Post-order" }
];
let values = [], target = null, mode = 0, tree = null, steps = [], idx = 0, runId = 0;
const $ = id => document.getElementById(id);
const svg = $("tree");
const esc = DFSApi.esc;

/* ---------- Built-in engine (fallback when the backend is down) ----------
   Produces exactly the same JSON shape the backend should return. */
function localRun(vals, traversal, tgt) {
  const insert = (n, v) => !n ? { value: v, left: null, right: null }
    : (v < n.value ? (n.left = insert(n.left, v)) : (n.right = insert(n.right, v)), n);
  let root = null;
  vals.forEach(v => root = insert(root, v));

  const out = [], visited = [];
  const stack = [{ n: root, a: "explore" }];
  const snap = (current, text, found = false) => out.push({
    current, text, found, visited: [...visited],
    stack: stack.map(f => ({ value: f.n.value, action: f.a })).reverse() // top first
  });
  const describe = n => {
    const l = n.left?.value, r = n.right?.value;
    if (traversal === "preorder") {
      if (l === undefined && r === undefined) return `Visit ${n.value}. It is a leaf, so backtrack and pop the next node.`;
      const parts = [];
      if (r !== undefined) parts.push(`right child ${r}`);
      if (l !== undefined) parts.push(`left child ${l}`);
      return `Visit ${n.value}. Push ${parts.join(", then ")}.`;
    }
    if (traversal === "inorder")
      return `Visit ${n.value} (its left subtree is finished). ` + (r !== undefined ? `Next, explore right child ${r}.` : "It has no right child, so backtrack.");
    return `Visit ${n.value} now that both of its subtrees are finished.`;
  };

  snap(null, `Start: push the root (${root.value}) onto the stack.`);
  while (stack.length) {
    const { n, a } = stack.pop();
    if (a === "explore") {
      const R = n.right && { n: n.right, a: "explore" };
      const L = n.left && { n: n.left, a: "explore" };
      const V = { n, a: "visit" };
      const order = traversal === "preorder" ? [R, L, V] : traversal === "inorder" ? [R, V, L] : [V, R, L];
      order.forEach(f => f && stack.push(f));
    } else {
      visited.push(n.value);
      if (n.value === tgt) { snap(n.value, `Found ${n.value}! The search stops here.`, true); return { tree: root, steps: out }; }
      snap(n.value, describe(n));
    }
  }
  snap(null, tgt !== null ? `Traversal finished: ${tgt} is not in the tree.` : "Traversal complete: the stack is empty.");
  return { tree: root, steps: out };
}

/* ---------- Talking to the backend ---------- */
async function loadDefaultValues() {
  try { return await DFSApi.getDefaultTree(); }
  catch (err) { console.warn(err); return [...DEFAULT_VALUES]; }
}

/* Ask the backend to run the DFS. 4xx errors are the user's input being rejected:
   roll back and show the message. Anything else (network, 5xx, bad JSON) falls back
   to the built-in engine so the page keeps working. */
async function run(message = "", rollback = null) {
  const id = ++runId;
  setBusy(true);
  let result, offlineReason = null;
  try {
    result = await DFSApi.runDfs({ values, traversal: MODES[mode].key, target });
  } catch (err) {
    if (id !== runId) return;
    if (err.status >= 400 && err.status < 500) {
      rollback?.();
      setBusy(false);
      return setStatus(err.message, true);
    }
    console.warn(err);
    offlineReason = err.message;
    result = localRun(values, MODES[mode].key, target);
  }
  if (id !== runId) return;
  tree = result.tree; steps = result.steps; idx = 0;
  setBusy(false);
  render();
  offlineReason
    ? setStatus(`${offlineReason}. Showing the built-in engine instead.`, true)
    : setStatus(message);
}

function setBusy(b) {
  document.querySelector("main").setAttribute("aria-busy", b);
  document.querySelectorAll(".toolbar button, .toolbar input").forEach(el => el.disabled = b);
  if (b) setStatus("Loading…");
}
function setStatus(msg = "", isErr = false) {
  const el = $("status");
  el.textContent = msg;
  el.className = isErr ? "err" : "";
}

/* ---------- Rendering ---------- */
function drawTree(step) {
  const GAP = 46, ROW = 70, PAD = 30;
  const pos = {}; let i = 0, maxD = 0;
  (function walk(n, d) {
    if (!n) return;
    walk(n.left, d + 1);
    pos[n.value] = { x: PAD + i++ * GAP, y: PAD + d * ROW, n };
    maxD = Math.max(maxD, d);
    walk(n.right, d + 1);
  })(tree, 0);
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
    if (step.current === v) cls += step.found ? " found" : " current";
    if (v === target) cls += " target";
    const tick = step.visited.includes(v) ? `<text class="tick" x="${x + 15}" y="${y - 14}">✓</text>` : "";
    add(`<g class="${cls}"><circle cx="${x}" cy="${y}" r="17"/><text class="val" x="${x}" y="${y}">${v}</text>${tick}</g>`);
  });
}

function render() {
  const s = steps[idx];
  drawTree(s);
  $("visited").textContent = s.visited.length ? "Visited: " + s.visited.join(" → ") : "Visited: none yet";
  $("explain").textContent = s.text;

  $("stack").innerHTML = s.stack.length ? s.stack.map((f, k) => {
    const note = f.action && mode !== 0 ? `<small>${esc(f.action)}</small>` : "";
    return `<li><span>${f.value}${note}</span><span class="tag">${k === 0 ? "NEXT" : "PENDING"}</span></li>`;
  }).join("") : `<li class="empty">Stack is empty</li>`;

  $("counter").textContent = `STEP ${idx + 1} OF ${steps.length}`;
  $("crumb").textContent = `Interactive explorer / Step ${idx + 1} of ${steps.length}`;
  $("prevBtn").disabled = idx === 0;
  $("nextBtn").disabled = idx === steps.length - 1;
  $("restartBtn").disabled = idx === 0;
}

/* ---------- Events ---------- */
const parse = id => {
  const raw = $(id).value.trim();
  return /^-?\d{1,3}$/.test(raw) ? Number(raw) : null;
};

$("insertBtn").onclick = () => {
  const v = parse("insertInput");
  if (v === null) return setStatus("Enter a whole number between -999 and 999.", true);
  if (values.includes(v)) return setStatus(`${v} is already in the tree.`, true);
  const before = [...values];
  values.push(v);
  $("insertInput").value = "";
  run(`Inserted ${v}. The traversal has restarted.`, () => { values = before; });
};

$("searchBtn").onclick = () => {
  const raw = $("targetInput").value.trim();
  const before = target;
  if (raw === "") { target = null; return run("Target cleared. Showing the full traversal.", () => { target = before; }); }
  const v = parse("targetInput");
  if (v === null) return setStatus("Enter a whole number to search for.", true);
  target = v;
  run(`Searching for ${v}. Step through to follow the DFS.`, () => { target = before; });
};

$("resetBtn").onclick = async () => {
  $("insertInput").value = ""; $("targetInput").value = "";
  target = null;
  values = await loadDefaultValues();
  run("Tree reset to the default values.");
};

$("modeBtn").onclick = e => {
  const before = mode;
  mode = (mode + 1) % MODES.length;
  e.target.textContent = `Traversal: ${MODES[mode].label}`;
  run(`Switched to ${MODES[mode].label.toLowerCase()} traversal.`, () => {
    mode = before; e.target.textContent = `Traversal: ${MODES[mode].label}`;
  });
};

$("nextBtn").onclick = () => { if (idx < steps.length - 1) { idx++; render(); } };
$("prevBtn").onclick = () => { if (idx > 0) { idx--; render(); } };
$("restartBtn").onclick = () => { idx = 0; render(); };

["insertInput", "targetInput"].forEach(id =>
  $(id).addEventListener("keydown", e => {
    if (e.key === "Enter") $(id === "insertInput" ? "insertBtn" : "searchBtn").click();
  }));
document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;
  if (e.key === "ArrowRight") $("nextBtn").click();
  if (e.key === "ArrowLeft") $("prevBtn").click();
});

/* ---------- Start ---------- */
(async function init() {
  values = await loadDefaultValues();
  run();
})();