/**
 * COS212 DFS Tutor — DFS Introduction
 * Figma Page 3
 *
 * Four short tabs (one visible at a time, so the page stays short):
 * 1 Meet DFS            definition + how the ideas connect
 * 2 Traversal types     pre-order / in-order / post-order with a side tree
 * 3 Watch the stack     predict, reveal, and watch the stack change
 * 4 Check               three short questions
 *
 * Uses iterative, left-first DFS. No backend changes required.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const ROOT = 50;

const TREE = [
  { value: 50, x: 300, y: 55, left: 30, right: 70 },
  { value: 30, x: 155, y: 160, left: 20, right: 40 },
  { value: 70, x: 445, y: 160, left: 60, right: 80 },
  { value: 20, x: 75, y: 275, left: null, right: null },
  { value: 40, x: 235, y: 275, left: null, right: null },
  { value: 60, x: 365, y: 275, left: null, right: null },
  { value: 80, x: 525, y: 275, left: null, right: null }
];

const NODE_MAP = new Map(TREE.map(node => [node.value, node]));

function el(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function svgEl(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  return element;
}

/* ==========================================
   CONTENT
   ========================================== */

// Recursive traversal of the example tree.
function walk(order, value = ROOT, out = []) {
  if (value === null) return out;

  const node = NODE_MAP.get(value);

  if (order === 'pre') out.push(value);
  walk(order, node.left, out);
  if (order === 'in') out.push(value);
  walk(order, node.right, out);
  if (order === 'post') out.push(value);

  return out;
}

const TRAVERSALS = {
  pre: {
    name: 'Pre-order',
    rule: ['Root', 'Left', 'Right'],
    summary:
      'Visit the root node first, then recursively explore the ' +
      'left and right subtrees.',
    use:
      'Parents come before their children, which is handy for ' +
      'copying a tree.',
    start: 'Start at the root (50) and visit it straight away.',
    order: walk('pre')
  },
  in: {
    name: 'In-order',
    rule: ['Left', 'Root', 'Right'],
    summary:
      'Explore the left subtree first, then visit the root, and ' +
      'finally the right subtree.',
    use:
      'On a binary search tree this lists the values from smallest ' +
      'to largest.',
    start:
      'Start at the root (50), but keep going left until a node has ' +
      'no left child.',
    order: walk('in')
  },
  post: {
    name: 'Post-order',
    rule: ['Left', 'Right', 'Root'],
    summary:
      'Explore the left and right subtrees first, then visit the ' +
      'root node.',
    use:
      'Children come before their parent, which is handy when ' +
      'deleting a tree.',
    start:
      'Start at the root (50), but go down to the leftmost leaf ' +
      'before visiting anything.',
    order: walk('post')
  }
};

const TERMS = {
  Tree:
    'A set of connected nodes with no cycles. It starts from one ' +
    'top node.',
  Root:
    'The top node where the tree starts. In our example the root ' +
    'is 50.',
  Subtree:
    'A node together with all of its descendants. Each child of ' +
    'the root begins its own subtree.',
  DFS:
    'Depth-First Search explores all the nodes by going as deep as ' +
    'possible along each branch before moving to the next one.',
  Stack:
    'A list where the last item added is the first one removed ' +
    '(Last In, First Out). DFS uses it to remember waiting nodes.',
  Backtracking:
    'Returning to the most recent waiting node when a path has no ' +
    'more nodes to explore.',
  Traversal:
    'Visiting every node of a tree in a chosen order.',
  'Pre-order': 'Root first, then the left subtree, then the right subtree.',
  'In-order': 'Left subtree first, then the root, then the right subtree.',
  'Post-order': 'Left subtree, right subtree, and the root last.'
};

// [source, relationship, target]
const RELATIONS = [
  ['Tree', 'has a', 'Root'],
  ['Tree', 'contains', 'Subtree'],
  ['Subtree', 'has its own', 'Root'],
  ['DFS', 'explores a', 'Tree'],
  ['DFS', 'starts at the', 'Root'],
  ['DFS', 'remembers waiting nodes with a', 'Stack'],
  ['DFS', 'performs a', 'Traversal'],
  ['DFS', 'relies on', 'Backtracking'],
  ['Stack', 'makes possible', 'Backtracking'],
  ['Pre-order', 'is a type of', 'Traversal'],
  ['In-order', 'is a type of', 'Traversal'],
  ['Post-order', 'is a type of', 'Traversal'],
  ['Pre-order', 'visits the Root before each', 'Subtree'],
  ['In-order', 'visits the Root between its two', 'Subtree'],
  ['Post-order', 'visits the Root after each', 'Subtree']
];

/* ==========================================
   STACK-BASED DFS STEPS (pre-order)
   ========================================== */

function createDfsSteps() {
  const stack = [ROOT];
  const visited = [];

  const steps = [{
    current: null,
    visited: [],
    stack: [ROOT],
    explanation:
      'Node 50 is waiting on the stack. The last item added to a ' +
      'stack is the first one removed.'
  }];

  const explanationByNode = {
    50: 'Visit 50. Push 70, then 30. Because 30 was pushed last, it is next.',
    30: 'Visit 30. Push 40, then 20. The next node is 20.',
    20: 'Visit 20. It has no children, so take the next node from the stack.',
    40: 'Visit 40. This branch is finished (backtrack). Node 70 is still waiting.',
    70: 'Visit 70. Push 80, then 60. Node 60 will be visited before 80.',
    60: 'Visit 60. It has no children. Node 80 is still waiting.',
    80: 'Visit 80. The stack is empty, so every node has been visited.'
  };

  while (stack.length > 0) {
    const value = stack.pop();
    const node = NODE_MAP.get(value);

    visited.push(value);

    // Push right first so the left child is removed first.
    if (node.right !== null) stack.push(node.right);
    if (node.left !== null) stack.push(node.left);

    steps.push({
      current: value,
      visited: [...visited],
      stack: [...stack].reverse(),
      explanation: explanationByNode[value]
    });
  }

  return steps;
}

const DFS_STEPS = createDfsSteps();

/* ==========================================
   TREE DRAWING
   ========================================== */

function createTreeSvg(label) {
  const svg = svgEl('svg', {
    class: 'dfs-lesson-svg',
    viewBox: '0 0 600 335',
    role: 'img',
    'aria-label': label
  });

  TREE.forEach(node => {
    [node.left, node.right].forEach(childValue => {
      if (childValue === null) return;

      const child = NODE_MAP.get(childValue);

      svg.appendChild(svgEl('line', {
        x1: node.x,
        y1: node.y,
        x2: child.x,
        y2: child.y,
        class: 'dfs-lesson-edge'
      }));
    });
  });

  TREE.forEach(node => {
    const group = svgEl('g', {
      class: 'dfs-lesson-node',
      'data-node': node.value
    });

    const circle = svgEl('circle', { cx: node.x, cy: node.y, r: 28 });

    const value = svgEl('text', {
      x: node.x,
      y: node.y,
      class: 'dfs-lesson-value'
    });
    value.textContent = String(node.value);

    // Text label, so state is never shown by colour alone.
    const stateLabel = svgEl('text', {
      x: node.x,
      y: node.y + 45,
      class: 'dfs-lesson-node-state'
    });

    group.append(circle, value, stateLabel);
    svg.appendChild(group);
  });

  return svg;
}

function paintTree(svg, { current, visited, pending = [] }) {
  svg.querySelectorAll('.dfs-lesson-node').forEach(group => {
    const value = Number(group.dataset.node);

    group.classList.remove('is-current', 'is-visited', 'is-pending');

    let label = '';
    let description = 'Not visited';

    if (value === current) {
      group.classList.add('is-current');
      label = 'NOW';
      description = 'Currently being visited';
    } else if (visited.includes(value)) {
      group.classList.add('is-visited');
      label = `#${visited.indexOf(value) + 1}`;
      description = `Visited number ${visited.indexOf(value) + 1}`;
    } else if (pending.includes(value)) {
      group.classList.add('is-pending');
      label = 'WAIT';
      description = 'Waiting on the stack';
    }

    group.querySelector('.dfs-lesson-node-state').textContent = label;
    group.setAttribute('aria-label', `Node ${value}. ${description}.`);
  });
}

/* ==========================================
   MAIN PAGE
   ========================================== */

export function render(screen, container) {
  const page = el('div', 'dfs-lesson-page');

  const reduceMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let activeTab = 0;
  let stepIndex = 0;
  let predictionChoice = null;
  let travType = 'pre';
  let travStep = 0;
  let travTimer = null;

  const milestones = new Set();
  const seenTypes = new Set();
  const viewedTerms = new Set();

  // ------------------------------------------
  // HEADER HEIGHT (for sticky offsets)
  // ------------------------------------------

  const appHeader = document.querySelector('.app-header');
  let headerObserver = null;

  function updateHeaderHeight() {
    if (!appHeader) return;

    document.documentElement.style.setProperty(
      '--app-header-height',
      `${Math.ceil(appHeader.getBoundingClientRect().height)}px`
    );
  }

  updateHeaderHeight();

  if (appHeader && typeof ResizeObserver !== 'undefined') {
    headerObserver = new ResizeObserver(updateHeaderHeight);
    headerObserver.observe(appHeader);
  }

  // ==========================================
  // PAGE TITLE
  // ==========================================

  const title = el('header', 'dfs-title');

  title.append(
    el('h1', '', 'Introduction to Depth-First Search'),
    el(
      'p',
      'dfs-lesson-muted',
      'Four short steps, about 10 minutes. Nothing here is marked.'
    )
  );

  // ==========================================
  // STICKY PROGRESS
  // ==========================================

  const progress = el('div', 'lesson-progress');
  const progressHeader = el('div', 'lesson-progress__header');
  const progressLabel = el('span', '', 'Step 0 of 4');

  progressHeader.append(
    el('strong', '', 'DEPTH-FIRST SEARCH'),
    progressLabel
  );

  const progressTrack = el('div', 'lesson-progress__track');
  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-label', 'DFS lesson progress');
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '4');
  progressTrack.setAttribute('aria-valuenow', '0');

  const progressFill = el('div', 'lesson-progress__fill');
  progressFill.style.width = '0%';

  progressTrack.appendChild(progressFill);
  progress.append(progressHeader, progressTrack);

  // ==========================================
  // TABS
  // ==========================================

  const tabDefs = [
    { id: 'meet', label: 'Meet DFS' },
    { id: 'types', label: 'Traversal types' },
    { id: 'stack', label: 'Watch the stack' },
    { id: 'check', label: 'Check' }
  ];

  const tabList = el('div', 'dfs-tabs');
  tabList.setAttribute('role', 'tablist');
  tabList.setAttribute('aria-label', 'DFS lesson steps');

  const tabButtons = tabDefs.map((def, index) => {
    const button = el('button', 'dfs-tab');

    button.type = 'button';
    button.id = `dfs-tab-${def.id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `dfs-panel-${def.id}`);

    button.append(
      el('span', 'dfs-tab__number', String(index + 1)),
      document.createTextNode(def.label)
    );

    button.addEventListener('click', () => goTab(index, false));
    tabList.appendChild(button);

    return button;
  });

  tabList.addEventListener('keydown', event => {
    const current = tabButtons.indexOf(document.activeElement);
    if (current < 0) return;

    let next = null;

    if (event.key === 'ArrowRight') next = (current + 1) % tabButtons.length;
    if (event.key === 'ArrowLeft') {
      next = (current + tabButtons.length - 1) % tabButtons.length;
    }
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabButtons.length - 1;

    if (next !== null) {
      event.preventDefault();
      goTab(next, false);
      tabButtons[next].focus();
    }
  });

  function markComplete(id) {
    if (milestones.has(id)) return;

    milestones.add(id);

    const count = milestones.size;

    progressLabel.textContent = `Step ${count} of 4`;
    progressFill.style.width = `${count * 25}%`;
    progressTrack.setAttribute('aria-valuenow', String(count));

    tabButtons.forEach((button, index) => {
      button.classList.toggle('is-done', milestones.has(tabDefs[index].id));
    });
  }

  function makePanel(id) {
    const panel = el('section', 'dfs-panel');

    panel.id = `dfs-panel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `dfs-tab-${id}`);
    panel.tabIndex = -1;

    return panel;
  }

  const panels = tabDefs.map(def => makePanel(def.id));

  // ==========================================
  // TAB 1 — MEET DFS
  // ==========================================

  const meetGrid = el('div', 'dfs-grid');

  // Definition card
  const definition = el('article', 'dfs-lesson-card');

  definition.append(
    el('span', 'dfs-lesson-eyebrow', 'WHAT IS DFS?'),
    el('h2', '', 'Depth-First Search (DFS)'),
    el(
      'p',
      'dfs-lesson-lead',
      'Depth-First Search (DFS) is a method used to explore all the ' +
      'nodes in a tree by going as deep as possible along each branch ' +
      'before moving to the next one. It starts at the root node and ' +
      'visits every node in the tree.'
    ),
    el(
      'p',
      'dfs-lesson-muted',
      'DFS can be classified into three main types, based on the ' +
      'order in which the nodes are visited. Select one to see it ' +
      'on the tree:'
    )
  );

  const typeLinks = el('div', 'dfs-type-links');

  Object.entries(TRAVERSALS).forEach(([key, info]) => {
    const link = el('button', 'dfs-type-link');

    link.type = 'button';
    link.append(
      el('strong', '', info.name),
      el('span', '', info.rule.join(' → ')),
      el('span', 'dfs-type-link__summary', info.summary)
    );

    link.addEventListener('click', () => {
      travType = key;
      updateTraversalType();
      goTab(1, true);
    });

    typeLinks.appendChild(link);
  });

  const ideas = el('ol', 'dfs-ideas');

  [
    'Start at the root.',
    'Use a stack to remember waiting nodes.',
    'Go deep along one branch.',
    'Backtrack when a branch ends.'
  ].forEach(text => ideas.appendChild(el('li', '', text)));

  const prerequisite = el('p', 'dfs-prerequisite');
  const bstLink = el('a', '', 'Review BST basics →');
  bstLink.href = '#/concept-bst';

  prerequisite.append(
    document.createTextNode('New to roots and subtrees? '),
    bstLink
  );

  definition.append(
    typeLinks,
    el('h3', 'dfs-small-heading', 'The four ideas behind DFS'),
    ideas,
    prerequisite
  );

  // Concept explorer card
  const connect = el('article', 'dfs-lesson-card dfs-connect');

  connect.append(
    el('span', 'dfs-lesson-eyebrow', 'HOW THE IDEAS CONNECT'),
    el('h2', '', 'Pick a term'),
    el(
      'p',
      'dfs-lesson-muted',
      'Select a term to see what it means and how it relates to ' +
      'the others. Select the linked terms to follow the connections.'
    )
  );

  const termChips = el('div', 'dfs-term-chips');

  const termTitle = el('h3', 'dfs-term-title', 'Choose a term to begin');
  termTitle.tabIndex = -1;

  const termDefinition = el('p', 'dfs-term-definition');
  const termRelations = el('ul', 'dfs-term-relations');

  const termDetail = el('div', 'dfs-term-detail');
  termDetail.setAttribute('aria-live', 'polite');
  termDetail.append(termTitle, termDefinition, termRelations);

  function showTerm(name, fromLink = false) {
    viewedTerms.add(name);

    termChips.querySelectorAll('button').forEach(chip => {
      chip.setAttribute('aria-pressed', String(chip.dataset.term === name));
    });

    termTitle.textContent = name;
    termDefinition.textContent = TERMS[name];
    termRelations.replaceChildren();

    RELATIONS
      .filter(([from, , to]) => from === name || to === name)
      .forEach(([from, verb, to]) => {
        const item = el('li');

        const part = term => {
          if (term === name) return el('strong', '', term);

          const link = el('button', 'dfs-term-link', term);
          link.type = 'button';
          link.addEventListener('click', () => showTerm(term, true));
          return link;
        };

        item.append(part(from), document.createTextNode(` ${verb} `), part(to));
        termRelations.appendChild(item);
      });

    if (fromLink) termTitle.focus();

    if (viewedTerms.size >= 4) markComplete('meet');
  }

  Object.keys(TERMS).forEach(name => {
    const chip = el('button', 'dfs-term-chip', name);

    chip.type = 'button';
    chip.dataset.term = name;
    chip.setAttribute('aria-pressed', 'false');
    chip.addEventListener('click', () => showTerm(name));

    termChips.appendChild(chip);
  });

  connect.append(termChips, termDetail);
  meetGrid.append(definition, connect);
  panels[0].appendChild(meetGrid);

  // ==========================================
  // TAB 2 — TRAVERSAL TYPES
  // ==========================================

  const typesGrid = el('div', 'dfs-grid');

  const typesInfo = el('article', 'dfs-lesson-card');

  typesInfo.append(
    el('span', 'dfs-lesson-eyebrow', 'THREE WAYS TO TRAVERSE'),
    el('h2', '', 'Same tree, three orders')
  );

  const segmented = el('div', 'dfs-segmented');
  segmented.setAttribute('role', 'group');
  segmented.setAttribute('aria-label', 'Choose a traversal type');

  const segmentButtons = Object.entries(TRAVERSALS).map(([key, info]) => {
    const button = el('button', 'dfs-segment', info.name);

    button.type = 'button';
    button.dataset.type = key;
    button.addEventListener('click', () => {
      travType = key;
      updateTraversalType();
    });

    segmented.appendChild(button);
    return button;
  });

  const ruleRow = el('div', 'dfs-rule');
  ruleRow.setAttribute('aria-label', 'Visiting rule');

  const travSummary = el('p', 'dfs-lesson-lead');
  const travUse = el('p', 'dfs-use');

  const compare = el('div', 'dfs-compare');

  compare.appendChild(el('strong', 'dfs-compare__title', 'Order for this tree'));

  const compareRows = {};

  Object.entries(TRAVERSALS).forEach(([key, info]) => {
    const row = el('div', 'dfs-compare__row');

    row.append(
      el('span', 'dfs-compare__name', info.name),
      el('span', 'dfs-compare__order', info.order.join(' → '))
    );

    compareRows[key] = row;
    compare.appendChild(row);
  });

  // A direct comparison of all three orders together, instead of
  // leaving the learner to click between them and remember the
  // differences unaided.
  const relate = el('div', 'dfs-compare dfs-relate');

  relate.append(
    el('strong', 'dfs-compare__title', 'How the three orders relate'),
    el(
      'p',
      'dfs-relate__text',
      'All three visit the same left subtree before the right ' +
      'subtree - that part never changes. The only thing that ' +
      'differs between them is when the root itself gets visited.'
    ),
    el(
      'p',
      'dfs-relate__text',
      'Pre-order visits the root before its subtrees (root first). ' +
      'In-order visits it between them (root in the middle)  - on a ' +
      'BST that is exactly what produces the values in sorted ' +
      'order. Post-order visits it after both subtrees (root last).'
    )
  );

  const travCaption = el('div', 'dfs-step-explanation');
  travCaption.setAttribute('aria-live', 'polite');

  const travCaptionHeading = el('strong', 'dfs-step-explanation__heading');
  const travCaptionText = el('p', 'dfs-step-explanation__message');

  travCaption.append(travCaptionHeading, travCaptionText);

  typesInfo.append(
    segmented,
    ruleRow,
    travSummary,
    travUse,
    compare,
    relate,
    travCaption
  );

  // Side tree
  const typesTree = el('article', 'dfs-lesson-card dfs-tree-card');

  const travSvg = createTreeSvg(
    'The example tree. The traversal order is shown beneath each node.'
  );

  const travViewport = el('div', 'dfs-tree-viewport');
  travViewport.appendChild(travSvg);

  const travOrderList = el('div', 'dfs-visited-list');

  const travControls = el('div', 'dfs-lesson-controls');

  const travPrev = el('button', 'btn', '← Previous');
  const travNext = el('button', 'btn btn--primary', 'Next →');
  const travPlay = el('button', 'btn', 'Play');
  const travRestart = el('button', 'btn', 'Restart');
  const travCounter = el('span', 'dfs-step-counter');

  [travPrev, travNext, travPlay, travRestart].forEach(b => (b.type = 'button'));

  travControls.append(travPrev, travNext, travPlay, travRestart, travCounter);

  const legend = el('div', 'dfs-lesson-legend');

  [
    ['○', 'Not visited', 'default'],
    ['●', 'Current node', 'current'],
    ['#', 'Visited (number = order)', 'visited'],
    ['◌', 'On stack', 'pending']
  ].forEach(([symbol, label, type]) => {
    const item = el('span', 'dfs-legend-item');

    item.append(
      el('span', `dfs-legend-symbol dfs-legend-symbol--${type}`, symbol),
      document.createTextNode(label)
    );

    legend.appendChild(item);
  });

  typesTree.append(
    el('h3', '', 'Follow the order'),
    travViewport,
    el('strong', 'dfs-order-title', 'Visited so far'),
    travOrderList,
    travControls
  );

  typesGrid.append(typesInfo, typesTree);
  panels[1].appendChild(typesGrid);

  function stopTravPlayback() {
    if (travTimer !== null) {
      clearInterval(travTimer);
      travTimer = null;
    }

    travPlay.textContent = 'Play';
  }

  function travReason(type, value) {
    const node = NODE_MAP.get(value);

    if (node.left === null && node.right === null) {
      return 'it is a leaf with no subtrees, so visit it now.';
    }

    if (type === 'pre') return 'visit it before exploring its subtrees.';
    if (type === 'in') {
      return 'its left subtree is finished, so visit it before the right subtree.';
    }

    return 'both of its subtrees are finished, so visit it last.';
  }

  function updateTraversal() {
    const info = TRAVERSALS[travType];
    const order = info.order;
    const visited = order.slice(0, travStep);
    const current = travStep > 0 ? order[travStep - 1] : null;

    paintTree(travSvg, { current, visited });

    travOrderList.replaceChildren();

    if (visited.length === 0) {
      travOrderList.appendChild(
        el('span', 'dfs-visit-empty', 'No nodes visited yet')
      );
    } else {
      visited.forEach((value, index) => {
        travOrderList.appendChild(el('span', 'dfs-visit-chip', String(value)));

        if (index < visited.length - 1) {
          travOrderList.appendChild(el('span', 'dfs-visit-arrow', '→'));
        }
      });
    }

    if (travStep === 0) {
      travCaptionHeading.textContent = `${info.name}: ready`;
      travCaptionText.textContent = `${info.start} Press Next to begin.`;
    } else {
      const value = order[travStep - 1];
      const done = travStep === order.length;

      travCaptionHeading.textContent = done
        ? `${info.name} complete!`
        : `Step ${travStep}: visit ${value}`;

      travCaptionText.textContent =
        `Visit ${value}: ${travReason(travType, value)}` +
        (done ? ' Every node has now been visited once.' : '');
    }

    travCounter.textContent = `Step ${travStep} of ${order.length}`;
    travPrev.disabled = travStep === 0;
    travNext.disabled = travStep === order.length;

    if (travStep === order.length) {
      stopTravPlayback();
      seenTypes.add(travType);

      if (seenTypes.size === Object.keys(TRAVERSALS).length) {
        markComplete('types');
      }
    }
  }

  function updateTraversalType() {
    stopTravPlayback();
    travStep = 0;

    const info = TRAVERSALS[travType];

    segmentButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.type === travType));
    });

    ruleRow.replaceChildren();

    info.rule.forEach((part, index) => {
      const pill = el('span', 'dfs-rule__pill');

      if (part === 'Root') pill.classList.add('is-root');

      pill.append(
        el('span', 'dfs-rule__number', String(index + 1)),
        document.createTextNode(part)
      );

      ruleRow.appendChild(pill);

      if (index < info.rule.length - 1) {
        ruleRow.appendChild(el('span', 'dfs-rule__arrow', '→'));
      }
    });

    travSummary.textContent = info.summary;
    travUse.textContent = `Why it matters: ${info.use}`;

    Object.entries(compareRows).forEach(([key, row]) => {
      row.classList.toggle('is-active', key === travType);
    });

    updateTraversal();
  }

  travPrev.addEventListener('click', () => {
    stopTravPlayback();

    if (travStep > 0) {
      travStep -= 1;
      updateTraversal();
    }
  });

  travNext.addEventListener('click', () => {
    if (travStep < TRAVERSALS[travType].order.length) {
      travStep += 1;
      updateTraversal();
    }
  });

  travRestart.addEventListener('click', () => {
    stopTravPlayback();
    travStep = 0;
    updateTraversal();
  });

  travPlay.addEventListener('click', () => {
    if (travTimer !== null) {
      stopTravPlayback();
      return;
    }

    if (travStep === TRAVERSALS[travType].order.length) travStep = 0;

    travPlay.textContent = 'Pause';

    travTimer = setInterval(() => {
      if (travStep < TRAVERSALS[travType].order.length) {
        travStep += 1;
        updateTraversal();
      } else {
        stopTravPlayback();
      }
    }, 1100);

    travStep += 1;
    updateTraversal();
  });


const stackGrid = el('div', 'dfs-grid dfs-stack-grid');

// ==========================================
// LEFT — TREE CARD
// ==========================================

const stackTreeCard = el(
  'article',
  'dfs-lesson-card dfs-tree-card dfs-stack-tree-card'
);

const stackSvg = createTreeSvg(
  'Depth-First Search on a tree with seven nodes, using a stack'
);

const stackViewport = el('div', 'dfs-tree-viewport');
stackViewport.appendChild(stackSvg);

// Put the tree AND legend together in one frame.
const treeFrame = el('div', 'dfs-stack-tree-frame');

// The legend already exists earlier in your JS.
// Keep its symbols and colours.
treeFrame.append(
  stackViewport,
  legend
);

// Step explanation
const stepBox = el('div', 'dfs-step-explanation');
stepBox.setAttribute('aria-live', 'polite');

const stepHeading = el(
  'strong',
  'dfs-step-explanation__heading'
);

const stepMessage = el(
  'p',
  'dfs-step-explanation__message'
);

stepBox.append(stepHeading, stepMessage);

// Visited nodes
const visitedList = el('div', 'dfs-visited-list');

const visitedHeading = el(
  'strong',
  'dfs-order-title',
  'Visited so far'
);

// Algorithm below the tree
const code = el('details', 'dfs-code');
const pseudocode = el('pre', 'dfs-pseudocode');

pseudocode.textContent =
`stack = [root]

while stack is not empty:
    node = stack.pop()
    visit(node)

    if node.right exists:
        stack.push(node.right)

    if node.left exists:
        stack.push(node.left)`;

code.append(
  el('summary', '', 'See the algorithm(Code on DFS traverses a tree using a stack.)'),
  pseudocode
);

stackTreeCard.append(
  el('h3', '', 'Pre-order DFS with a stack'),
  treeFrame,
  stepBox,
  visitedHeading,
  visitedList,
  code
);

// ==========================================
// RIGHT — STACK FIRST
// ==========================================

const sideColumn = el('div', 'dfs-side-column');

// LIVE STACK
const stackCard = el(
  'article',
  'dfs-lesson-card dfs-stack-card'
);

stackCard.append(
  el('span', 'dfs-lesson-eyebrow', 'LIVE STACK'),
  el('h3', '', 'Stack (Last In, First Out)')
);

const stackStatus = el('div', 'dfs-stack-status');
const stackList = el('div', 'dfs-lesson-stack');

const stackNote = el(
  'p',
  'dfs-stack-note',
  'The top item is removed first, so we push the right ' +
  'child before the left. DFS explores the tree using ' +
  'the stack to remember which nodes are waiting.'
);

stackCard.append(
  stackStatus,
  stackList,
  stackNote
);

// ==========================================
// YOUR TURN — OPTIONAL
// ==========================================

const prediction = el(
  'article',
  'dfs-lesson-card dfs-prediction'
);

prediction.append(
  el('span', 'dfs-lesson-eyebrow', 'YOUR TURN · OPTIONAL'),
  el('h3', '', 'Which node will DFS visit next?'),
  el(
    'p',
    'dfs-lesson-muted',
    'Try predicting the next node, or reveal the next ' +
    'step to watch the traversal.'
  )
);

const predictionOptions = el(
  'div',
  'dfs-prediction__options'
);

const predictionFeedback = el(
  'p',
  'dfs-prediction__feedback'
);

predictionFeedback.setAttribute(
  'aria-live',
  'polite'
);

prediction.append(
  predictionOptions,
  predictionFeedback
);

// ==========================================
// STEP CONTROLS — DIRECTLY BELOW YOUR TURN
// ==========================================

const stackControls = el(
  'div',
  'dfs-lesson-controls'
);

const previousButton = el(
  'button',
  'btn',
  '← Previous'
);

const nextButton = el(
  'button',
  'btn btn--primary',
  'Reveal Next Step →'
);

const restartButton = el(
  'button',
  'btn',
  'Restart'
);

const counter = el(
  'span',
  'dfs-step-counter'
);

[
  previousButton,
  nextButton,
  restartButton
].forEach(button => {
  button.type = 'button';
});

stackControls.append(
  nextButton,
  previousButton,
  restartButton,
  counter
);

// Controls belong to the prediction card.
// They are no longer separated into another card.
prediction.appendChild(stackControls);

// ==========================================
// FINAL TAB 3 ARRANGEMENT
// ==========================================

sideColumn.append(
  stackCard,
  prediction
);

stackGrid.append(
  stackTreeCard,
  sideColumn
);

// Ties this tab back to the comparison in "Traversal types", so the
// stack reads as the mechanism behind that order, not a new topic.
const stackIntro = el('div', 'dfs-stack-intro');

stackIntro.append(
  el('span', 'dfs-lesson-eyebrow', 'HOW THE ORDER HAPPENS'),
  el('h2', '', 'The stack behind pre-order'),
  el(
    'p',
    'dfs-lesson-muted',
    'This is the mechanism that produced the pre-order sequence ' +
    `you saw in Traversal types: ${TRAVERSALS.pre.order.join(' → ')}. ` +
    'A stack is Last In, First Out, so pushing the right child ' +
    'before the left means the left child always comes off — and ' +
    'gets visited — first.'
  )
);

panels[2].append(stackIntro, stackGrid);


  function renderPrediction() {
    predictionOptions.replaceChildren();
    predictionFeedback.textContent = '';
    predictionFeedback.className = 'dfs-prediction__feedback';
    predictionChoice = null;

    const current = DFS_STEPS[stepIndex];
    const nextValue = current.stack[0];

    if (nextValue === undefined) {
      prediction.hidden = true;
      return;
    }

    prediction.hidden = false;

    const options = [
      nextValue,
      ...TREE.map(node => node.value)
        .filter(v => v !== nextValue && !current.visited.includes(v))
        .slice(0, 2)
    ];

    for (const node of TREE) {
      if (options.length >= 3) break;
      if (!options.includes(node.value)) options.push(node.value);
    }

    function choose(button, choice, message, correct) {
      predictionChoice = choice;

      predictionOptions.querySelectorAll('button').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });

      predictionFeedback.className =
        `dfs-prediction__feedback ${correct ? 'is-correct' : 'is-review'}`;
      predictionFeedback.textContent = message;

      updateControls();
    }

    options.forEach(value => {
      const button = el('button', 'dfs-prediction__option', String(value));

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        if (value === nextValue) {
          choose(button, value, `Correct! ${nextValue} is on top of the stack.`, true);
        } else {
          choose(
            button,
            value,
            'Good try. The last item pushed is removed first, so look at TOP.',
            false
          );
        }
      });

      predictionOptions.appendChild(button);
    });

    const unsure = el('button', 'dfs-prediction__option', 'Not sure');

    unsure.type = 'button';
    unsure.setAttribute('aria-pressed', 'false');

    unsure.addEventListener('click', () => {
      choose(
        unsure,
        'unsure',
        `The next node is ${nextValue}, because it is the top item on the stack.`,
        false
      );
    });

    predictionOptions.appendChild(unsure);
  }

  function updateStack(step) {
    stackList.replaceChildren();

    const count = step.stack.length;

    stackStatus.textContent = `${count} waiting node${count === 1 ? '' : 's'}`;

    if (count === 0) {
      stackList.appendChild(el('p', 'dfs-stack-empty', 'The stack is empty.'));
      return;
    }

    step.stack.forEach((value, index) => {
      const item = el('div', 'dfs-stack-item', String(value));

      if (index === 0) {
        item.classList.add('is-top');
        item.appendChild(el('span', 'dfs-stack-top-label', 'TOP'));
      }

      stackList.appendChild(item);
    });
  }

  function updateVisited(step) {
    visitedList.replaceChildren();

    if (step.visited.length === 0) {
      visitedList.appendChild(el('span', 'dfs-visit-empty', 'No nodes visited yet'));
      return;
    }

    step.visited.forEach((value, index) => {
      visitedList.appendChild(el('span', 'dfs-visit-chip', String(value)));

      if (index < step.visited.length - 1) {
        visitedList.appendChild(el('span', 'dfs-visit-arrow', '→'));
      }
    });
  }

  function updateControls() {
    const complete = stepIndex === DFS_STEPS.length - 1;

    previousButton.disabled = stepIndex === 0;
   // Prediction is optional.
nextButton.disabled = complete;
    nextButton.textContent = complete
      ? 'Traversal Complete ✓'
      : 'Reveal Next Step →';

    counter.textContent = `Step ${stepIndex} of ${DFS_STEPS.length - 1}`;
  }

  function updateWalkthrough() {
    const step = DFS_STEPS[stepIndex];

    paintTree(stackSvg, {
      current: step.current,
      visited: step.visited,
      pending: step.stack
    });

    updateStack(step);
    updateVisited(step);

    stepHeading.textContent =
      stepIndex === 0
        ? 'Ready to begin'
        : stepIndex === DFS_STEPS.length - 1
          ? 'Traversal complete!'
          : `Step ${stepIndex}: visit ${step.current}`;

    stepMessage.textContent = step.explanation;

    if (stepIndex === DFS_STEPS.length - 1) markComplete('stack');

    renderPrediction();
    updateControls();
  }


  previousButton.addEventListener('click', () => {
    if (stepIndex > 0) {
      stepIndex -= 1;
      updateWalkthrough();
    }
  });

 nextButton.addEventListener('click', () => {
  if (stepIndex < DFS_STEPS.length - 1) {
    stepIndex += 1;
    updateWalkthrough();
  }
});

  restartButton.addEventListener('click', () => {
    stepIndex = 0;
    updateWalkthrough();
  });

  // ==========================================
  // TAB 4 — CHECK
  // ==========================================

  const check = el('article', 'dfs-lesson-card');

  check.append(
    el('span', 'dfs-lesson-eyebrow', 'CHECK YOUR UNDERSTANDING'),
    el('h2', '', 'Ready to explore DFS?'),
    el(
      'p',
      'dfs-lesson-muted',
      'Three short questions. Use the hints and try again as often as you like.'
    )
  );

  const checkQuestions = [
    {
      id: 'stack',
      prompt: 'A stack holds 70, then 30 on top. Which node is removed first?',
      options: ['70', '30', 'Both at once', 'Not sure'],
      correct: '30',
      hint: 'A stack is Last In, First Out. Look at the top item.',
      explanation: 'Correct! Node 30 is on top, so it is removed first.'
    },
    {
      id: 'order',
      prompt: 'In pre-order on our tree, which node is visited right after 30?',
      options: ['70', '40', '20', 'Not sure'],
      correct: '20',
      hint:
        'Pre-order visits the root, then the left subtree. The left child ' +
        'of 30 is next.',
      explanation: 'Correct! 20 is the left child of 30, and the left side goes first.'
    },
    {
      id: 'inorder',
      prompt: 'Which traversal lists the values of a BST from smallest to largest?',
      options: ['Pre-order', 'In-order', 'Post-order', 'Not sure'],
      correct: 'In-order',
      hint:
        'In-order visits the left subtree, then the root, then the right ' +
        'subtree. In a BST, smaller values are on the left.',
      explanation:
        'Correct! In-order visits smaller values (left), then the root, ' +
        'then larger values (right).'
    }
  ];

  const checkCorrect = new Set();
  const checkGrid = el('div', 'dfs-check__grid');

  const finalResult = el('div', 'dfs-check__result');
  finalResult.hidden = true;
  finalResult.setAttribute('aria-live', 'polite');

  checkQuestions.forEach((question, index) => {
    const card = el('div', 'dfs-check__question');

    card.appendChild(el('h3', '', `${index + 1}. ${question.prompt}`));

    const options = el('div', 'dfs-check__options');
    const feedback = el('p', 'dfs-check__feedback');
    feedback.setAttribute('aria-live', 'polite');

    question.options.forEach(answer => {
      const button = el('button', 'dfs-check__option', answer);

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        options.querySelectorAll('button').forEach(other => {
          other.setAttribute('aria-pressed', String(other === button));
        });

        if (answer === question.correct) {
          checkCorrect.add(question.id);
          feedback.className = 'dfs-check__feedback is-correct';
          feedback.textContent = question.explanation;
        } else {
          checkCorrect.delete(question.id);
          feedback.className = 'dfs-check__feedback is-review';
          feedback.textContent =
            answer === 'Not sure'
              ? `That's okay. ${question.hint}`
              : `Not quite. ${question.hint} Try again.`;
        }

        if (checkCorrect.size === checkQuestions.length) {
          finalResult.hidden = false;
          finalResult.textContent =
            "You're ready to explore DFS! You know how the stack works and " +
            'how the three traversal orders differ.';

          markComplete('check');
        } else {
          finalResult.hidden = true;
        }
      });

      options.appendChild(button);
    });

    card.append(options, feedback);
    checkGrid.appendChild(card);
  });

  check.append(checkGrid, finalResult);
  panels[3].appendChild(check);

  // ==========================================
  // BOTTOM NAVIGATION
  // ==========================================

  const navigation = el('nav', 'dfs-page-navigation');
  navigation.setAttribute('aria-label', 'DFS lesson navigation');

  const backToBst = el('a', 'dfs-nav dfs-nav--back', '← BST Basics');
  backToBst.href = '#/concept-bst';

  const backButton = el('button', 'dfs-nav dfs-nav--back', '← Back');
  backButton.type = 'button';
  backButton.addEventListener('click', () => goTab(activeTab - 1, true));

  const nextTabButton = el('button', 'dfs-nav dfs-nav--next', 'Next →');
  nextTabButton.type = 'button';
  nextTabButton.addEventListener('click', () => goTab(activeTab + 1, true));

  const toExplorer = el('a', 'dfs-nav dfs-nav--next', 'Next: DFS Explorer →');
  toExplorer.href = '#/worked-example';

  navigation.append(backToBst, backButton, nextTabButton, toExplorer);

  function goTab(index, scroll) {
    if (index < 0 || index >= panels.length) return;

    if (activeTab === 1 && index !== 1) stopTravPlayback();

    activeTab = index;

    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });

    tabButtons.forEach((button, i) => {
      const selected = i === index;

      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });

    const first = index === 0;
    const last = index === panels.length - 1;

    backToBst.hidden = !first;
    backButton.hidden = first;
    nextTabButton.hidden = last;
    toExplorer.hidden = !last;

    if (scroll) {
      tabList.scrollIntoView({
        behavior: reduceMotion() ? 'auto' : 'smooth',
        block: 'start'
      });

      panels[index].focus({ preventScroll: true });
    }
  }

  // ==========================================
  // ASSEMBLE PAGE
  // ==========================================

  page.append(title, progress, tabList, ...panels, navigation);
  container.appendChild(page);

  updateTraversalType();
  updateWalkthrough();
  goTab(0, false);

  // Cleanup when leaving this screen.
  return () => {
    stopTravPlayback();
    headerObserver?.disconnect();
  };
}
