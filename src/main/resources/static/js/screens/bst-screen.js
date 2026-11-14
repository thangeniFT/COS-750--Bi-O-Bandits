/**
 * COS212 DFS Tutor — BST Introduction (v3)
 *
 * 01 Warm-up
 * 02 Vocabulary          (every word is defined BEFORE it is used)
 * 03 Definition + rules  (formal definition, unique keys, left/right rule, clues)
 * 04 Try insertion       (comparison signs drawn on the tree, highlighted caption)
 * 05 Check               (progressive clues that link back to the definitions)
 *
 * Warm-up questions come from lesson.json.
 */

const INITIAL_VALUES = [50, 30, 70, 20, 40, 60, 80];
const MAX_NODES = 15;
const TOTAL_STEPS = 5;
const SVG_NS = 'http://www.w3.org/2000/svg';
const KEYBOARD_HINT =
  'Keyboard: Tab to a node, then use the arrow keys to move ' +
  '(↑ parent, ← → children). Enter opens its details, Esc closes them.';

let nextNodeId = 1;

/* ==========================================
   DOM + TREE HELPERS
   ========================================== */

function el(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function svgEl(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });
  return element;
}

function createNode(value, parent = null) {
  return { id: nextNodeId++, value, parent, left: null, right: null };
}

function insertNode(root, value) {
  if (!root) return createNode(value);
  let current = root;
  while (true) {
    if (value === current.value) return root;
    const side = value < current.value ? 'left' : 'right';
    if (current[side]) {
      current = current[side];
    } else {
      current[side] = createNode(value, current);
      break;
    }
  }
  return root;
}

function buildExample() {
  let root = null;
  INITIAL_VALUES.forEach(value => { root = insertNode(root, value); });
  return root;
}

function findNode(root, value) {
  let current = root;
  while (current) {
    if (current.value === value) return current;
    current = value < current.value ? current.left : current.right;
  }
  return null;
}

function countNodes(root) {
  return root ? 1 + countNodes(root.left) + countNodes(root.right) : 0;
}

function allNodes(node, out = []) {
  if (!node) return out;
  allNodes(node.left, out);
  out.push(node);
  allNodes(node.right, out);
  return out;
}

// "20, 30 and 40"
function listValues(nodes) {
  const values = nodes.map(n => n.value).sort((a, b) => a - b);
  if (values.length < 2) return values.join('');
  return `${values.slice(0, -1).join(', ')} and ${values[values.length - 1]}`;
}

function newState() {
  return {
    selected: null,
    active: null,
    newValue: null,
    answerPath: new Set(),
    marks: new Map(),     // node -> highlight colour
    compares: new Map(),  // node -> { text, dir, pending }
    invalid: new Map()    // node -> label shown under the red cross
  };
}

function nodeFacts(node) {
  const parent = node.parent;
  const side = parent ? (parent.left === node ? 'left' : 'right') : null;
  const sibling = parent ? (side === 'left' ? parent.right : parent.left) : null;
  const kids = [node.left, node.right].filter(Boolean).map(n => n.value);
  const subtree = allNodes(node).map(n => n.value).sort((a, b) => a - b);

  return [
    ['Position', parent ? `${side} child of ${parent.value}` : 'Root (no parent)'],
    ['Parent', parent ? parent.value : 'None'],
    ['Sibling', sibling ? sibling.value : 'None'],
    ['Children', kids.length ? kids.join(', ') : 'None (it is a leaf)'],
    ['Subtree', subtree.join(', ')]
  ];
}

function describeNode(node) {
  if (!node) return 'No node selected.';
  return `Node ${node.value}. ` +
    nodeFacts(node).map(([k, v]) => `${k}: ${v}.`).join(' ');
}

function treeToList(node, role = 'root') {
  const ul = document.createElement('ul');
  const li = document.createElement('li');
  const isLeaf = !node.left && !node.right;
  li.textContent = `${node.value} (${role}${isLeaf ? ', leaf' : ''})`;
  if (node.left) li.appendChild(treeToList(node.left, `left child of ${node.value}`));
  if (node.right) li.appendChild(treeToList(node.right, `right child of ${node.value}`));
  ul.appendChild(li);
  return ul;
}

/* ==========================================
   SVG TREE
   Comparison signs (e.g. "65 > 50") are drawn beside the nodes.
   Arrow keys move focus between nodes.
   ========================================== */

function drawTree(svg, root, state, { onSelect, announce }) {
  svg.replaceChildren();

  const entries = [];
  (function collect(node, depth = 0) {
    if (!node) return;
    collect(node.left, depth + 1);
    entries.push({ node, depth });
    collect(node.right, depth + 1);
  })(root);

  if (!entries.length) return;

  const maxDepth = Math.max(...entries.map(e => e.depth));
  const width = Math.max(760, entries.length * 92);
  const height = Math.max(355, 150 + maxDepth * 110);

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'group');
  svg.setAttribute(
    'aria-label',
    'Binary Search Tree diagram. Tab to a node, use the arrow keys to move ' +
    'around the tree, and press Enter for details.'
  );

  const positions = new Map();
  entries.forEach(({ node, depth }, index) => {
    const x = entries.length === 1
      ? width / 2
      : 65 + index * (width - 130) / (entries.length - 1);
    positions.set(node, { x, y: 65 + depth * 110 });
  });

  // Edges first, so they sit behind the nodes.
  entries.forEach(({ node }) => {
    if (!node.parent) return;
    const from = positions.get(node.parent);
    const to = positions.get(node);
    const classes = ['bst-tree-edge'];

    if (node.value === state.newValue) classes.push('bst-tree-edge--new');
    if (state.answerPath.has(node.value) && state.answerPath.has(node.parent.value)) {
      classes.push('is-answer-path');
    }

    const colour = state.marks.get(node);
    if (colour && colour === state.marks.get(node.parent)) classes.push(`mk-${colour}`);

    svg.appendChild(svgEl('line', {
      x1: from.x, y1: from.y, x2: to.x, y2: to.y, class: classes.join(' '),
      'aria-hidden': 'true'
    }));
  });

  const tabNode = entries.some(e => e.node === state.selected) ? state.selected : root;

  entries.forEach(({ node }) => {
    const { x, y } = positions.get(node);
    const invalid = state.invalid.has(node);
    const invalidLabel = state.invalid.get(node);
    const classes = ['bst-tree-node'];

    if (node === state.selected) classes.push('is-selected');
    if (node === state.active) classes.push('is-active');
    if (node.value === state.newValue) classes.push('is-new');
    if (state.answerPath.has(node.value)) classes.push('is-answer-path');
    if (state.marks.has(node)) classes.push(`mk-${state.marks.get(node)}`);
    if (invalid) classes.push('is-invalid');

    const group = svgEl('g', {
      class: classes.join(' '),
      'data-id': node.id,
      tabindex: node === tabNode ? '0' : '-1',
      role: 'button',
      'aria-pressed': String(node === state.selected),
      'aria-label':
        (invalid ? 'Not allowed: duplicate value. ' : '') +
        describeNode(node)
    });

    group.append(
      svgEl('circle', { cx: x, cy: y, r: 27 }),
      Object.assign(svgEl('text', { x, y, class: 'bst-tree-value' }), {
        textContent: String(node.value)
      })
    );

    // ROOT and LEAF labels only, so labels never overlap branches.
    if (!node.parent || (!node.left && !node.right)) {
      const label = svgEl('text', {
        x,
        y: node.parent ? y + 45 : y - 41,
        class: 'bst-tree-role' + (invalidLabel ? ' is-invalid' : ''),
        'aria-hidden': 'true'
      });
      label.textContent = invalidLabel || (node.parent ? 'LEAF' : 'ROOT');
      group.appendChild(label);
    }

    if (node.value === state.newValue) {
      const tag = svgEl('text', {
        x: x + 37, y: y - 28, class: 'bst-tree-new-label', 'aria-hidden': 'true'
      });
      tag.textContent = 'NEW';
      group.appendChild(tag);
    }

    // Red cross: this node breaks the rule.
    if (invalid) {
      const badge = svgEl('g', { class: 'bst-invalid-badge', 'aria-hidden': 'true' });
      badge.append(
        svgEl('circle', { cx: x + 31, cy: y - 27, r: 12 }),
        Object.assign(svgEl('text', { x: x + 31, y: y - 27, class: 'bst-invalid-mark' }), {
          textContent: '✕'
        })
      );
      group.appendChild(badge);
    }

    // Comparison sign, e.g. "65 > 50", beside the node.
    const compare = state.compares.get(node);
    if (compare) {
      const w = compare.text.length * 8.2 + 16;
      let px = compare.dir === 'left' ? x - 34 - w : x + 34;
      if (px < 4) px = x + 34;
      else if (px + w > width - 4) px = x - 34 - w;

      const pill = svgEl('g', {
        class: 'bst-compare' + (compare.pending ? ' is-pending' : ''),
        'aria-hidden': 'true'
      });
      pill.append(
        svgEl('rect', { x: px, y: y - 13, width: w, height: 26, rx: 7 }),
        Object.assign(svgEl('text', { x: px + w / 2, y }), { textContent: compare.text })
      );
      group.appendChild(pill);
    }

    group.addEventListener('focus', () => {
      svg.querySelectorAll('.bst-tree-node').forEach(g => {
        g.setAttribute('tabindex', g === group ? '0' : '-1');
      });
    });

    group.addEventListener('click', () => onSelect(node));

    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(node, true);
        return;
      }

      const moves = {
        ArrowUp: [node.parent, 'is the root, so it has no parent'],
        ArrowLeft: [node.left, 'has no left child'],
        ArrowRight: [node.right, 'has no right child'],
        ArrowDown: [node.left || node.right, 'is a leaf, so it has no children'],
        Home: [root, '']
      };

      if (!(event.key in moves)) return;

      event.preventDefault();
      const [target, message] = moves[event.key];

      if (target) {
        svg.querySelector(`[data-id="${target.id}"]`)?.focus();
      } else {
        announce(`Node ${node.value} ${message}.`);
      }
    });

    svg.appendChild(group);
  });
}

/* ==========================================
   TREE VIEW = SVG + POP-UP COMMENT
   ========================================== */

function createTreeView(announce) {
  const wrap = el('div', 'bst-tree-wrap');
  const viewport = el('div', 'bst-tree-viewport');
  const svg = svgEl('svg', { class: 'bst-lesson-svg' });
  viewport.appendChild(svg);

  const pop = el('div', 'bst-popover');
  const popTitle = el('strong', 'bst-popover__title');
  const popList = el('dl', 'bst-popover__list');
  const popClose = el('button', 'bst-popover__close', '×');

  popClose.type = 'button';
  popClose.setAttribute('aria-label', 'Close node details');
  pop.hidden = true;
  pop.setAttribute('role', 'group');
  pop.append(popClose, popTitle, popList);

  wrap.append(viewport, pop);

  const view = { wrap, viewport, svg, openNode: null };

  view.close = (restoreFocus = false) => {
    const node = view.openNode;
    pop.hidden = true;
    view.openNode = null;
    if (restoreFocus && node) {
      svg.querySelector(`[data-id="${node.id}"]`)?.focus();
    }
  };

  view.open = node => {
    const circle = svg.querySelector(`[data-id="${node.id}"] circle`);
    if (!circle) return;

    popTitle.textContent = `Node ${node.value}`;
    pop.setAttribute('aria-label', `Details for node ${node.value}`);
    popList.replaceChildren();
    nodeFacts(node).forEach(([key, value]) => {
      popList.append(el('dt', '', key), el('dd', '', String(value)));
    });

    view.openNode = node;
    pop.hidden = false;

    const c = circle.getBoundingClientRect();
    const w = wrap.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    const centreY = c.top - w.top + c.height / 2;

    let side = 'right';
    let left = c.right - w.left + 14;
    if (left + pw > w.width - 4) {
      side = 'left';
      left = c.left - w.left - pw - 14;
    }
    left = Math.max(4, left);

    const top = Math.min(
      Math.max(4, centreY - ph / 2),
      Math.max(4, w.height - ph - 4)
    );

    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    pop.dataset.side = side;
    pop.style.setProperty(
      '--arrow-y',
      `${Math.min(Math.max(16, centreY - top), ph - 16)}px`
    );

    announce(describeNode(node));
  };

  // Redrawing closes the pop-up; callers re-open it when needed.
  view.draw = (root, state, onSelect) => {
    view.close();
    drawTree(svg, root, state, { onSelect, announce });
  };

  popClose.addEventListener('click', () => view.close(true));
  wrap.addEventListener('keydown', event => {
    if (event.key === 'Escape' && view.openNode) view.close(true);
  });
  viewport.addEventListener('scroll', () => view.close());
  viewport.addEventListener('click', event => {
    if (!event.target.closest('.bst-tree-node')) view.close();
  });

  return view;
}

/* ==========================================
   LESSON CONTENT
   ========================================== */

// Colour + line style are used together, and the explanation always lists the nodes.
const VOCABULARY = [
  {
    term: 'Node', colour: 'slate',
    nodes: r => allNodes(r),
    text: 'A node is one circle in the tree. Each node stores one value, called its key.'
  },
  {
    term: 'Root', colour: 'purple',
    nodes: r => [r],
    text: 'The root is the top node, where the tree starts. It is the only node ' +
          'with no parent.'
  },
  {
    term: 'Parent', colour: 'blue',
    nodes: r => allNodes(r).filter(n => n.left || n.right),
    text: 'A parent is a node that has at least one child below it.'
  },
  {
    term: 'Child', colour: 'teal',
    nodes: r => allNodes(r).filter(n => n.parent),
    text: 'A child is a node connected below another node. Every node except the ' +
          'root is a child, and each parent has a left and/or a right child.'
  },
  {
    term: 'Leaf', colour: 'green',
    nodes: r => allNodes(r).filter(n => !n.left && !n.right),
    text: 'A leaf is a node with no children.'
  },
 
{
  term: 'Subtree',
  colour: 'orange',

  // Include both main subtrees.
  nodes: r => [
    ...allNodes(r.left),
    ...allNodes(r.right)
  ],

  text:
    'A subtree consists of a node and all its descendants. ' +
    'The BLUE left subtree is rooted at 30 and contains ' +
    '30, 20 and 40. ' +
    'The ORANGE right subtree is rooted at 70 and contains ' +
    '70, 60 and 80. ' +
    'Each node can also be considered the root of its own subtree.'
}

];

const RULES = [
  {
    title: 'Unique keys', icon: '≠', demo: 'duplicate',
    sentence: 'Each node contains a unique key. No value appears twice.'
  },
  {
    title: 'Smaller goes left', icon: '<', side: 'left',
    sentence: 'All nodes in the left subtree of a node contain values strictly ' +
              'less than the node’s value.'
  },
  {
    title: 'Larger goes right', icon: '>', side: 'right',
    sentence: 'All nodes in the right subtree of a node contain values strictly ' +
              'greater than the node’s value.'
  }
];

const CLUES = [
  {
    text: 'Clue 1: Every insertion starts at the root. Compare 65 with the root, 50.',
    review: { term: 'Root' }
  },
  {
    text: 'Clue 2: 65 is larger than 50, and larger values go right. Move into the ' +
          'right subtree and compare 65 with 70.',
    review: { term: 'Subtree' }
  },
  {
    text: 'Clue 3: 65 is smaller than 70, so go left to 60. 65 is larger than 60, ' +
          'so go right. That spot is empty.',
    review: { rule: true }
  }
];

/* ==========================================
   MAIN SCREEN
   ========================================== */

export function render(screen, container) {
  const page = el('div', 'bst-page');

  let root = buildExample();
  let pendingInsertion = null;
  let playbackTimer = null;
  let playing = false;
  let destroyed = false;
  let insertedValues = [];
  let liveTimer = null;

  const treeState = newState();
  const timeoutTasks = new Set();
  const completedSections = new Set();
  const reduceMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------
  // SCREEN READER ANNOUNCEMENTS
  // One polite live region for everything.
  // ------------------------------------------

  const live = el('div', 'bst-sr-only');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('aria-atomic', 'true');

  function announce(message) {
    if (destroyed) return;
    live.textContent = '';
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { live.textContent = message; }, 60);
  }

  // Highlighted explanation: sets the text, flashes the box, announces it.
  function say(target, message) {
    target.textContent = message;
    const box = target.closest('.bst-callout') || target;
    box.classList.remove('is-flash');
    void box.offsetWidth;
    box.classList.add('is-flash');
    announce(message);
  }

  function createCallout(label, initial) {
    const box = el('div', 'bst-callout');
    const text = el('p', 'bst-callout__text', initial);
    box.append(el('span', 'bst-callout__label', label), text);
    return { box, text };
  }

  function wait(ms) {
    return new Promise(resolve => {
      const task = { id: null, resolve };
      task.id = setTimeout(() => { timeoutTasks.delete(task); resolve(); }, ms);
      timeoutTasks.add(task);
    });
  }

  function stopPlayback() {
    if (playbackTimer !== null) {
      clearInterval(playbackTimer);
      playbackTimer = null;
    }
    playing = false;
  }

  function labelSection(section, heading, id) {
    heading.id = id;
    section.setAttribute('aria-labelledby', id);
  }

  // ------------------------------------------
  // Sticky header offset
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
  // PROGRESS
  // ==========================================

  const progress = el('div', 'lesson-progress');
  const progressTitle = el('strong', '', 'BINARY SEARCH TREES');
  const progressLabel = el('span', 'lesson-progress__label', `Step 0 of ${TOTAL_STEPS}`);
  const progressTrack = el('div', 'lesson-progress__track');
  const progressFill = el('div', 'lesson-progress__fill');

  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute('aria-label', 'BST activity progress');
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', String(TOTAL_STEPS));
  progressTrack.setAttribute('aria-valuenow', '0');
  progressTrack.setAttribute('aria-valuetext', `0 of ${TOTAL_STEPS} steps complete`);
  progressFill.style.width = '0%';

  progressTrack.appendChild(progressFill);
  progress.append(progressTitle, progressTrack, progressLabel);

  const SECTION_NAMES = {
    warmup: 'Warm-up', vocabulary: 'Vocabulary', rule: 'Definition and rules',
    explore: 'Try insertion', check: 'Check'
  };

  function markComplete(section) {
    if (completedSections.has(section)) return;
    completedSections.add(section);

    const count = completedSections.size;
    progressLabel.textContent = `Step ${count} of ${TOTAL_STEPS}`;
    progressFill.style.width = `${(count * 100) / TOTAL_STEPS}%`;
    progressTrack.setAttribute('aria-valuenow', String(count));
    progressTrack.setAttribute('aria-valuetext', `${count} of ${TOTAL_STEPS} steps complete`);

    setTimeout(() => announce(
      `${SECTION_NAMES[section]} complete. ${count} of ${TOTAL_STEPS} steps done.`
    ), 1200);
  }

  // ==========================================
  // 01 — WARM-UP
  // ==========================================

  const warmup = el('section', 'bst-card bst-warmup-card');
  warmup.id = 'bst-warmup';

  const warmupHeading = el('h2', '', 'Quick warm-up');
  labelSection(warmup, warmupHeading, 'bst-warmup-title');
  warmup.append(
    el('span', 'bst-eyebrow', '01 / WARM-UP'),
    warmupHeading,
    el('p', 'bst-muted',
      'Check what you already know about trees and stacks. ' +
      'This is not graded. Ask for help and try again.')
  );

  const warmupGrid = el('div', 'bst-warmup-grid');
  const warmupResult = el('div', 'bst-warmup-result');
  warmupResult.hidden = true;

  const questions = screen.warmup?.questions || [];
  const refreshers = screen.warmup?.refreshers || {};
  const warmupCorrect = new Set();
  const warmupAttempted = new Set();
  const warmupNeedsReview = new Set();

  function updateWarmupResult() {
    if (questions.length === 0 || warmupAttempted.size !== questions.length) return;

    warmupResult.hidden = false;

    if (warmupCorrect.size === questions.length) {
      warmupResult.className = 'bst-warmup-result is-ready';
      say(warmupResult,
        "You're ready! You've recalled the basics of trees and stacks.");
      markComplete('warmup');
      return;
    }

    warmupResult.className = 'bst-warmup-result is-review';
    say(warmupResult, warmupNeedsReview.has('stacks')
      ? 'Review stacks first. Watch the short animation and retry the question.'
      : 'Review the tree explanation and try again.');
  }

  function buildTreeHelp() {
    const diagram = el('div', 'bst-mini-diagram');
    diagram.innerHTML = `
      <svg viewBox="0 0 180 110" role="img"
           aria-label="A root node 50 connected to children 30 and 70">
        <line x1="90" y1="25" x2="40" y2="85"/>
        <line x1="90" y1="25" x2="140" y2="85"/>
        <circle cx="90" cy="25" r="18"/><circle cx="40" cy="85" r="18"/>
        <circle cx="140" cy="85" r="18"/>
        <text x="90" y="30">50</text><text x="40" y="90">30</text>
        <text x="140" y="90">70</text>
      </svg>`;
    return [
      diagram,
      el('p', '', refreshers.trees ||
        'A tree has a root, connected child nodes and no cycles.')
    ];
  }

  function buildStackHelp() {
    const demo = el('div', 'bst-stack-demo');
    const visual = el('div', 'bst-stack-demo__items');
    const message = createCallout('Watch', 'Push 1, then 2, then 3.');
    const button = el('button', 'bst-demo-button', 'Watch stack animation');
    visual.setAttribute('aria-hidden', 'true');
    button.type = 'button';

    let running = false;

    button.addEventListener('click', async () => {
      if (running || destroyed) return;
      running = true;
      button.disabled = true;

      const stack = [];
      const draw = () => {
        visual.replaceChildren();
        [...stack].reverse().forEach((value, index) => {
          const item = el('div', 'bst-stack-demo__item', String(value));
          if (index === 0) item.classList.add('is-top');
          visual.appendChild(item);
        });
      };

      for (const value of [1, 2, 3]) {
        if (destroyed) return;
        stack.push(value);
        say(message.text, `Push ${value}.`);
        draw();
        await wait(1100);
      }

      if (destroyed) return;
      say(message.text, 'The last value pushed is 3, so 3 is popped first.');
      await wait(1500);

      if (destroyed) return;
      stack.pop();
      draw();
      say(message.text, '3 came off first. This is Last In, First Out (LIFO).');
      running = false;
      button.disabled = false;
    });

    demo.append(el('strong', '', 'Watch how a stack works'), visual, message.box, button);
    return [demo, el('p', '', refreshers.stacks || 'A stack follows Last In, First Out.')];
  }

  questions.forEach((question, questionIndex) => {
    const card = el('article', 'bst-warmup-question');
    const answers = el('div', 'bst-answer-options');
    const feedback = el('div', 'bst-answer-feedback');
    const help = el('div', 'bst-warmup-help');
    help.hidden = true;

    answers.setAttribute('role', 'group');
    answers.setAttribute('aria-label', `Answers for question ${questionIndex + 1}`);

    if (question.refresher === 'trees') help.append(...buildTreeHelp());
    if (question.refresher === 'stacks') help.append(...buildStackHelp());

    [...question.options, { id: 'unsure', text: 'Not sure', unsure: true }]
      .forEach(option => {
        const button = el('button', 'bst-answer', option.text);
        button.type = 'button';
        button.setAttribute('aria-pressed', 'false');

        button.addEventListener('click', () => {
          warmupAttempted.add(question.id);
          answers.querySelectorAll('button').forEach(other => {
            other.setAttribute('aria-pressed', String(other === button));
          });

          if (option.correct === true) {
            warmupCorrect.add(question.id);
            warmupNeedsReview.delete(question.refresher);
            feedback.className = 'bst-answer-feedback is-correct';
            say(feedback, question.refresher === 'stacks'
              ? 'Correct! The last item pushed comes off first.'
              : 'Correct! A tree has connected nodes and no cycles.');
            help.hidden = true;
          } else {
            warmupCorrect.delete(question.id);
            warmupNeedsReview.add(question.refresher);
            feedback.className = 'bst-answer-feedback is-review';
            say(feedback, option.unsure
              ? "That's okay. Read the explanation below, then try again."
              : 'Not quite. Use the explanation below to work through the answer.');
            help.hidden = false;
          }

          updateWarmupResult();
        });

        answers.appendChild(button);
      });

    card.append(
      el('h3', '', `${questionIndex + 1}. ${question.prompt}`),
      answers, feedback, help
    );
    warmupGrid.appendChild(card);
  });

  if (questions.length === 0) {
    warmupResult.hidden = false;
    warmupResult.textContent =
      'Warm-up questions are unavailable. Check the warmup section in lesson.json.';
  }

  warmup.append(warmupGrid, warmupResult);

  // ==========================================
  // MARK PANEL = tree + highlighted explanation
  // Used by the vocabulary card and the definition card.
  // ==========================================

  function createMarkPanel(initialText) {
    const panel = {
      root: buildExample(),
      state: newState(),
      view: createTreeView(announce),
      callout: createCallout('Explanation', initialText),
      buttons: [],
      chips: new Map(),
      locked: false
    };

    panel.visual = el('div', 'bst-learn-visual');
    panel.visual.append(panel.view.wrap, panel.callout.box);

    panel.draw = () => {
      panel.view.draw(panel.root, panel.state, (node, restoreFocus) => {
        const same = panel.view.openNode === node;
        panel.state.selected = node;

        if (!panel.locked) {
          panel.state.marks = new Map();
          panel.state.compares = new Map();
          panel.state.invalid = new Map();
          panel.buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
         panel.callout.text.textContent =
  describeNode(node);
        }

        panel.draw();
        if (!same) panel.view.open(node);
        if (restoreFocus) {
          panel.view.svg.querySelector(`[data-id="${node.id}"]`)?.focus();
        }
      });
    };

    panel.show = (button, entries, text, opts = {}) => {
      panel.buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      panel.state.selected = null;
      panel.state.marks = new Map(entries);
      panel.state.compares = opts.compares || new Map();
      panel.state.invalid = opts.invalid || new Map();

      const list = opts.list ? ` Highlighted: ${listValues(opts.list)}.` : '';
      say(panel.callout.text, text + list);
      panel.draw();
    };

    return panel;
  }

  function makeChip(panel, item, { clue = false, beforeShow, afterShow } = {}) {
    const chip = el('button', `bst-chip mk-${item.colour}`, item.term);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', 'false');
    panel.buttons.push(chip);
    panel.chips.set(item.term, chip);

    chip.addEventListener('click', () => {
      if (beforeShow) beforeShow();
     
const nodes = item.nodes(panel.root);

let highlights;

// Subtree: show BOTH sides with different colours.
if (item.term === 'Subtree') {
  highlights = [
    ...allNodes(panel.root.left).map(node => [
      node,
      'blue'
    ]),

    ...allNodes(panel.root.right).map(node => [
      node,
      'orange'
    ])
  ];
} else {
  // Keep all other vocabulary behaviour unchanged.
  highlights = nodes.map(node => [
    node,
    item.colour
  ]);
}

panel.show(
  chip,
  highlights,
  (clue ? 'Clue: ' : '') +
    `${item.term}. ${item.text}`,
  { list: nodes }
);

      if (afterShow) afterShow(item, chip);
    });

    return chip;
  }

  // ==========================================
  // 02 — VOCABULARY (before any rule)
  // ==========================================

  const vocabPanel = createMarkPanel(
    'Choose a word. Every matching node lights up in the tree. ' +
    'You can also click any node.'
  );

  const vocabCard = el('section', 'bst-card bst-learn-card');
  vocabCard.id = 'bst-vocabulary';

  const vocabHeading = el('h2', '', 'Meet the tree');
  labelSection(vocabCard, vocabHeading, 'bst-vocabulary-title');

  const vocabSeen = new Set();
  const vocabChips = el('div', 'bst-chips');
  vocabChips.setAttribute('role', 'group');
  vocabChips.setAttribute('aria-label', 'Vocabulary words');

  VOCABULARY.forEach(item => {
    vocabChips.appendChild(makeChip(vocabPanel, item, {
      afterShow: (_item, chip) => {
        vocabSeen.add(item.term);
        chip.dataset.seen = 'true';
        chip.setAttribute('aria-label', `${item.term}, viewed`);
        if (vocabSeen.size === VOCABULARY.length) markComplete('vocabulary');
      }
    }));
  });

const vocabText = el('div', 'bst-learn-text');

vocabText.append(
  el(
    'p',
    'bst-lead',
    'Select each vocabulary term to learn its meaning ' +
    'and see the matching nodes highlighted in the tree.'
  ),

  vocabChips,

  // The explanation now appears directly below
  // the vocabulary buttons on the LEFT.
  vocabPanel.callout.box
);

// Remove the explanation from underneath
// the tree on the RIGHT.
vocabPanel.callout.box.remove();
vocabText.appendChild(vocabPanel.callout.box);

// Update the initial explanation.
vocabPanel.callout.text.textContent =
  'Select Node, Root, Parent, Child, Leaf or Subtree ' +
  'to see its explanation here.';

  const vocabBody = el('div', 'bst-learn-body');
  vocabBody.append(vocabText, vocabPanel.visual);

  vocabCard.append(
    el('span', 'bst-eyebrow', '02 / VOCABULARY'),
    vocabHeading,
    el('p', 'bst-muted',
      'A tree stores values in connected nodes. A binary tree is a tree in ' +
      'which every node has at most two children: a left child and a right child.'),
    vocabBody
  );

  vocabPanel.draw();

  // ==========================================
  // 03 — DEFINITION AND ORDERING RULE
  // ==========================================

  const rulePanel = createMarkPanel(
    'Choose a rule or a clue. The tree shows what it means.'
  );

  const ruleCard = el('section', 'bst-card bst-learn-card bst-rule-card');
  ruleCard.id = 'bst-rule';

  const ruleHeading = el('h2', '', 'What makes a tree a Binary Search Tree?');
  labelSection(ruleCard, ruleHeading, 'bst-rule-title');

  const seenRules = new Set();

  // Restore the original tree (no announcement, no redraw).
  function restoreRuleTree() {
    rulePanel.root = buildExample();
    rulePanel.state = newState();
    rulePanel.locked = false;
    backRow.hidden = true;
  }

  const backRow = el('div', 'bst-back-row');
  backRow.hidden = true;
  const backButton = el('button', 'btn btn--primary', '↩ Back to the original tree');
  backButton.type = 'button';
  backRow.append(
    el('p', '', 'This tree has been changed to show a mistake.'),
    backButton
  );

  function showOrderRule(button, rule) {
    restoreRuleTree();

    const r = rulePanel.root;
    const subtree = allNodes(rule.side === 'left' ? r.left : r.right);
    const symbol = rule.side === 'left' ? '<' : '>';
    const word = rule.side === 'left' ? 'less' : 'greater';
    const colour = rule.side === 'left' ? 'blue' : 'orange';

    const compares = new Map(subtree.map(n => [
      n,
      { text: `${n.value} ${symbol} ${r.value}`, dir: n.parent.left === n ? 'left' : 'right' }
    ]));

    rulePanel.show(
      button,
      [[r, 'purple'], ...subtree.map(n => [n, colour])],
      `${rule.title}. ${listValues(subtree)} are all strictly ${word} than ${r.value}, ` +
      `so they sit in the ${rule.side} subtree of ${r.value}. The signs on the tree ` +
      'show each comparison. The same rule applies at every node, not only the root.',
      { compares }
    );
  }

  function showDuplicateDemo(button) {
    restoreRuleTree();

    const eighty = findNode(rulePanel.root, 80);
    const copy = createNode(80, eighty);
    eighty.right = copy;

    rulePanel.locked = true;
    backRow.hidden = false;

    rulePanel.show(
      button,
      [[eighty, 'orange'], [copy, 'orange']],
      'Unique keys. This tree is NOT a valid BST. The value 80 appears twice, and the ' +
      'second 80 is marked with a red cross. Each node must contain a unique key, so ' +
      'duplicates are not allowed. Press “Back to the original tree” when you are ready.',
      { invalid: new Map([[copy, 'DUPLICATE']]) }
    );
  }

  const ruleList = el('div', 'bst-rule-list');
  ruleList.setAttribute('role', 'group');
  ruleList.setAttribute('aria-label', 'Rules of a Binary Search Tree');

  RULES.forEach(rule => {
    const item = el('button', 'bst-rule-item');
    const icon = el('span', 'bst-rule-icon', rule.icon);
    const body = el('span', 'bst-rule-body');

    icon.setAttribute('aria-hidden', 'true');
    body.append(el('strong', '', rule.title), el('span', 'bst-rule-sentence', rule.sentence));
    item.type = 'button';
    item.setAttribute('aria-pressed', 'false');
    item.append(icon, body);
    rulePanel.buttons.push(item);
    rule.button = item;

    item.addEventListener('click', () => {
      if (rule.demo === 'duplicate') showDuplicateDemo(item);
      else showOrderRule(item, rule);

      seenRules.add(rule.title);
      if (seenRules.size === RULES.length) markComplete('rule');
    });

    ruleList.appendChild(item);
  });

  backButton.addEventListener('click', () => {
    restoreRuleTree();
    rulePanel.buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
    say(rulePanel.callout.text, 'Back to the original tree. Every key appears exactly once.');
    rulePanel.draw();
    RULES[0].button.focus();
  });

  // Clues: jump back to a word the definition uses.
  const clueWords = el('div', 'bst-chips');
  clueWords.setAttribute('role', 'group');
  clueWords.setAttribute('aria-label', 'Clues: vocabulary used in the definition');

  ['Node', 'Root', 'Subtree'].forEach(term => {
    const item = VOCABULARY.find(v => v.term === term);
    clueWords.appendChild(makeChip(rulePanel, item, {
      clue: true,
      beforeShow: restoreRuleTree
    }));
  });

  const ruleText = el('div', 'bst-learn-text');
  ruleText.append(
    el('p', 'bst-lead',
      'A Binary Search Tree (BST) is a type of binary tree data structure in which ' +
      'each node contains a unique key and satisfies a specific ordering property:'),
    ruleList,
    el('p', 'bst-lead bst-lead--after',
      'This structure enables efficient operations for searching, insertion, and ' +
      'deletion of elements, especially when the tree remains balanced.'),
    backRow,
    el('p', 'bst-clue-label', 'Stuck? Get a clue by looking back at a word:'),
    clueWords
  );

  const ruleBody = el('div', 'bst-learn-body');
  ruleBody.append(ruleText, rulePanel.visual);

  ruleCard.append(
    el('span', 'bst-eyebrow', '03 / DEFINITION AND ORDERING RULE'),
    ruleHeading,
    ruleBody
  );

  rulePanel.draw();

  // ==========================================
  // 04 — TRY INSERTION
  // ==========================================

  const exploreView = createTreeView(announce);
  const nodeCount = el('span', 'bst-node-count');

  const treeCard = el('section', 'bst-card bst-tree-card');
  treeCard.id = 'bst-explore';

  const treeHeadingText = el('div', 'bst-tree-heading__text');
  const treeTitle = el('h2', '', 'Grow the tree');
  labelSection(treeCard, treeTitle, 'bst-explore-title');
  treeHeadingText.append(
    el('span', 'bst-eyebrow', '04 / TRY IT'),
    treeTitle,
    el('p', 'bst-tree-description',
      'Insert a value and apply the rule step by step. The comparison signs appear ' +
      'on the tree. Click any node to see how it connects to its neighbours.')
  );

  const treeHeading = el('div', 'bst-tree-heading');
  treeHeading.append(treeHeadingText, nodeCount);

  // Highlighted caption directly under the tree: what is happening now.
  const caption = createCallout('What is happening', 'Try inserting 65 into the tree.');
  caption.box.classList.add('bst-callout--large');
  const pathLine = el('p', 'bst-callout__path');
  caption.box.appendChild(pathLine);
  const explain = text => say(caption.text, text);

  const treeText = el('details', 'bst-tree-text');
  const treeTextBody = el('div');
  treeText.append(el('summary', '', 'Show tree as text'), treeTextBody);

  const legend = el('div', 'bst-tree-legend');
  [
    ['○', 'Normal', 'normal'],
    ['◌', 'Comparing', 'comparing'],
    ['●', 'Selected', 'selected'],
    ['+', 'New', 'new'],
    ['<>', 'Comparison sign', 'compare']
  ].forEach(([symbol, label, type]) => {
    const item = el('span', 'bst-legend-item');
    const mark = el('span', `bst-legend-symbol bst-legend-symbol--${type}`, symbol);
    mark.setAttribute('aria-hidden', 'true');
    item.append(mark, document.createTextNode(label));
    legend.appendChild(item);
  });

 // Put the tree and its legend inside ONE bordered box.
const treeFrame = el('div', 'bst-tree-frame');

treeFrame.append(
  exploreView.wrap,
  legend
);

// The explanation no longer appears below the tree.
treeCard.append(
  treeHeading,
  treeFrame,
  treeText
);

  function showTree() {
    const rect = exploreView.viewport.getBoundingClientRect();
    const topLimit = (appHeader ? appHeader.getBoundingClientRect().height : 72) + 80;

    if (rect.top < topLimit || rect.bottom > window.innerHeight - 140) {
      exploreView.viewport.scrollIntoView({
        behavior: reduceMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }

  function onTreeSelect(node, restoreFocus = false) {
    const same = exploreView.openNode === node;
    treeState.selected = node;
    refreshTree();
    if (!same) exploreView.open(node);
    if (restoreFocus) {
      exploreView.svg.querySelector(`[data-id="${node.id}"]`)?.focus();
    }
  }

  function refreshTree() {
    if (destroyed) return;
    nodeCount.textContent = `${countNodes(root)} nodes`;
    treeTextBody.replaceChildren(treeToList(root));
    exploreView.draw(root, treeState, onTreeSelect);
  }

  // Controls card ----------------------------

  const form = el('form', 'bst-insert-form');
  const inputLabel = el('label', '', 'Insert a value (0–99)');
  const input = el('input');
  input.id = 'bst-insert-value';
  input.type = 'number';
  input.min = '0';
  input.max = '99';
  input.step = '1';
  input.placeholder = 'e.g. 65';
  inputLabel.htmlFor = input.id;

  const insertButton = el('button', 'btn btn--primary', 'Start insertion');
  insertButton.type = 'submit';
  const resetButton = el('button', 'btn', 'Reset tree');
  resetButton.type = 'button';
  form.append(inputLabel, input, insertButton, resetButton);

  const predictRow = el('div', 'bst-predict');
  predictRow.hidden = true;
  predictRow.setAttribute('role', 'group');
  predictRow.setAttribute('aria-label', 'Predict the next move');
  const predictLeft = el('button', 'btn', '← Go left');
  const predictRight = el('button', 'btn', 'Go right →');
  predictLeft.type = 'button';
  predictRight.type = 'button';
  predictRow.append(
    el('span', 'bst-predict__label', 'Predict the next move:'),
    predictLeft, predictRight
  );

  const player = el('div', 'bst-insertion-player');
  const nextButton = el('button', 'btn btn--primary', 'Show next step →');
  const playButton = el('button', 'btn', 'Play');
  nextButton.type = 'button';
  playButton.type = 'button';

  const speedLabel = el('label', '', 'Speed');
  const speedSelect = el('select', 'bst-speed');
  [['2200', 'Slow'], ['1400', 'Normal'], ['800', 'Fast']].forEach(([value, text]) => {
    const option = el('option', '', text);
    option.value = value;
    if (value === '1400') option.selected = true;
    speedSelect.appendChild(option);
  });
  speedLabel.appendChild(speedSelect);
  player.append(nextButton, playButton, speedLabel);

  const historyRow = el('div', 'bst-insertion-history');
  const undoButton = el('button', 'btn', 'Undo last insert');
  const replayButton = el('button', 'btn', 'Replay last');
  undoButton.type = 'button';
  replayButton.type = 'button';
  historyRow.append(undoButton, replayButton);

  const controlsCard = el('section', 'bst-card bst-controls-card');
  const controlsTitle = el('h3', '', 'Try an insertion');
  labelSection(controlsCard, controlsTitle, 'bst-controls-title');
 // Explanation now appears at the TOP of the insertion card.
controlsCard.append(
  controlsTitle,
  caption.box,
  form,
  predictRow,
  player,
  historyRow
);

  const exploreGrid = el('div', 'bst-explore-grid');
  exploreGrid.append(treeCard, controlsCard);

  // Insertion logic ---------------------------

  function updatePlayer() {
    const hasPending = pendingInsertion !== null;
    nextButton.disabled = !hasPending || playing;
    playButton.disabled = !hasPending;
    input.disabled = hasPending;
    insertButton.disabled = hasPending;
    predictRow.hidden = !(hasPending && !playing);
    undoButton.disabled = hasPending || insertedValues.length === 0;
    replayButton.disabled = undoButton.disabled;
    playButton.textContent = playing ? 'Pause' : 'Play';
  }

  function rebuildTree() {
    root = null;
    [...INITIAL_VALUES, ...insertedValues].forEach(value => {
      root = insertNode(root, value);
    });
  }

  function clearMarks() {
    treeState.selected = null;
    treeState.active = null;
    treeState.newValue = null;
    treeState.answerPath = new Set();
    treeState.compares = new Map();
    treeState.invalid = new Map();
    input.removeAttribute('aria-invalid');
  }

  function showPath(visited, total, done = false) {
    const path = visited.join(' → ');
    pathLine.textContent = done
      ? `Done · Path: ${path} (new)`
      : `Step ${visited.length} of ${total} · Path: ${path || 'start at the root'}`;
  }

  function getInsertionPath(value) {
    const path = [];
    let current = root;
    while (current) {
      const direction = value < current.value ? 'left' : 'right';
      path.push({ node: current, direction });
      current = current[direction];
    }
    return path;
  }

  function prepareInsertion(value) {
    stopPlayback();

    if (!Number.isInteger(value) || value < 0 || value > 99) {
      input.setAttribute('aria-invalid', 'true');
      explain('Please enter a whole number between 0 and 99.');
      input.focus();
      return false;
    }

    const existing = findNode(root, value);
    if (existing) {
      clearMarks();
      treeState.invalid = new Map([[existing, '']]);
      input.setAttribute('aria-invalid', 'true');
      explain(
        `${value} is already in the tree (marked with a red cross). A BST keeps each ` +
        'key only once, so duplicates are not allowed. Try another number.'
      );
      refreshTree();
      input.focus();
      return false;
    }

    if (countNodes(root) >= MAX_NODES) {
      explain('The tree has reached its practice limit of 15 nodes. Reset the tree to start again.');
      return false;
    }

    clearMarks();
    const path = getInsertionPath(value);
    pendingInsertion = { value, path, index: 0, visited: [] };

    treeState.active = path[0].node;
    treeState.compares.set(path[0].node, {
      text: `${value} ? ${path[0].node.value}`, dir: 'right', pending: true
    });

    showPath([], path.length);
    explain(
      `Inserting ${value}. Compare ${value} with ${path[0].node.value}. ` +
      'Will it go left or right? Predict, or press Show next step.'
    );

    refreshTree();
    updatePlayer();
    return true;
  }

  // guess is 'left', 'right' or null
  function advanceInsertion(guess = null) {
    if (!pendingInsertion) return;

    const { value, path } = pendingInsertion;
    const step = path[pendingInsertion.index];
    const symbol = step.direction === 'left' ? '<' : '>';

    let lead = '';
    if (guess) {
      lead = guess === step.direction
        ? 'Correct! '
        : `Not quite, it goes ${step.direction}. Remember: smaller goes left, larger goes right. `;
    }

    const comparison =
      `${lead}${value} ${symbol} ${step.node.value}, so go ${step.direction}.`;

    // Keep the sign on the tree so the whole path can be read.
    treeState.compares.set(step.node, {
      text: `${value} ${symbol} ${step.node.value}`, dir: step.direction
    });

    pendingInsertion.visited.push(step.node.value);
    pendingInsertion.index += 1;

    if (pendingInsertion.index >= path.length) {
      const added = createNode(value, step.node);
      step.node[step.direction] = added;
      insertedValues.push(value);

      treeState.active = null;
      treeState.newValue = value;

      const visited = pendingInsertion.visited;
      pendingInsertion = null;
      stopPlayback();

      showPath([...visited, value], path.length, true);
      explain(
        `${comparison} That spot is empty, so ${value} becomes the ` +
        `${step.direction} child of ${step.node.value}.`
      );

      markComplete('explore');
    } else {
      const nextNode = path[pendingInsertion.index].node;
      treeState.active = nextNode;
      treeState.compares.set(nextNode, {
        text: `${value} ? ${nextNode.value}`, dir: 'right', pending: true
      });

      showPath(pendingInsertion.visited, path.length);
      explain(`${comparison} Next, compare ${value} with ${nextNode.value}.`);
    }

    refreshTree();
    updatePlayer();
  }

  function startPlayback() {
    playing = true;
    updatePlayer();
    playbackTimer = setInterval(() => advanceInsertion(), Number(speedSelect.value));
  }

  nextButton.addEventListener('click', () => { if (!playing) advanceInsertion(); });
  predictLeft.addEventListener('click', () => { if (!playing) advanceInsertion('left'); });
  predictRight.addEventListener('click', () => { if (!playing) advanceInsertion('right'); });

  playButton.addEventListener('click', () => {
    if (playing) {
      stopPlayback();
      updatePlayer();
    } else if (pendingInsertion) {
      startPlayback();
    }
  });

  speedSelect.addEventListener('change', () => {
    if (!playing) return;
    clearInterval(playbackTimer);
    playbackTimer = setInterval(() => advanceInsertion(), Number(speedSelect.value));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const raw = input.value.trim();

    if (raw === '') {
      input.setAttribute('aria-invalid', 'true');
      explain('Enter a value first. Try 65 as an example.');
      input.focus();
      return;
    }

    if (prepareInsertion(Number(raw))) showTree();
  });

  undoButton.addEventListener('click', () => {
    stopPlayback();
    insertedValues.pop();
    rebuildTree();
    clearMarks();
    pendingInsertion = null;
    pathLine.textContent = '';
    explain('The last insertion was removed.');
    refreshTree();
    updatePlayer();
  });

  replayButton.addEventListener('click', () => {
    if (insertedValues.length === 0) return;
    const value = insertedValues.pop();
    rebuildTree();
    clearMarks();
    input.value = String(value);
    if (prepareInsertion(value)) showTree();
  });

  function resetTree() {
    stopPlayback();
    insertedValues = [];
    rebuildTree();
    clearMarks();
    pendingInsertion = null;
    input.value = '';
    pathLine.textContent = '';
    explain('The original tree has been restored. Enter a number to begin.');
    refreshTree();
    updatePlayer();
  }

  resetButton.addEventListener('click', resetTree);

  // ==========================================
  // 05 — KNOWLEDGE CHECK (with clues)
  // ==========================================

  const check = el('section', 'bst-card bst-check-card');
  check.id = 'bst-knowledge-check';

  const checkHeading = el('h2', '', 'Can you apply the BST rule?');
  labelSection(check, checkHeading, 'bst-check-title');
  check.append(
    el('span', 'bst-eyebrow', '05 / CHECK'),
    checkHeading,
    el('p', '', 'In the original example tree, where would 65 be inserted?')
  );

  const checkAnswers = el('div', 'bst-answer-options');
  const checkFeedback = el('div', 'bst-answer-feedback');
  checkAnswers.setAttribute('role', 'group');
  checkAnswers.setAttribute('aria-label', 'Where would 65 be inserted?');

  [
    { text: 'Left child of 60', correct: false },
    { text: 'Right child of 60', correct: true },
    { text: 'Right child of 80', correct: false },
    { text: 'Not sure', correct: false }
  ].forEach(option => {
    const button = el('button', 'bst-answer', option.text);
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
      checkAnswers.querySelectorAll('button').forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });

      if (option.correct) {
        checkFeedback.className = 'bst-answer-feedback is-correct';
        say(checkFeedback,
          'Correct! Compare 65 with 50, then 70, then 60. ' +
          'It becomes the right child of 60.');
        treeState.answerPath = new Set([50, 70, 60]);
        markComplete('check');
      } else {
        checkFeedback.className = 'bst-answer-feedback is-review';
        say(checkFeedback, option.text === 'Not sure'
          ? 'That is okay. Press Need a clue, or use Show me to watch it happen.'
          : 'Not quite. Press Need a clue, or use Show me to watch it happen.');
        treeState.answerPath = new Set();
      }

      refreshTree();
    });

    checkAnswers.appendChild(button);
  });

  // Clues guide the student back to the definitions.
  const clueButton = el('button', 'btn', 'Need a clue?');
  const clueBox = el('div', 'bst-callout');
  const clueText = el('p', 'bst-callout__text');
  const clueReview = el('button', 'btn', '');
  let clueIndex = 0;
  let clueTarget = null;

  clueButton.type = 'button';
  clueReview.type = 'button';
  clueBox.hidden = true;
  clueBox.append(el('span', 'bst-callout__label', 'Clue'), clueText, clueReview);

  function jumpTo(target, focusEl) {
    target.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    focusEl?.focus({ preventScroll: true });
  }

  clueReview.addEventListener('click', () => {
    if (!clueTarget) return;

    if (clueTarget.term) {
      const chip = vocabPanel.chips.get(clueTarget.term);
      jumpTo(vocabCard, chip);
      chip?.click();
    } else {
      jumpTo(ruleCard, RULES[1].button);
    }
  });

  clueButton.addEventListener('click', () => {
    if (clueIndex >= CLUES.length) return;

    const clue = CLUES[clueIndex];
    clueIndex += 1;
    clueTarget = clue.review;

    clueBox.hidden = false;
    say(clueText, clue.text);
    clueReview.textContent = clue.review.term
      ? `Review the definition of ${clue.review.term}`
      : 'Review the ordering rule';

    if (clueIndex >= CLUES.length) {
      clueButton.textContent = 'All clues shown';
      clueButton.disabled = true;
    } else {
      clueButton.textContent = 'Another clue';
    }
  });

  const showMeButton = el('button', 'bst-show-me', 'Show me →');
  showMeButton.type = 'button';

  showMeButton.addEventListener('click', () => {
    resetTree();
    input.value = '65';
    if (!prepareInsertion(65)) return;
    startPlayback();
    treeCard.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  });

  const checkActions = el('div', 'bst-check-actions');
  checkActions.append(clueButton, showMeButton);

  check.append(checkAnswers, checkFeedback, clueBox, checkActions);

  // ==========================================
  // NEXT LESSON
  // ==========================================

  const lessonNavigation = el('nav', 'bst-lesson-navigation');
  lessonNavigation.setAttribute('aria-label', 'BST lesson navigation');

  const nextLesson = el('a', 'bst-next-button', 'Next Lesson →');
  nextLesson.href = '#/concept-idea';
  lessonNavigation.appendChild(nextLesson);

  // ==========================================
  // ASSEMBLE
  // ==========================================

  page.append(
    live, progress, warmup, vocabCard, ruleCard, exploreGrid, check, lessonNavigation
  );
  container.appendChild(page);

  refreshTree();
  updatePlayer();

  return () => {
    destroyed = true;
    stopPlayback();
    clearTimeout(liveTimer);
    if (headerObserver) headerObserver.disconnect();
    for (const task of timeoutTasks) {
      clearTimeout(task.id);
      task.resolve();
    }
    timeoutTasks.clear();
  };
}