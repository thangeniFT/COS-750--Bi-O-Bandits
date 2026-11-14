
/**
 * COS212 DFS Tutor — BST Basics
 * Five-tab lesson, using only JavaScript.
 *
 * Tab 1: Warm-up
 * Tab 2: Vocabulary
 * Tab 3: BST definition and rules
 * Tab 4: Animated insertion
 * Tab 5: Knowledge check
 *
 * Warm-up questions are read from lesson.json.
 */

const NS = "http://www.w3.org/2000/svg";
const INITIAL = [50, 30, 70, 20, 40, 60, 80];
const MAX_NODES = 15;

function el(tag, cls = "", text = "") {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.textContent = text;
  return e;
}

function svgEl(tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    e.setAttribute(key, String(value));
  }
  return e;
}

function btn(text, cls = "") {
  const b = el("button", cls, text);
  b.type = "button";
  return b;
}

function node(value, parent = null) {
  return { value, parent, left: null, right: null };
}

function insert(root, value) {
  if (!root) return node(value);

  let current = root;
  while (current) {
    if (value === current.value) return root;

    const side = value < current.value ? "left" : "right";

    if (current[side]) current = current[side];
    else {
      current[side] = node(value, current);
      return root;
    }
  }
  return root;
}

function makeTree(values = INITIAL) {
  let root = null;
  for (const value of values) root = insert(root, value);
  return root;
}

function nodes(root) {
  if (!root) return [];
  return [...nodes(root.left), root, ...nodes(root.right)];
}

function find(root, value) {
  return nodes(root).find(n => n.value === value) || null;
}

function values(root) {
  return nodes(root).map(n => n.value);
}

function facts(n) {
  const p = n.parent;
  const side = p ? (p.left === n ? "left" : "right") : null;
  const sibling = p ? (side === "left" ? p.right : p.left) : null;
  const children = [n.left, n.right].filter(Boolean);

  return [
    ["Position", p ? `${side} child of ${p.value}` : "Root"],
    ["Parent", p ? String(p.value) : "None"],
    ["Sibling", sibling ? String(sibling.value) : "None"],
    ["Children", children.length
      ? children.map(c => c.value).join(", ")
      : "None — leaf"],
    ["Subtree", values(n).join(", ")]
  ];
}

function listTree(root, role = "root") {
  const ul = el("ul");
  if (!root) return ul;

  const li = el("li", "", `${root.value} (${role})`);
  if (root.left) {
    li.appendChild(listTree(root.left, `left child of ${root.value}`));
  }
  if (root.right) {
    li.appendChild(listTree(root.right, `right child of ${root.value}`));
  }
  ul.appendChild(li);
  return ul;
}

function makeCallout(label, initial = "") {
  const box = el("div", "bst-callout");
  const heading = el("strong", "bst-callout-label", label);
  const text = el("p", "bst-callout-text", initial);
  box.append(heading, text);
  return { box, text };
}

/**
 * Draw an interactive tree.
 *
 * marks: Map(node.value -> colour name)
 * comparisons: Map(node.value -> text)
 */
function createTree(root, opts = {}) {
  const {
    marks = new Map(),
    active = null,
    selected = null,
    added = null,
    comparisons = new Map(),
    invalid = null,
    path = [],
    onSelect = null
  } = opts;

  const entries = [];
  function collect(n, depth) {
    if (!n) return;
    collect(n.left, depth + 1);
    entries.push({ n, depth });
    collect(n.right, depth + 1);
  }
  collect(root, 0);

  const depth = Math.max(0, ...entries.map(e => e.depth));
  const width = Math.max(680, entries.length * 90);
  const height = Math.max(340, 135 + depth * 110);
  const positions = new Map();

  entries.forEach(({ n, depth }, i) => {
    const x = entries.length === 1
      ? width / 2
      : 65 + i * (width - 130) / (entries.length - 1);

    positions.set(n, { x, y: 65 + depth * 110 });
  });

  const svg = svgEl("svg", {
    class: "bst-svg",
    viewBox: `0 0 ${width} ${height}`,
    "aria-label": "Interactive binary search tree"
  });

  for (const { n } of entries) {
    if (!n.parent) continue;
    const a = positions.get(n.parent);
    const b = positions.get(n);

    const classes = ["bst-edge"];
    if (n.value === added) classes.push("is-new");
    if (path.includes(n.value) && path.includes(n.parent.value)) {
      classes.push("is-path");
    }

    const colour = marks.get(n.value);
    if (colour && colour === marks.get(n.parent.value)) {
      classes.push(`mk-${colour}`);
    }

    svg.appendChild(svgEl("line", {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      class: classes.join(" ")
    }));
  }

  for (const { n } of entries) {
    const { x, y } = positions.get(n);
    const classes = ["bst-node"];

    if (marks.has(n.value)) classes.push(`mk-${marks.get(n.value)}`);
    if (n.value === active) classes.push("is-active");
    if (n.value === selected) classes.push("is-selected");
    if (n.value === added) classes.push("is-new");
    if (n.value === invalid) classes.push("is-invalid");
    if (path.includes(n.value)) classes.push("is-path");

    const g = svgEl("g", {
      class: classes.join(" "),
      "data-value": n.value,
      role: "button",
      tabindex: "0",
      "aria-label": `Node ${n.value}. ` +
        facts(n).map(([k,v]) => `${k}: ${v}`).join(". ")
    });

    g.append(
      svgEl("circle", { cx: x, cy: y, r: 27 }),
      Object.assign(
        svgEl("text", { x, y, class: "bst-value" }),
        { textContent: String(n.value) }
      )
    );

    if (!n.parent || (!n.left && !n.right)) {
      const label = svgEl("text", {
        x, y: n.parent ? y + 45 : y - 41,
        class: "bst-role"
      });
      label.textContent = n.parent ? "LEAF" : "ROOT";
      g.appendChild(label);
    }

    if (n.value === added) {
      const tag = svgEl("text", {
        x: x + 37, y: y - 30, class: "bst-new-label"
      });
      tag.textContent = "NEW";
      g.appendChild(tag);
    }

    if (n.value === invalid) {
      const tag = svgEl("text", {
        x: x + 35, y: y - 25, class: "bst-invalid-label"
      });
      tag.textContent = "✕";
      g.appendChild(tag);
    }

    const comparison = comparisons.get(n.value);
    if (comparison) {
      const pillWidth = comparison.length * 9 + 18;
      const px = x + 35 + pillWidth > width - 5
        ? x - pillWidth - 35 : x + 35;

      const pill = svgEl("g", { class: "bst-comparison" });
      pill.append(
        svgEl("rect", {
          x: px, y: y - 15,
          width: pillWidth, height: 30, rx: 7
        }),
        Object.assign(
          svgEl("text", { x: px + pillWidth / 2, y }),
          { textContent: comparison }
        )
      );
      g.appendChild(pill);
    }

    if (onSelect) {
      g.addEventListener("click", () => onSelect(n, g));
      g.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(n, g);
          return;
        }

        const target = {
          ArrowUp: n.parent,
          ArrowLeft: n.left,
          ArrowRight: n.right,
          ArrowDown: n.left || n.right
        }[event.key];

        if (event.key.startsWith("Arrow")) {
          event.preventDefault();
          if (target) {
            svg.querySelector(
              `[data-value="${target.value}"]`
            )?.focus();
          }
        }
      });
    }
    svg.appendChild(g);
  }
  return svg;
}

/**
 * Tree view with a floating comment at the selected node.
 * No visible keyboard-instruction paragraph is added.
 */
function makeTreeView() {
  const wrap = el("div", "bst-tree-wrap");
  const viewport = el("div", "bst-tree-viewport");
  const popup = el("div", "bst-popover");

  popup.hidden = true;
  const popupClose = btn("×", "bst-popover-close");
  popupClose.setAttribute("aria-label", "Close node details");

  popup.appendChild(popupClose);
  wrap.append(viewport, popup);

  let selectedNode = null;

  function close(restore = false) {
    popup.hidden = true;
    if (restore && selectedNode) {
      viewport.querySelector(
        `[data-value="${selectedNode.value}"]`
      )?.focus();
    }
  }

  popupClose.addEventListener("click", () => close(true));
  wrap.addEventListener("keydown", event => {
    if (event.key === "Escape") close(true);
  });
  viewport.addEventListener("scroll", () => close());

  function open(n) {
    const circle = viewport.querySelector(
      `[data-value="${n.value}"] circle`
    );
    if (!circle) return;

    selectedNode = n;

    const title = el("strong", "bst-popover-title", `Node ${n.value}`);
    const dl = el("dl");

    for (const [key, value] of facts(n)) {
      dl.append(el("dt", "", key), el("dd", "", value));
    }
    popup.replaceChildren(popupClose, title, dl);
    popup.hidden = false;

    const a = circle.getBoundingClientRect();
    const b = wrap.getBoundingClientRect();
    const pw = popup.offsetWidth;
    const ph = popup.offsetHeight;

    let left = a.right - b.left + 12;
    if (left + pw > b.width - 5) {
      left = a.left - b.left - pw - 12;
    }

    popup.style.left = `${Math.max(4, left)}px`;
    popup.style.top =
      `${Math.max(4, Math.min(a.top - b.top, b.height - ph - 4))}px`;
  }

  return {
    wrap,
    open,
    close,
    draw(root, opts = {}) {
      close();
      const svg = createTree(root, {
        ...opts,
        onSelect(n) {
          open(n);
          opts.onSelect?.(n);
        }
      });
      viewport.replaceChildren(svg);
    }
  };
}

const VOCAB = [
  {
    name: "Node",
    explanation: "A node is one circle in the tree. " +
      "Each node stores one key.",
    highlight: root =>
      nodes(root).map(n => [n.value, "slate"])
  },
  {
    name: "Root",
    explanation: "The root is the top node, where the tree begins. " +
      "Node 50 is the root.",
    highlight: root => [[root.value, "purple"]]
  },
  {
    name: "Parent",
    explanation: "A parent has at least one child. " +
      "The parents are 50, 30 and 70.",
    highlight: root => nodes(root)
      .filter(n => n.left || n.right)
      .map(n => [n.value, "blue"])
  },
  {
    name: "Child",
    explanation: "Every node except the root is a child. " +
      "Blue shows left children; orange shows right children.",
    highlight: root => nodes(root)
      .filter(n => n.parent)
      .map(n => [
        n.value,
        n.parent.left === n ? "blue" : "orange"
      ])
  },
  {
    name: "Leaf",
    explanation: "Leaves have no children. The leaf nodes are " +
      "20, 40, 60 and 80.",
    highlight: root => nodes(root)
      .filter(n => !n.left && !n.right)
      .map(n => [n.value, "green"])
  },
  {
    name: "Subtree",
    explanation: "A subtree contains a node and all its descendants. " +
      "Blue shows the left subtree (30, 20, 40). " +
      "Orange shows the right subtree (70, 60, 80). " +
      "Every node can also be the root of its own subtree.",
    highlight: root => [
      ...nodes(root.left).map(n => [n.value, "blue"]),
      ...nodes(root.right).map(n => [n.value, "orange"])
    ]
  }
];

export function render(screen, container) {
  const page = el("main", "bst-page");
  const cleanup = [];
  const completed = new Set();
  let activeTab = 0;
  let destroyed = false;

  const appHeader = document.querySelector(".app-header");
  if (appHeader) {
    const update = () =>
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${Math.ceil(appHeader.getBoundingClientRect().height)}px`
      );
    update();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(appHeader);
      cleanup.push(() => observer.disconnect());
    }
  }

  const title = el("header", "bst-title");
  title.append(
    el("h1", "", "Binary Search Trees"),
    el("p", "bst-muted",
      "Five short activities. Learn the rules, explore the tree " +
      "and practise inserting values.")
  );

  // ------------------------------------------
  // Progress displays completed activities,
  // not merely which tab has been opened.
  // ------------------------------------------
  const progress = el("div", "bst-progress");
  const progressLabel = el("strong", "", "Step 0 of 5");
  const progressTrack = el("div", "bst-progress-track");
  const progressFill = el("div", "bst-progress-fill");

  progressTrack.setAttribute("role", "progressbar");
  progressTrack.setAttribute("aria-valuemin", "0");
  progressTrack.setAttribute("aria-valuemax", "5");
  progressTrack.setAttribute("aria-valuenow", "0");
  progressTrack.appendChild(progressFill);
  progress.append(
    el("strong", "", "BINARY SEARCH TREES"),
    progressTrack,
    progressLabel
  );

  const defs = [
    ["warmup", "Warm-up"],
    ["vocabulary", "Vocabulary"],
    ["rules", "BST Rules"],
    ["insertion", "Insertion"],
    ["check", "Check"]
  ];

  const tabList = el("div", "bst-tabs");
  tabList.setAttribute("role", "tablist");
  tabList.setAttribute("aria-label", "BST lesson activities");

  const panels = defs.map(([id]) => {
    const p = el("section", "bst-tab-panel");
    p.id = `bst-panel-${id}`;
    p.setAttribute("role", "tabpanel");
    p.setAttribute("aria-labelledby", `bst-tab-${id}`);
    p.tabIndex = -1;
    return p;
  });

  const tabs = defs.map(([id, label], i) => {
    const b = btn("", "bst-tab");
    b.id = `bst-tab-${id}`;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", panels[i].id);
    b.append(
      el("span", "bst-tab-number", String(i + 1)),
      document.createTextNode(label)
    );
    b.addEventListener("click", () => goTab(i));
    tabList.appendChild(b);
    return b;
  });

  function complete(id) {
    if (completed.has(id)) return;
    completed.add(id);
    const count = completed.size;

    progressLabel.textContent = `Step ${count} of 5`;
    progressFill.style.width = `${count * 20}%`;
    progressTrack.setAttribute("aria-valuenow", String(count));

    tabs.forEach((tab, i) =>
      tab.classList.toggle("is-done", completed.has(defs[i][0]))
    );
  }

  function goTab(i, focus = false) {
    if (i < 0 || i >= panels.length) return;

    // Animation stops while a different tab is open.
    if (activeTab === 3 && i !== 3) stopInsertion();

    activeTab = i;
    panels.forEach((p, index) => {
      p.hidden = i !== index;
    });
    tabs.forEach((b, index) => {
      b.setAttribute("aria-selected", String(index === i));
      b.classList.toggle("is-active", index === i);
      b.tabIndex = index === i ? 0 : -1;
    });

    previous.hidden = i === 0;
    next.hidden = i === panels.length - 1;
    toDfs.hidden = i !== panels.length - 1;

    if (focus) {
      tabList.scrollIntoView({ block: "start", behavior: "smooth" });
      panels[i].focus({ preventScroll: true });
    }
  }

  tabList.addEventListener("keydown", event => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;

    let target = null;
    if (event.key === "ArrowRight") target = (i + 1) % tabs.length;
    if (event.key === "ArrowLeft") {
      target = (i + tabs.length - 1) % tabs.length;
    }
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = tabs.length - 1;

    if (target !== null) {
      event.preventDefault();
      goTab(target);
      tabs[target].focus();
    }
  });

  // ------------------------------------------
  // Tab 1 — Original warm-up functionality
  // ------------------------------------------
  const warmup = panels[0];
  warmup.append(
    el("h2", "", "Quick warm-up"),
    el("p", "bst-muted",
      "Check what you know about trees and stacks. " +
      "This is not graded. Ask for help and try again.")
  );

  const warmupGrid = el("div", "bst-warmup-grid");
  const warmupResult = el("p", "bst-feedback");
  const warmupQuestions = screen.warmup?.questions || [];
  const refreshers = screen.warmup?.refreshers || {};
  const warmupCorrect = new Set();

  function updateWarmup() {
    if (warmupQuestions.length &&
        warmupCorrect.size === warmupQuestions.length) {
      warmupResult.className = "bst-feedback is-correct";
      warmupResult.textContent =
        "You have recalled the basics of trees and stacks.";
      complete("warmup");
    }
  }

  warmupQuestions.forEach((q, i) => {
    const card = el("article", "bst-question");
    const choices = el("div", "bst-options");
    const feedback = el("p", "bst-feedback");
    const help = el("div", "bst-help");
    help.hidden = true;

    if (q.refresher === "trees") {
      const drawing = el("div", "bst-mini-tree");
      drawing.innerHTML = `
        <svg viewBox="0 0 190 130" aria-label="Simple tree">
          <line x1="95" y1="27" x2="45" y2="101"/>
          <line x1="95" y1="27" x2="145" y2="101"/>
          <circle cx="95" cy="27" r="20"/>
          <circle cx="45" cy="101" r="20"/>
          <circle cx="145" cy="101" r="20"/>
          <text x="95" y="32">50</text>
          <text x="45" y="106">30</text>
          <text x="145" y="106">70</text>
        </svg>`;
      help.append(
        drawing,
        el("p", "", refreshers.trees ||
          "A tree has connected nodes, a root and no cycles.")
      );
    }

    if (q.refresher === "stacks") {
      const stack = el("div", "bst-stack");
      const message = el("p");
      const watch = btn("Watch stack animation", "bst-btn primary");

      let running = false;
      watch.addEventListener("click", async () => {
        if (running) return;
        running = true;
        watch.disabled = true;
        const items = [];

        for (const v of [1, 2, 3]) {
          if (destroyed) return;
          items.push(v);
          stack.replaceChildren(
            ...[...items].reverse()
              .map(n => el("span", "bst-stack-item", String(n)))
          );
          message.textContent = `Push ${v}.`;
          await new Promise(r => setTimeout(r, 750));
        }

        if (destroyed) return;
        items.pop();
        stack.replaceChildren(
          ...[...items].reverse()
            .map(n => el("span", "bst-stack-item", String(n)))
        );
        message.textContent =
          "3 came off first: Last In, First Out (LIFO).";
        running = false;
        watch.disabled = false;
      });

      help.append(
        stack,
        message,
        watch,
        el("p", "", refreshers.stacks ||
          "The last value pushed is the first removed.")
      );
    }

    [...q.options, {
      id: "unsure",
      text: "Not sure",
      unsure: true
    }].forEach(option => {
      const b = btn(option.text, "bst-answer");
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => {
        choices.querySelectorAll("button").forEach(x =>
          x.setAttribute("aria-pressed", String(x === b))
        );

        if (option.correct) {
          warmupCorrect.add(q.id);
          feedback.className = "bst-feedback is-correct";
          feedback.textContent =
            "Correct! " + (q.refresher === "stacks"
              ? "A stack follows LIFO."
              : "A tree has a root and no cycles.");
          help.hidden = true;
        } else {
          warmupCorrect.delete(q.id);
          feedback.className = "bst-feedback is-review";
          feedback.textContent = option.unsure
            ? "Read the refresher and try again."
            : "Not quite. Use the explanation to review.";
          help.hidden = false;
        }
        updateWarmup();
      });
      choices.appendChild(b);
    });

    card.append(
      el("h3", "", `${i + 1}. ${q.prompt}`),
      choices,
      feedback,
      help
    );
    warmupGrid.appendChild(card);
  });

  if (!warmupQuestions.length) {
    warmupResult.textContent =
      "Warm-up questions are unavailable in lesson.json.";
  }
  warmup.append(warmupGrid, warmupResult);

  // ------------------------------------------
  // Tab 2 — Vocabulary and pop-up comments
  // ------------------------------------------
  const vocabulary = panels[1];
  vocabulary.append(
    el("h2", "", "Meet the tree"),
    el("p", "bst-muted",
      'A tree stores values in connected nodes. A binary tree is a tree in ' +
      'which every node has at most two children: a left child and a right child.'),
    el("p", "bst-muted", 'Select each vocabulary term to learn its meaning ' +
    'and see the matching nodes highlighted in the tree.')
  );

  const vocabRoot = makeTree();
  const vocabSeen = new Set();
  const vocabButtons = el("div", "bst-chips");
  const vocabText = el("div", "bst-learn-text");
  const vocabView = makeTreeView();
  const vocabExplanation = makeCallout(
    "Explanation",
    "Choose a term to see its definition here."
  );
  const vocabLegend = el("div", "bst-subtree-legend");

  function showVocabulary(item) {
    const marks = new Map(item.highlight(vocabRoot));
    vocabView.draw(vocabRoot, { marks });

    vocabExplanation.text.textContent =
      `${item.name}. ${item.explanation}`;
    vocabLegend.replaceChildren();

    if (item.name === "Subtree" || item.name === "Child") {
      vocabLegend.append(
        el("span", "bst-legend-blue", "Blue — left"),
        el("span", "bst-legend-orange", "Orange — right")
      );
    }
  }

  VOCAB.forEach(item => {
    const b = btn(item.name, "bst-chip");
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      vocabButtons.querySelectorAll("button").forEach(x =>
        x.setAttribute("aria-pressed", String(x === b))
      );
      vocabSeen.add(item.name);
      b.classList.add("is-viewed");
      showVocabulary(item);

      if (vocabSeen.size === VOCAB.length) {
        complete("vocabulary");
      }
    });
    vocabButtons.appendChild(b);
  });

  vocabText.append(
    vocabButtons,
    vocabExplanation.box,
    vocabLegend
  );

  const vocabGrid = el("div", "bst-two-columns");
  vocabGrid.append(vocabText, vocabView.wrap);
  vocabulary.appendChild(vocabGrid);
  vocabView.draw(vocabRoot);

  // ------------------------------------------
  // Tab 3 — BST definition and ordering rules
  // ------------------------------------------
  const rules = panels[2];
  rules.append(
    el("h2", "", "What makes a Binary Search Tree?"),
   el('p', 'bst-lead',
  'A Binary Search Tree (BST) is a type of binary tree data structure in which ' +
  'each node contains a unique key and satisfies a specific ordering property. ' +
  'The following are the three fundamental ordering rules that every BST must follow:'
)
  );

  const ruleRoot = makeTree();
  const ruleView = makeTreeView();
  const ruleText = el("div", "bst-learn-text");
  const ruleButtons = el("div", "bst-rules");
  const ruleExplain = makeCallout(
    "Explanation",
    "Select a rule to watch how the example tree demonstrates it."
  );
  const seenRules = new Set();
  const ruleGrid = el("div", "bst-two-columns");

  const RULES = [
    {
      id: "unique",
      name: "Unique keys",
      symbol: "≠",
      text: "Every key appears only once. Duplicate values " +
        "are rejected in this lesson."
    },
    {
      id: "left",
      name: "Smaller goes left",
      symbol: "<",
      text: "Every value in the left subtree must be smaller " +
        "than the root of that subtree."
    },
    {
      id: "right",
      name: "Larger goes right",
      symbol: ">",
      text: "Every value in the right subtree must be larger " +
        "than the root of that subtree."
    }
  ];

  const restoreRule = btn("Restore original tree", "bst-btn");
  restoreRule.hidden = true;

  function drawRule(rule) {
    if (rule.id === "unique") {
      // Deliberately invalid duplicate example.
      let invalidRoot = makeTree();
      const eighty = find(invalidRoot, 80);
      eighty.right = node(80, eighty);

      ruleView.draw(invalidRoot, {
        invalid: 80,
        marks: new Map([[80, "orange"]])
      });
      restoreRule.hidden = false;
      ruleExplain.text.textContent =
        "This deliberately invalid example shows a duplicate 80. " +
        "The insertion algorithm must reject it.";
    } else {
      const left = rule.id === "left";
      const members = nodes(left ? ruleRoot.left : ruleRoot.right);
      const colour = left ? "blue" : "orange";
      const symbol = left ? "<" : ">";
      const comparisons = new Map(
        members.map(n => [n.value, `${n.value} ${symbol} 50`])
      );

      ruleView.draw(ruleRoot, {
        marks: new Map([
          [50, "purple"],
          ...members.map(n => [n.value, colour])
        ]),
        comparisons
      });
      restoreRule.hidden = true;
      ruleExplain.text.textContent =
        `${rule.text} Compare every highlighted value with 50. ` +
        "The rule also applies inside every subtree.";
    }
  }

  RULES.forEach(rule => {
    const b = btn("", "bst-rule-button");
    b.append(

      el("span", "bst-rule-symbol", rule.symbol),
      el("strong", "", rule.name),
      el("span", "", rule.text)
    );

    b.addEventListener("click", () => {
      seenRules.add(rule.id);
      ruleButtons.querySelectorAll("button").forEach(x =>
        x.setAttribute("aria-pressed", String(x === b))
      );
      drawRule(rule);
      if (seenRules.size === RULES.length) complete("rules");
    });
    ruleButtons.appendChild(b);
  });

  restoreRule.addEventListener("click", () => {
    ruleView.draw(ruleRoot);
    restoreRule.hidden = true;
    ruleExplain.text.textContent =
      "Original valid tree restored. Every key is unique.";
  });

  const clueTerms = el("div", "bst-chips");
  for (const name of ["Node", "Root", "Subtree"]) {
    const b = btn(`Review ${name}`, "bst-chip");
    b.addEventListener("click", () => {
      goTab(1, true);
      const index = VOCAB.findIndex(v => v.name === name);
      vocabButtons.children[index]?.click();
    });
    clueTerms.appendChild(b);
  }

  ruleText.append(
    ruleButtons,
    ruleExplain.box,
    restoreRule,
    el("p", "bst-muted",
      "Need a refresher? These terms were introduced earlier."),
    clueTerms
  );
  ruleGrid.append(ruleText, ruleView.wrap);
  rules.appendChild(ruleGrid);
  ruleView.draw(ruleRoot);

  // ------------------------------------------
  // Tab 4 — Insertion player
  // ------------------------------------------
  const insertionPanel = panels[3];
  insertionPanel.append(
    el("h2", "", "Grow the tree"),
    el("p", "bst-muted",
      "Apply the ordering rules, one comparison at a time. " +
      "You can predict the next direction or play the animation.")
  );

  const treeCard = el("article", "bst-card");
  const controlCard = el("article", "bst-card");

  let addedValues = [];
  let root = makeTree();
  let pending = null;
  let active = null;
  let newValue = null;
  let invalidValue = null;
  let pathValues = [];
  let comparisons = new Map();
  let timer = null;

  const insertionView = makeTreeView();
  const count = el("span", "bst-node-count");
  const treeFrame = el("div", "bst-tree-frame");
  const legend = el("div", "bst-tree-legend");

  [
    ["○", "Normal"],
    ["◌", "Comparing"],
    ["●", "Selected"],
    ["+", "New"],
    ["<>", "Comparison sign"]
  ].forEach(([symbol, label]) => {
    const item = el("span", "bst-legend-item");
    item.append(
      el("span", "bst-legend-symbol", symbol),
      document.createTextNode(label)
    );
    legend.appendChild(item);
  });

  treeFrame.append(insertionView.wrap, legend);

  const textTree = el("details", "bst-tree-text");
  const textTreeBody = el("div");
  textTree.append(
    el("summary", "", "Show tree as text"),
    textTreeBody
  );

  treeCard.append(
    el("h3", "", "Interactive tree"),
    count,
    treeFrame,
    textTree
  );

  const insertionExplanation = makeCallout(
    "What is happening",
    "Try inserting 65 into the tree."
  );
  const insertionPath = el("p", "bst-insertion-path");
  insertionExplanation.box.appendChild(insertionPath);

  const form = el("form", "bst-form");
  const label = el("label", "", "Insert a value (0–99)");
  const input = el("input", "bst-input");
  input.type = "number";
  input.min = "0";
  input.max = "99";
  input.step = "1";
  input.placeholder = "e.g. 65";
  input.id = "bst-insert-value";
  label.htmlFor = input.id;

  const start = btn("Start insertion", "bst-btn primary");
  start.type = "submit";
  const reset = btn("Reset tree", "bst-btn");
  form.append(label, input, start, reset);

  const predict = el("div", "bst-predict");
  const left = btn("← Go left", "bst-btn");
  const right = btn("Go right →", "bst-btn");
  predict.append(
    el("strong", "", "Predict the next move"),
    left, right
  );

  const controls = el("div", "bst-player");
  const nextStep = btn("Show next step →", "bst-btn primary");
  const play = btn("Play", "bst-btn");
  const speed = el("select", "bst-speed");

  [
    ["2200", "Slow"],
    ["1400", "Normal"],
    ["800", "Fast"]
  ].forEach(([value, label]) => {
    const opt = el("option", "", label);
    opt.value = value;
    speed.appendChild(opt);
  });
  speed.value = "1400";

  controls.append(nextStep, play, speed);

  const history = el("div", "bst-player");
  const undo = btn("Undo last insert", "bst-btn");
  const replay = btn("Replay last", "bst-btn");
  history.append(undo, replay);

  controlCard.append(
    el("h3", "", "Try an insertion"),
    insertionExplanation.box,
    form,
    predict,
    controls,
    history
  );

  const insertionGrid = el("div", "bst-explore-grid");
  insertionGrid.append(treeCard, controlCard);
  insertionPanel.appendChild(insertionGrid);

  function refreshInsertion() {
    count.textContent = `${nodes(root).length} nodes`;
    insertionView.draw(root, {
      active,
      added: newValue,
      invalid: invalidValue,
      comparisons,
      path: pathValues
    });
    textTreeBody.replaceChildren(listTree(root));
  }

  function explain(message) {
    insertionExplanation.text.textContent = message;
  }

  function stopInsertion() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    play.textContent = "Play";
    updateInsertionControls();
  }

  function updateInsertionControls() {
    const busy = pending !== null;
    nextStep.disabled = !busy || timer !== null;
    play.disabled = !busy;
    start.disabled = busy;
    input.disabled = busy;
    predict.hidden = !busy || timer !== null;
    undo.disabled = busy || addedValues.length === 0;
    replay.disabled = undo.disabled;
  }

  function rebuild() {
    root = makeTree([...INITIAL, ...addedValues]);
    pending = null;
    active = null;
    newValue = null;
    invalidValue = null;
    pathValues = [];
    comparisons = new Map();
    refreshInsertion();
    updateInsertionControls();
  }

  function prepare(value) {
    stopInsertion();

    if (!Number.isInteger(value) || value < 0 || value > 99) {
      explain("Enter a whole number between 0 and 99.");
      return false;
    }

    if (find(root, value)) {
      invalidValue = value;
      explain(`${value} already exists. Duplicate keys are not allowed.`);
      refreshInsertion();
      return false;
    }

    if (nodes(root).length >= MAX_NODES) {
      explain("The tree is full for this exercise. Reset to continue.");
      return false;
    }

    invalidValue = null;
    newValue = null;
    pathValues = [];
    comparisons = new Map();

    const path = [];
    let current = root;
    while (current) {
      const direction = value < current.value ? "left" : "right";
      path.push({ n: current, direction });
      current = current[direction];
    }

    pending = { value, path, index: 0 };
    active = path[0].n.value;
    comparisons.set(active, `${value} ? ${active}`);

    explain(
      `Inserting ${value}. Compare it with ${active}. ` +
      "Predict left or right, or reveal the next step."
    );
    insertionPath.textContent = "Ready at the root.";
    refreshInsertion();
    updateInsertionControls();
    return true;
  }

  function advance(guess = null) {
    if (!pending) return;

    const { value, path } = pending;
    const step = path[pending.index];
    const sign = step.direction === "left" ? "<" : ">";

    comparisons.set(step.n.value, `${value} ${sign} ${step.n.value}`);
    pathValues.push(step.n.value);

    let feedback = "";
    if (guess) {
      feedback = guess === step.direction
        ? "Correct! "
        : `Not quite. The correct direction is ${step.direction}. `;
    }

    pending.index += 1;

    if (pending.index === path.length) {
      root = insert(root, value);
      addedValues.push(value);
      active = null;
      newValue = value;
      pathValues.push(value);
      pending = null;

      explain(
        `${feedback}${value} ${sign} ${step.n.value}. ` +
        `The ${step.direction} position is empty, ` +
        `so ${value} is inserted there.`
      );
      insertionPath.textContent =
        `Complete: ${pathValues.join(" → ")}`;
      complete("insertion");
      stopInsertion();
    } else {
      active = path[pending.index].n.value;
      comparisons.set(active, `${value} ? ${active}`);
      explain(
        `${feedback}${value} ${sign} ${step.n.value}. ` +
        `Go ${step.direction}. Now compare with ${active}.`
      );
      insertionPath.textContent =
        `Path: ${pathValues.join(" → ")}`;
    }

    refreshInsertion();
    updateInsertionControls();
  }

  function startAnimation() {
    if (!pending || timer !== null) return;
    play.textContent = "Pause";
    timer = setInterval(() => advance(), Number(speed.value));
    updateInsertionControls();
  }

  play.addEventListener("click", () => {
    if (timer !== null) stopInsertion();
    else startAnimation();
  });

  nextStep.addEventListener("click", () => advance());
  left.addEventListener("click", () => advance("left"));
  right.addEventListener("click", () => advance("right"));

  speed.addEventListener("change", () => {
    if (timer === null) return;
    stopInsertion();
    startAnimation();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!input.value.trim()) {
      explain("Enter a number first. Try 65.");
      return;
    }
    prepare(Number(input.value));
  });

  reset.addEventListener("click", () => {
    stopInsertion();
    addedValues = [];
    rebuild();
    input.value = "";
    insertionPath.textContent = "";
    explain("Original tree restored. Try inserting 65.");
  });

  undo.addEventListener("click", () => {
    stopInsertion();
    addedValues.pop();
    rebuild();
    explain("The last inserted value was removed.");
  });

  replay.addEventListener("click", () => {
    if (!addedValues.length) return;
    stopInsertion();
    const value = addedValues.pop();
    rebuild();
    input.value = String(value);
    prepare(value);
  });

  refreshInsertion();
  updateInsertionControls();

  // ------------------------------------------
  // Tab 5 — Knowledge check and clues
  // ------------------------------------------
  const check = panels[4];
  check.append(
    el("h2", "", "Can you apply the BST rule?"),
    el("p", "bst-muted",
      "In the original example tree, where would 65 be inserted?")
  );

  const answers = el("div", "bst-options");
  const checkFeedback = el("p", "bst-feedback");

  [
    ["Left child of 60", false],
    ["Right child of 60", true],
    ["Right child of 80", false],
    ["Not sure", false]
  ].forEach(([text, correct]) => {
    const b = btn(text, "bst-answer");
    b.setAttribute("aria-pressed", "false");

    b.addEventListener("click", () => {
      answers.querySelectorAll("button").forEach(x =>
        x.setAttribute("aria-pressed", String(x === b))
      );

      if (correct) {
        checkFeedback.className = "bst-feedback is-correct";
        checkFeedback.textContent =
          "Correct! 65 > 50, 65 < 70, and 65 > 60. " +
          "It becomes the right child of 60.";
        complete("check");
      } else {
        checkFeedback.className = "bst-feedback is-review";
        checkFeedback.textContent =
          "Not quite. Use a clue or watch the insertion demonstration.";
      }
    });
    answers.appendChild(b);
  });

  const clue = makeCallout("Clue");
  clue.box.hidden = true;

  const clueTexts = [
    "Start at the root, 50. Compare 65 with 50.",
    "65 is larger than 50, so move right to 70.",
    "65 is smaller than 70, so go left to 60. " +
      "It is larger than 60, so use the empty right position."
  ];
  let clueIndex = 0;

  const clueButton = btn("Need a clue?", "bst-btn");
  const showMe = btn("Show me →", "bst-btn");

  clueButton.addEventListener("click", () => {
    if (clueIndex >= clueTexts.length) return;
    clue.box.hidden = false;
    clue.text.textContent = clueTexts[clueIndex++];
    clueButton.textContent = clueIndex >= clueTexts.length
      ? "All clues shown" : "Another clue";
    clueButton.disabled = clueIndex >= clueTexts.length;
  });

  showMe.addEventListener("click", () => {
    goTab(3, true);
    stopInsertion();
    addedValues = [];
    rebuild();
    input.value = "65";
    if (prepare(65)) startAnimation();
  });

  const checkActions = el("div", "bst-player");
  checkActions.append(clueButton, showMe);
  check.append(answers, checkFeedback, clue.box, checkActions);

  // ------------------------------------------
  // Bottom navigation
  // ------------------------------------------
  const navigation = el("nav", "bst-navigation");
  navigation.setAttribute("aria-label", "BST lesson navigation");

  const previous = btn("← Previous", "bst-btn");
  const next = btn("Next →", "bst-btn primary");
  const toDfs = el("a", "bst-btn primary", "Next Lesson →");
  toDfs.href = "#/concept-idea";

  previous.addEventListener("click", () =>
    goTab(activeTab - 1, true)
  );
  next.addEventListener("click", () =>
    goTab(activeTab + 1, true)
  );

  navigation.append(previous, next, toDfs);

  page.append(
    title,
    progress,
    tabList,
    ...panels,
    navigation
  );

  container.replaceChildren(page);
  goTab(0);

  return () => {
    destroyed = true;
    stopInsertion();
    cleanup.forEach(fn => fn());
  };
}
