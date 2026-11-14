
/**
 * COS212 DFS Tutor — Applied Practice
 * Three short tabs, new values, no progress bar.
 */

const NS = 'http://www.w3.org/2000/svg';

const TRACE_VALUES = [62, 29, 84, 11, 46, 73, 95, 35];

const REPAIRS = [
  {
    spec: [
      65,
      [32, [18], [47, null, [72]]],
      [88, [76], [96]]
    ],
    bad: 72,
    parent: 76,
    side: 'left',
    hint:
      'Look at the whole left subtree of 65. All its values ' +
      'must be smaller than 65.',
    choices: [
      ['Left child of 76', 76, 'left'],
      ['Right child of 47', 47, 'right'],
      ['Left child of 18', 18, 'left']
    ]
  },
  {
    spec: [
      54,
      [22, [10], [37]],
      [78, [69, [49]], [92]]
    ],
    bad: 49,
    parent: 37,
    side: 'right',
    hint:
      'Every value in the right subtree of 54 must be ' +
      'greater than 54.',
    choices: [
      ['Left child of 69', 69, 'left'],
      ['Right child of 37', 37, 'right'],
      ['Left child of 10', 10, 'left']
    ]
  },
  {
    spec: [
      71,
      [35, [16], [53]],
      [90, [82, null, [94]], [98]]
    ],
    bad: 94,
    parent: 98,
    side: 'left',
    hint:
      'All values in the left subtree of 90 must be ' +
      'smaller than 90.',
    choices: [
      ['Left child of 98', 98, 'left'],
      ['Right child of 82', 82, 'right'],
      ['Right child of 53', 53, 'right']
    ]
  }
];

const SEQUENCES = [
  {
    type: 'pre',
    label: 'A · Pre-order',
    values: [58, 26, 81, 12, 42, 69, 94, 36]
  },
  {
    type: 'in',
    label: 'B · In-order',
    values: [74, 38, 91, 19, 52, 84, 97, 61]
  },
  {
    type: 'post',
    label: 'C · Post-order',
    values: [45, 21, 73, 8, 31, 59, 88, 66]
  }
];

const RULES = {
  pre: 'Root → Left → Right',
  in: 'Left → Root → Right',
  post: 'Left → Right → Root'
};

/* ==========================================
   DOM HELPERS
   ========================================== */

function el(tag, css = '', value = '') {
  const e = document.createElement(tag);
  if (css) e.className = css;
  e.textContent = value;
  return e;
}

function button(value, css = 'practice-btn') {
  const b = el('button', css, value);
  b.type = 'button';
  return b;
}

function svgEl(tag, attrs) {
  const e = document.createElementNS(NS, tag);

  Object.entries(attrs).forEach(([k, v]) => {
    e.setAttribute(k, String(v));
  });

  return e;
}

/* ==========================================
   TREE HELPERS
   ========================================== */

function fromSpec(spec, parent = null) {
  if (!spec) return null;

  const node = {
    value: spec[0],
    parent,
    left: null,
    right: null
  };

  node.left = fromSpec(spec[1], node);
  node.right = fromSpec(spec[2], node);

  return node;
}

function insert(root, value) {
  if (!root) {
    return {
      value,
      parent: null,
      left: null,
      right: null
    };
  }

  let current = root;

  while (true) {
    const side = value < current.value
      ? 'left'
      : 'right';

    if (current.value === value) return root;

    if (current[side]) {
      current = current[side];
    } else {
      current[side] = {
        value,
        parent: current,
        left: null,
        right: null
      };
      return root;
    }
  }
}

function fromValues(values) {
  let root = null;

  values.forEach(value => {
    root = insert(root, value);
  });

  return root;
}

function allNodes(root) {
  return root
    ? [
        ...allNodes(root.left),
        root,
        ...allNodes(root.right)
      ]
    : [];
}

function findNode(root, value) {
  return allNodes(root).find(
    n => n.value === value
  ) || null;
}

function traversal(root, type) {
  const result = [];

  function walk(n) {
    if (!n) return;

    if (type === 'pre') result.push(n.value);

    walk(n.left);

    if (type === 'in') result.push(n.value);

    walk(n.right);

    if (type === 'post') result.push(n.value);
  }

  walk(root);
  return result;
}

/* ==========================================
   HIGHLIGHTED FEEDBACK
   ========================================== */

function callout(title, message) {
  const box = el('div', 'practice-callout');
  const heading = el('strong', '', title);
  const body = el('p', '', message);

  box.setAttribute('aria-live', 'polite');
  box.append(heading, body);

  return { box, heading, body };
}

function say(c, title, message, tone = '') {
  c.heading.textContent = title;
  c.body.textContent = message;
  c.box.dataset.tone = tone;
}

/* ==========================================
   TREE FRAME
   ========================================== */

function makeTreeFrame(legendEntries) {
  const frame = el('div', 'practice-tree-frame');
  const viewport = el('div', 'practice-tree-viewport');

  const svg = svgEl('svg', {
    class: 'practice-tree-svg',
    role: 'group',
    'aria-label': 'Interactive tree'
  });

  viewport.append(svg);

  const legend = el('div', 'practice-legend');

  legendEntries.forEach(([label, cls]) => {
    const item = el('span', 'practice-legend-item');

    item.append(
      el('span', `practice-legend-dot ${cls}`),
      document.createTextNode(label)
    );

    legend.append(item);
  });

  frame.append(viewport, legend);

  return { frame, svg };
}

/* ==========================================
   INTERACTIVE TREE DRAWING
   ========================================== */

function paint(view, root, state, onClick) {
  const { svg } = view;
  svg.replaceChildren();

  const entries = [];

  function collect(n, depth) {
    if (!n) return;

    collect(n.left, depth + 1);
    entries.push({ n, depth });
    collect(n.right, depth + 1);
  }

  collect(root, 0);

  if (!entries.length) return;

  const width = Math.max(620, entries.length * 81);

  const maxDepth = Math.max(
    ...entries.map(x => x.depth)
  );

  const height = Math.max(
    315,
    118 + maxDepth * 91
  );

  svg.setAttribute(
    'viewBox',
    `0 0 ${width} ${height}`
  );

  const positions = new Map();

  entries.forEach(({ n, depth }, index) => {
    positions.set(n, {
      x: entries.length === 1
        ? width / 2
        : 54 + (width - 108) * index /
          (entries.length - 1),
      y: 49 + depth * 91
    });
  });

  // Edges behind nodes.
  entries.forEach(({ n }) => {
    if (!n.parent) return;

    const a = positions.get(n.parent);
    const b = positions.get(n);

    svg.append(
      svgEl('line', {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        class: 'practice-edge'
      })
    );
  });

  entries.forEach(({ n }) => {
    const { x, y } = positions.get(n);

    const classes = ['practice-node'];
    let label = '';

    if (n.value === state.current) {
      classes.push('is-current');
      label = 'NOW';
    } else if (
      (state.visited || []).includes(n.value)
    ) {
      classes.push('is-visited');

      label =
        `#${state.visited.indexOf(n.value) + 1}`;
    } else if (
      (state.pending || []).includes(n.value)
    ) {
      classes.push('is-pending');
      label = 'WAIT';
    }

    if ((state.draft || []).includes(n.value)) {
      classes.push('is-draft');

      label =
        `#${state.draft.indexOf(n.value) + 1}`;
    }

    if (state.selected === n.value) {
      classes.push('is-selected');
    }

    if (state.error === n.value) {
      classes.push('is-error');
    }

    if (state.fixed === n.value) {
      classes.push('is-fixed');
      label = 'FIXED';
    }

    const group = svgEl('g', {
      class: classes.join(' '),
      role: 'button',
      tabindex: 0,
      'data-value': n.value,
      'aria-label': `Node ${n.value}`
    });

    const text = svgEl('text', {
      x,
      y,
      class: 'practice-node-value'
    });

    text.textContent = String(n.value);

    const tag = svgEl('text', {
      x,
      y: y + 42,
      class: 'practice-node-tag'
    });

    tag.textContent = label;

    group.append(
      svgEl('circle', {
        cx: x,
        cy: y,
        r: 25
      }),
      text,
      tag
    );

    const act = () => onClick(n);

    group.addEventListener('click', act);

    group.addEventListener('keydown', event => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        act();
        return;
      }

      if (event.key.startsWith('Arrow')) {
        const next = {
          ArrowUp: n.parent,
          ArrowLeft: n.left,
          ArrowRight: n.right,
          ArrowDown: n.left || n.right
        }[event.key];

        event.preventDefault();

        if (next) {
          svg.querySelector(
            `[data-value="${next.value}"]`
          )?.focus();
        }
      }
    });

    svg.append(group);
  });
}

function renderTrail(
  where,
  values,
  empty = 'None yet'
) {
  where.replaceChildren();

  if (!values.length) {
    where.append(
      el('span', 'practice-muted', empty)
    );
    return;
  }

  values.forEach((v, i) => {
    where.append(
      el('span', 'practice-visit', String(v))
    );

    if (i !== values.length - 1) {
      where.append(
        el('span', 'practice-arrow', '→')
      );
    }
  });
}

function parseSequence(raw) {
  const words = raw
    .trim()
    .split(/[\s,;→]+/)
    .filter(Boolean);

  if (!words.every(w => /^-?\d+$/.test(w))) {
    return null;
  }

  return words.map(Number);
}

/* ==========================================
   MAIN PRACTICE SCREEN
   ========================================== */

export function render(screen, container) {
  const page = el('main', 'practice-page');

  const tabs = [
    ['repair', '1. Fix the BST'],
    ['trace', '2. Trace DFS'],
    ['sequence', '3. Traversal Tasks']
  ];

  const finishedTabs = new Set();

  const title = el('header', 'practice-intro');

  title.append(
    el('h1', '', 'DFS Practice'),
    el(
      'p',
      'practice-muted',
      'Apply BST rules and DFS traversals to unfamiliar ' +
      'trees. Try, check, and use hints when needed. ' +
      'Nothing is graded.'
    )
  );

  const tabBar = el('div', 'practice-tabs');

  tabBar.setAttribute('role', 'tablist');

  const panels = tabs.map(([id]) => {
    const p = el('section', 'practice-panel');

    p.id = `practice-panel-${id}`;

    p.setAttribute('role', 'tabpanel');

    p.setAttribute(
      'aria-labelledby',
      `practice-tab-${id}`
    );

    p.tabIndex = -1;

    return p;
  });

  let activeTab = 0;

  const tabButtons = tabs.map(([id, label], i) => {
    const b = button(label, 'practice-tab');

    b.id = `practice-tab-${id}`;

    b.setAttribute('role', 'tab');

    b.setAttribute(
      'aria-controls',
      panels[i].id
    );

    b.addEventListener('click', () => {
      goTab(i);
    });

    tabBar.append(b);

    return b;
  });

  function markDone(id) {
    finishedTabs.add(id);

    tabButtons.forEach((b, i) => {
      b.classList.toggle(
        'is-done',
        finishedTabs.has(tabs[i][0])
      );
    });
  }

  function goTab(i) {
    if (i < 0 || i >= panels.length) return;

    activeTab = i;

    panels.forEach((p, index) => {
      p.hidden = i !== index;
    });

    tabButtons.forEach((b, index) => {
      b.classList.toggle(
        'is-active',
        index === i
      );

      b.setAttribute(
        'aria-selected',
        String(index === i)
      );

      b.tabIndex = index === i ? 0 : -1;
    });
  }

  tabBar.addEventListener('keydown', event => {
    const index = tabButtons.indexOf(
      document.activeElement
    );

    if (index < 0) return;

    let next = null;

    if (event.key === 'ArrowRight') {
      next = (index + 1) % 3;
    }

    if (event.key === 'ArrowLeft') {
      next = (index + 2) % 3;
    }

    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 2;

    if (next !== null) {
      event.preventDefault();
      goTab(next);
      tabButtons[next].focus();
    }
  });

  /* ==========================================
     TAB 1 — REPAIR INVALID BSTs
     ========================================== */

  let repairIndex = 0;
  let repairRoot = null;
  let selectedBad = false;
  let repaired = false;
  let repairError = null;

  const repairSolved = new Set();

  const repairLayout = el(
    'div',
    'practice-layout'
  );

  const repairLeft = el(
    'article',
    'practice-card'
  );

  const repairView = makeTreeFrame([
    ['Node', 'normal'],
    ['Selected', 'selected'],
    ['Incorrect', 'error'],
    ['Fixed', 'fixed']
  ]);

  const repairCounter = el(
    'span',
    'practice-count'
  );

  const repairHeading = el(
    'div',
    'practice-heading'
  );

  repairHeading.append(
    el('h2', '', 'Find the broken BST rule'),
    repairCounter
  );

  repairLeft.append(
    repairHeading,
    el(
      'p',
      'practice-muted',
      'One value is in the wrong subtree. ' +
      'Click that node, then choose its correct ' +
      'empty position.'
    ),
    repairView.frame
  );

  const repairRight = el(
    'article',
    'practice-card practice-task'
  );

  const repairCall = callout(
    'Find the misplaced value',
    'Check the ordering rule at every ancestor, ' +
    'not just the direct parent.'
  );

  const repairOptions = el(
    'div',
    'practice-answer-grid'
  );

  const repairHint = button('Hint');

  const repairNext = button(
    'Next case →',
    'practice-btn practice-primary'
  );

  const repairActions = el(
    'div',
    'practice-actions'
  );

  repairActions.append(
    repairHint,
    repairNext
  );

  repairRight.append(
    el('span', 'practice-eyebrow', 'BST RULES'),
    el('h2', '', 'Diagnose and repair'),
    repairCall.box,
    repairOptions,
    repairActions
  );

  repairLayout.append(
    repairLeft,
    repairRight
  );

  panels[0].append(repairLayout);

  function loadRepair() {
    const scenario = REPAIRS[repairIndex];

    repairRoot = fromSpec(scenario.spec);
    selectedBad = false;
    repaired = false;
    repairError = null;

    repairOptions.replaceChildren();
    showRepairOptions();
    repairOptions.hidden = true;

    repairCounter.textContent =
      `Case ${repairIndex + 1} of ${REPAIRS.length}`;

    repairNext.hidden =
      repairIndex === REPAIRS.length - 1;

    repairNext.disabled = true;
    repairHint.disabled = false;

    say(
      repairCall,
      'Find the misplaced value',
      'Click the node that breaks the BST ' +
      'ordering property.'
    );

    drawRepair();
  }

  function drawRepair() {
    paint(
      repairView,
      repairRoot,
      {
        selected: selectedBad
          ? REPAIRS[repairIndex].bad
          : null,
        error: repairError,
        fixed: repaired
          ? REPAIRS[repairIndex].bad
          : null
      },
      n => {
        if (repaired) return;

        const scenario = REPAIRS[repairIndex];

        if (n.value !== scenario.bad) {
          repairError = n.value;

          drawRepair();

          say(
            repairCall,
            'Try another node',
            `Node ${n.value} is not the misplaced ` +
            'value. Compare each node with all ' +
            'its ancestors.',
            'review'
          );

          return;
        }

        selectedBad = true;
        repairError = null;

        drawRepair();

        repairOptions.hidden = false;

        say(
          repairCall,
          'Good diagnosis',
          `You found ${n.value}. Where should it ` +
          'move so the entire tree follows the ' +
          'BST rules?'
        );
      }
    );
  }

  function showRepairOptions() {
    const scenario = REPAIRS[repairIndex];

    repairOptions.replaceChildren();

    scenario.choices.forEach(
      ([label, parent, side]) => {
        const b = button(
          label,
          'practice-answer'
        );

        b.addEventListener('click', () => {
          if (!selectedBad || repaired) return;

          if (
            scenario.parent !== parent ||
            scenario.side !== side
          ) {
            say(
              repairCall,
              'Not a valid repair',
              'That position would still break ' +
              'a BST rule or would not move the ' +
              'value into the correct subtree. ' +
              'Try another location.',
              'review'
            );

            return;
          }

          const badNode = findNode(
            repairRoot,
            scenario.bad
          );

          const parentNode = findNode(
            repairRoot,
            parent
          );

          const oldSide =
            badNode.parent.left === badNode
              ? 'left'
              : 'right';

          badNode.parent[oldSide] = null;

          badNode.parent = parentNode;
          parentNode[side] = badNode;

          repaired = true;
          repairOptions.hidden = true;
          repairNext.disabled = false;
          repairHint.disabled = true;

          repairSolved.add(repairIndex);

          if (
            repairSolved.size === REPAIRS.length
          ) {
            markDone('repair');
          }

          drawRepair();

          say(
            repairCall,
            'BST repaired!',
            `${scenario.bad} is now the ${side} ` +
            `child of ${parent}. All subtree ` +
            'ordering rules are satisfied.',
            'correct'
          );
        });

        repairOptions.append(b);
      }
    );
  }

  repairHint.addEventListener('click', () => {
    const s = REPAIRS[repairIndex];

    say(
      repairCall,
      'Hint',
      selectedBad
        ? 'The misplaced node must go into the ' +
          `subtree that contains ${s.parent}. ` +
          'Look for an empty child position.'
        : s.hint
    );
  });

  repairNext.addEventListener('click', () => {
    if (
      !repaired ||
      repairIndex >= REPAIRS.length - 1
    ) return;

    repairIndex++;
    loadRepair();
  });

  /* ==========================================
     TAB 2 — TRACE DFS USING A REAL STACK
     ========================================== */

  const traceRoot = fromValues(TRACE_VALUES);

  const traceTargets = [73, 77];

  let traceCase = 0;
  let traceStack = [];
  let traceVisited = [];
  let traceCurrent = null;
  let traceError = null;
  let traceFinished = false;

  const traceCompleted = new Set();

  const traceModes = el(
    'div',
    'practice-subtabs'
  );

  const traceModeButtons = traceTargets.map(
    (target, index) => {
      const b = button(
        index === 0
          ? `Find ${target}`
          : `Find ${target} (missing)`,
        'practice-subtab'
      );

      b.addEventListener('click', () => {
        traceCase = index;
        resetTrace();
      });

      traceModes.append(b);

      return b;
    }
  );

  const traceLayout = el(
    'div',
    'practice-layout'
  );

  const traceTreeCard = el(
    'article',
    'practice-card'
  );

  const traceView = makeTreeFrame([
    ['Not visited', 'normal'],
    ['Current', 'current'],
    ['Visited', 'visited'],
    ['On stack', 'pending']
  ]);

  const traceHeading = el(
    'h2',
    '',
    'Choose the next node to visit'
  );

  const traceVisitedBox = el(
    'div',
    'practice-trail'
  );

  traceTreeCard.append(
    traceHeading,
    el(
      'p',
      'practice-muted',
      'Click the node on the tree that comes ' +
      'off the stack next. DFS visits left first ' +
      'and stops when the target is found.'
    ),
    traceView.frame,
    el(
      'strong',
      'practice-small-heading',
      'Visited order'
    ),
    traceVisitedBox
  );

  const traceSide = el(
    'div',
    'practice-side'
  );

  const traceStackCard = el(
    'article',
    'practice-card practice-stack-card'
  );

  const traceStackStatus = el(
    'p',
    'practice-muted'
  );

  const traceStackList = el(
    'div',
    'practice-stack'
  );

  traceStackCard.append(
    el(
      'span',
      'practice-eyebrow',
      'LIVE STACK · LIFO'
    ),
    el('h2', '', 'Which node is on top?'),
    traceStackStatus,
    traceStackList
  );

  const traceTask = el(
    'article',
    'practice-card practice-task'
  );

  const traceCall = callout(
    'Your move',
    'Select the top item from the stack ' +
    'by clicking its node.'
  );

  const traceHint = button('Hint');
  const traceRestart = button('Restart search');

  const traceActions = el(
    'div',
    'practice-actions'
  );

  traceActions.append(
    traceHint,
    traceRestart
  );

  const traceCount = el(
    'p',
    'practice-muted'
  );

  traceTask.append(
    el('span', 'practice-eyebrow', 'YOUR TURN'),
    el('h2', '', 'Run the search'),
    traceCount,
    traceCall.box,
    traceActions
  );

  traceSide.append(
    traceStackCard,
    traceTask
  );

  traceLayout.append(
    traceTreeCard,
    traceSide
  );

  panels[1].append(
    traceModes,
    traceLayout
  );

  function resetTrace() {
    traceStack = [traceRoot];
    traceVisited = [];
    traceCurrent = null;
    traceError = null;
    traceFinished = false;

    renderTrace();

    say(
      traceCall,
      'Your move',
      `Find ${traceTargets[traceCase]} using ` +
      'left-first pre-order DFS. Click the node ' +
      'at the TOP of the stack.'
    );
  }

  function renderTrace() {
    const waiting = [...traceStack]
      .reverse()
      .map(n => n.value);

    traceModeButtons.forEach((b, i) => {
      b.setAttribute(
        'aria-pressed',
        String(traceCase === i)
      );

      b.classList.toggle(
        'is-done',
        traceCompleted.has(i)
      );
    });

    paint(
      traceView,
      traceRoot,
      {
        current: traceCurrent,
        visited: traceVisited,
        pending: waiting,
        error: traceError
      },
      n => {
        if (traceFinished) return;

        const expected =
          traceStack[traceStack.length - 1];

        if (!expected) return;

        if (n.value !== expected.value) {
          traceError = n.value;

          renderTrace();

          say(
            traceCall,
            'Check the stack',
            `You selected ${n.value}. The ` +
            'stack follows LIFO, so look at the ' +
            'value marked TOP before choosing again.',
            'review'
          );

          return;
        }

        traceError = null;

        const current = traceStack.pop();

        traceCurrent = current.value;
        traceVisited.push(current.value);

        const target = traceTargets[traceCase];

        const found =
          current.value === target;

        if (!found) {
          // Push right first so left is popped first.
          if (current.right) {
            traceStack.push(current.right);
          }

          if (current.left) {
            traceStack.push(current.left);
          }
        }

        if (found || traceStack.length === 0) {
          traceFinished = true;

          traceCompleted.add(traceCase);

          if (
            traceCompleted.size ===
            traceTargets.length
          ) {
            markDone('trace');
          }
        }

        renderTrace();

        if (found) {
          say(
            traceCall,
            'Target found!',
            `You found ${target} after visiting ` +
            `${traceVisited.length} nodes. ` +
            'DFS stops here.',
            'correct'
          );
        } else if (traceFinished) {
          say(
            traceCall,
            'Target not found',
            `All ${traceVisited.length} nodes ` +
            'were visited and the stack is empty. ' +
            `${target} is not in this tree.`,
            'correct'
          );
        } else {
          const children = [
            current.right,
            current.left
          ]
            .filter(Boolean)
            .map(n => n.value);

          say(
            traceCall,
            `Visited ${current.value}`,
            children.length
              ? `Push ${children.join(', then ')}. ` +
                'The left child is visited first ' +
                'because it was pushed last.'
              : 'This node is a leaf. Pop the ' +
                'next waiting node from the stack.',
            'correct'
          );
        }
      }
    );

    renderTrail(
      traceVisitedBox,
      traceVisited,
      'No nodes visited yet.'
    );

    traceCount.textContent =
      `Target: ${traceTargets[traceCase]} · ` +
      `${traceVisited.length} visited`;

    traceHint.disabled = traceFinished;

    traceStackStatus.textContent = traceFinished
      ? 'Search complete'
      : `${waiting.length} waiting node` +
        (waiting.length === 1 ? '' : 's');

    traceStackList.replaceChildren();

    if (!waiting.length) {
      traceStackList.append(
        el(
          'p',
          'practice-muted',
          'The stack is empty.'
        )
      );
    }

    waiting.forEach((value, i) => {
      const row = el(
        'div',
        'practice-stack-row'
      );

      row.append(
        el('strong', '', String(value))
      );

      if (i === 0) {
        row.append(
          el(
            'span',
            'practice-stack-top',
            'TOP'
          )
        );
      }

      traceStackList.append(row);
    });
  }

  traceHint.addEventListener('click', () => {
    const top =
      traceStack[traceStack.length - 1];

    if (top) {
      say(
        traceCall,
        'Hint: LIFO',
        `The most recently pushed node is ` +
        `${top.value}. Find it on the tree.`
      );
    }
  });

  traceRestart.addEventListener(
    'click',
    resetTrace
  );

  /* ==========================================
     TAB 3 — THREE TRAVERSAL TASKS
     ========================================== */

  let seqIndex = 0;

  const seqSolved = new Set();

  const seqRoots = SEQUENCES.map(
    task => fromValues(task.values)
  );

  const seqButtons = el(
    'div',
    'practice-subtabs'
  );

  const seqTaskButtons = SEQUENCES.map(
    (task, i) => {
      const b = button(
        task.label,
        'practice-subtab'
      );

      b.addEventListener('click', () => {
        seqIndex = i;
        loadSequence();
      });

      seqButtons.append(b);

      return b;
    }
  );

  const seqLayout = el(
    'div',
    'practice-layout'
  );

  const seqLeft = el(
    'article',
    'practice-card'
  );

  const seqView = makeTreeFrame([
    ['Not chosen', 'normal'],
    ['Draft (unchecked)', 'draft'],
    ['Correctly completed', 'visited']
  ]);

  const seqTreeTitle = el(
    'h2',
    '',
    'Build the traversal sequence'
  );

  const seqTrail = el(
    'div',
    'practice-trail'
  );

  seqLeft.append(
    seqTreeTitle,
    el(
      'p',
      'practice-muted',
      'Click the nodes to add values, or type ' +
      'the sequence on the right. Check your ' +
      'answer when ready.'
    ),
    seqView.frame,
    el(
      'strong',
      'practice-small-heading',
      'Your draft sequence'
    ),
    seqTrail
  );

  const seqRight = el(
    'article',
    'practice-card practice-task'
  );

  const seqRule = el(
    'p',
    'practice-rule'
  );

  const seqForm = el(
    'form',
    'practice-form'
  );

  const seqLabel = el(
    'label',
    '',
    'Node values in visiting order'
  );

  const seqInput = el('input');

  seqInput.type = 'text';
  seqInput.id = 'practice-sequence-input';
  seqLabel.htmlFor = seqInput.id;
  seqInput.placeholder = 'e.g. 12, 30, 48, ...';
  seqInput.autocomplete = 'off';

  const seqCheck = button(
    'Check sequence',
    'practice-btn practice-primary'
  );

  seqCheck.type = 'submit';

  seqForm.append(
    seqLabel,
    seqInput,
    seqCheck
  );

  const seqCall = callout(
    'Solve the traversal',
    'Use the visiting order you learned ' +
    'in DFS Introduction.'
  );

  const seqHint = button('Hint');
  const seqUndo = button('Undo last');
  const seqClear = button('Clear draft');

  const seqNext = button(
    'Next task →',
    'practice-btn practice-primary'
  );

  const seqActions = el(
    'div',
    'practice-actions'
  );

  seqActions.append(
    seqHint,
    seqUndo,
    seqClear,
    seqNext
  );

  seqRight.append(
    el(
      'span',
      'practice-eyebrow',
      'INDEPENDENT PRACTICE'
    ),
    el('h2', '', 'Write the visit order'),
    seqRule,
    seqForm,
    seqCall.box,
    seqActions
  );

  seqLayout.append(
    seqLeft,
    seqRight
  );

  panels[2].append(
    seqButtons,
    seqLayout
  );

  function currentExpected() {
    return traversal(
      seqRoots[seqIndex],
      SEQUENCES[seqIndex].type
    );
  }

  function showSequenceTree() {
    const words = parseSequence(
      seqInput.value
    );

    const draft = words || [];

    const solved = seqSolved.has(
      seqIndex
    );

    paint(
      seqView,
      seqRoots[seqIndex],
      {
        visited: solved
          ? currentExpected()
          : [],
        draft: solved
          ? []
          : draft
      },
      n => {
        if (seqSolved.has(seqIndex)) return;

        const current = parseSequence(
          seqInput.value
        );

        if (current === null) {
          say(
            seqCall,
            'Check the draft',
            'Enter only whole numbers separated ' +
            'by commas or spaces.',
            'review'
          );

          return;
        }

        if (current.includes(n.value)) {
          say(
            seqCall,
            'Already included',
            `Node ${n.value} is already in your ` +
            'draft. Each node is visited once.',
            'review'
          );

          return;
        }

        current.push(n.value);

        seqInput.value = current.join(', ');

        showSequenceTree();

        say(
          seqCall,
          'Added to draft',
          `Node ${n.value} is at position ` +
          `${current.length}. Check your full ` +
          'sequence when ready.'
        );
      }
    );

    renderTrail(
      seqTrail,
      solved ? currentExpected() : draft,
      'Click nodes or type a sequence.'
    );
  }

  function loadSequence() {
    const task = SEQUENCES[seqIndex];

    seqTaskButtons.forEach((b, i) => {
      b.setAttribute(
        'aria-pressed',
        String(i === seqIndex)
      );

      b.classList.toggle(
        'is-done',
        seqSolved.has(i)
      );
    });

    seqRule.textContent =
      `${task.label}: ${RULES[task.type]}`;

    seqInput.value =
      seqSolved.has(seqIndex)
        ? currentExpected().join(', ')
        : '';

    seqCheck.disabled =
      seqSolved.has(seqIndex);

    seqHint.disabled =
      seqSolved.has(seqIndex);

    seqNext.hidden =
      seqIndex === SEQUENCES.length - 1;

    seqNext.disabled =
      !seqSolved.has(seqIndex);

    showSequenceTree();

    say(
      seqCall,
      seqSolved.has(seqIndex)
        ? 'Task completed!'
        : 'Your challenge',
      seqSolved.has(seqIndex)
        ? 'You solved this traversal. Choose ' +
          'a different task to practise more.'
        : `Use ${RULES[task.type]}. Each node ` +
          'must appear exactly once.'
    );
  }

  seqInput.addEventListener(
    'input',
    showSequenceTree
  );

  seqForm.addEventListener('submit', event => {
    event.preventDefault();

    if (seqSolved.has(seqIndex)) return;

    const answer = parseSequence(
      seqInput.value
    );

    const expected = currentExpected();

    if (!answer) {
      say(
        seqCall,
        'Use whole numbers',
        'Separate each value with a comma ' +
        'or space. Do not include letters.',
        'review'
      );

      return;
    }

    if (answer.length !== expected.length) {
      say(
        seqCall,
        'Check the number of visits',
        `This tree has ${expected.length} nodes, ` +
        `but you entered ${answer.length}. ` +
        'Visit every node exactly once.',
        'review'
      );

      return;
    }

    const wrong = answer.findIndex(
      (value, index) =>
        value !== expected[index]
    );

    if (wrong !== -1) {
      say(
        seqCall,
        'Review the sequence',
        `Position ${wrong + 1} is not correct. ` +
        `Recheck ${
          RULES[SEQUENCES[seqIndex].type]
        } and try again.`,
        'review'
      );

      return;
    }

    seqSolved.add(seqIndex);

    if (
      seqSolved.size === SEQUENCES.length
    ) {
      markDone('sequence');
    }

    loadSequence();

    say(
      seqCall,
      'Correct traversal!',
      `${expected.join(' → ')}. You applied ` +
      'the rule correctly.',
      'correct'
    );
  });

  seqHint.addEventListener('click', () => {
    const task = SEQUENCES[seqIndex];
    const root = seqRoots[seqIndex];

    const hint = task.type === 'pre'
      ? `Start at the root ${root.value}, ` +
        'then finish its left subtree before ' +
        'the right.'
      : task.type === 'in'
        ? 'Start at the leftmost leaf. ' +
          'In a BST, in-order gives ascending values.'
        : 'Visit both subtrees before their ' +
          `parent. The final node must be ` +
          `the root ${root.value}.`;

    say(
      seqCall,
      'Hint',
      hint
    );
  });

  seqUndo.addEventListener('click', () => {
    if (seqSolved.has(seqIndex)) return;

    const values = parseSequence(
      seqInput.value
    );

    if (!values) return;

    values.pop();

    seqInput.value = values.join(', ');

    showSequenceTree();
  });

  seqClear.addEventListener('click', () => {
    if (seqSolved.has(seqIndex)) return;

    seqInput.value = '';

    showSequenceTree();

    say(
      seqCall,
      'Draft cleared',
      'Start your traversal again.'
    );
  });

  seqNext.addEventListener('click', () => {
    if (
      !seqSolved.has(seqIndex) ||
      seqIndex >= SEQUENCES.length - 1
    ) return;

    seqIndex++;

    loadSequence();
  });

  /* ==========================================
     PAGE NAVIGATION
     ========================================== */

  const navigation = el(
    'nav',
    'practice-navigation'
  );

  const back = el(
    'a',
    'practice-btn',
    '← Explorer'
  );

  back.href = '#/worked-example';

  const forward = el(
    'a',
    'practice-btn practice-primary',
    'Next: Quiz →'
  );

  forward.href = '#/quiz';

  navigation.append(back, forward);

  page.append(
    title,
    tabBar,
    ...panels,
    navigation
  );

  container.replaceChildren(page);

  loadRepair();
  resetTrace();
  loadSequence();
  goTab(0);

  return () => {};
}
