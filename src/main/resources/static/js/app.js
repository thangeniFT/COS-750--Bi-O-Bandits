/* ==========================================================
   COS212 DFS Tutor — shared helpers
   ========================================================== */

const STORE_KEY = "cos212-dfs-quiz";

// ---------- Session storage (answers persist across the 3 pages) ----------
const Store = {
  load() {
    try {
      return JSON.parse(sessionStorage.getItem(STORE_KEY)) || { answers: {} };
    } catch (e) {
      return { answers: {} };
    }
  },
  save(state) {
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
  },
  setAnswer(index, choice, confidence) {
    const state = this.load();
    const prev = state.answers[index];
    // "first" keeps the first attempt so retries don't inflate the readiness score
    state.answers[index] = { choice, confidence, first: prev ? prev.first : choice };
    this.save(state);
  },
  getAnswer(index) {
    return this.load().answers[index] || null;
  },
  clear() {
    try { sessionStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
  }
};

// ---------- URL helper: ?q=2 -> index 1 (clamped) ----------
function questionIndexFromUrl() {
  const n = parseInt(new URLSearchParams(location.search).get("q"), 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(n, 1), QUESTIONS.length) - 1;
}

// ---------- Tree SVG renderer ----------
// opts: { visited: [values], current: value }
function renderTree(container, opts = {}) {
  const visited = new Set(opts.visited || []);
  const current = opts.current ?? null;
  const NS = "http://www.w3.org/2000/svg";

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 400 240");
  svg.setAttribute("class", "tree");
  svg.setAttribute("role", "img");
  const visitedText = visited.size ? ` Visited so far: ${[...visited].join(", ")}.` : "";
  svg.setAttribute("aria-label",
    `Binary search tree: root 50; 50 has children 30 and 70; 30 has children 20 and 40; 70 has children 60 and 80.${visitedText}`);

  EDGES.forEach(([a, b]) => {
    const [x1, y1] = NODE_POS[a];
    const [x2, y2] = NODE_POS[b];
    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("class", "edge" + (visited.has(a) && visited.has(b) ? " edge--visited" : ""));
    svg.appendChild(line);
  });

  Object.entries(NODE_POS).forEach(([value, [x, y]]) => {
    const v = Number(value);
    const g = document.createElementNS(NS, "g");
    let cls = "node";
    if (v === current) cls += " node--current";
    else if (visited.has(v)) cls += " node--visited";
    g.setAttribute("class", cls);

    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 22);
    const t = document.createElementNS(NS, "text");
    t.setAttribute("x", x); t.setAttribute("y", y);
    t.textContent = value;
    g.append(c, t);

    // check badge on visited nodes
    if (visited.has(v)) {
      const badge = document.createElementNS(NS, "g");
      badge.setAttribute("class", "badge");
      const bc = document.createElementNS(NS, "circle");
      bc.setAttribute("cx", x + 18); bc.setAttribute("cy", y - 18); bc.setAttribute("r", 9);
      const bp = document.createElementNS(NS, "path");
      bp.setAttribute("d", `M${x + 14} ${y - 18} l3 3 l5 -6`);
      badge.append(bc, bp);
      g.appendChild(badge);
    }
    svg.appendChild(g);
  });

  container.innerHTML = "";
  container.appendChild(svg);
}

// ---------- Small DOM helper ----------
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  });
  children.forEach(c => node.append(c));
  return node;
}
