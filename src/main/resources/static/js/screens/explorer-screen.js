
/**
 * COS212 DFS Tutor — Explorer
 *
 * Tab 1: Build a BST
 * Tab 2: Run DFS
 * Tab 3: Traversal Challenge
 *
 * Uses different values from the earlier lessons.
 * No progress bar or backend changes required.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const START_VALUES = [48, 27, 76, 14, 39, 63, 91, 34];
const MAX_NODES = 15;

function el(tag, className = '', text = '') {
  const result = document.createElement(tag);

  if (className) result.className = className;

  result.textContent = text;
  return result;
}

function svgEl(tag, attrs = {}) {
  const result = document.createElementNS(SVG_NS, tag);

  Object.entries(attrs).forEach(([key, value]) => {
    result.setAttribute(key, String(value));
  });

  return result;
}

function button(text, css = 'explorer-btn') {
  const result = el('button', css, text);
  result.type = 'button';
  return result;
}

/* ==========================================
   BST HELPERS
   ========================================== */

function makeNode(value, parent = null) {
  return {
    value,
    parent,
    left: null,
    right: null
  };
}

function insert(root, value) {
  if (!root) return makeNode(value);

  let current = root;

  while (true) {
    if (current.value === value) return root;

    const side = value < current.value
      ? 'left'
      : 'right';

    if (current[side]) {
      current = current[side];
    } else {
      current[side] = makeNode(value, current);
      return root;
    }
  }
}

function makeTree(values) {
  let root = null;

  values.forEach(value => {
    root = insert(root, value);
  });

  return root;
}

function inorderNodes(root) {
  if (!root) return [];

  return [
    ...inorderNodes(root.left),
    root,
    ...inorderNodes(root.right)
  ];
}

function find(root, value) {
  return inorderNodes(root).find(
    node => node.value === value
  ) || null;
}

function orderValues(root, order) {
  const result = [];

  function walk(node) {
    if (!node) return;

    if (order === 'pre') {
      result.push(node.value);
    }

    walk(node.left);

    if (order === 'in') {
      result.push(node.value);
    }

    walk(node.right);

    if (order === 'post') {
      result.push(node.value);
    }
  }

  walk(root);
  return result;
}

const ORDER_INFO = {
  pre: {
    title: 'Pre-order',
    rule: 'Root → Left → Right'
  },
  in: {
    title: 'In-order',
    rule: 'Left → Root → Right'
  },
  post: {
    title: 'Post-order',
    rule: 'Left → Right → Root'
  }
};

/* ==========================================
   GENERATE DFS STEPS
   ========================================== */

function traversalSteps(root, order) {
  // Pre-order: actual iterative DFS with a LIFO stack.
  if (order === 'pre') {
    const stack = [root];
    const visited = [];

    const steps = [{
      current: null,
      visited: [],
      pending: [root.value],
      description:
        `Node ${root.value} is on the stack. ` +
        'Which node comes off first?'
    }];

    while (stack.length > 0) {
      const node = stack.pop();

      visited.push(node.value);

      // Push right first so left is visited first.
      if (node.right) stack.push(node.right);
      if (node.left) stack.push(node.left);

      const pending = [...stack]
        .reverse()
        .map(item => item.value);

      const pushed = [
        node.right,
        node.left
      ]
        .filter(Boolean)
        .map(item => item.value);

      const detail = pushed.length
        ? `Push ${pushed.join(', then ')}. ` +
          `${pending[0]} is now on top.`
        : 'This node is a leaf, so continue with the stack.';

      steps.push({
        current: node.value,
        visited: [...visited],
        pending,
        description:
          `Visit ${node.value}. ${detail}` +
          (
            pending.length
              ? ''
              : ' The traversal is complete.'
          )
      });
    }

    return steps;
  }

  // In-order and post-order:
  // Display the visit sequence, not a LIFO stack.
  const sequence = orderValues(root, order);

  const steps = [{
    current: null,
    visited: [],
    pending: [...sequence],
    description:
      `${ORDER_INFO[order].title} uses ` +
      `${ORDER_INFO[order].rule}. ` +
      'Predict the first visit.'
  }];

  sequence.forEach((value, index) => {
    const reason = order === 'in'
      ? 'The left subtree is handled before the node, ' +
        'then the right.'
      : 'Both subtrees are handled before their parent.';

    steps.push({
      current: value,
      visited: sequence.slice(0, index + 1),
      pending: sequence.slice(index + 1),
      description:
        `Visit ${value}. ${reason}` +
        (
          index === sequence.length - 1
            ? ' All nodes have been visited.'
            : ''
        )
    });
  });

  return steps;
}

/* ==========================================
   HIGHLIGHTED EXPLANATIONS
   ========================================== */

function makeCallout(title, initial = '') {
  const box = el('div', 'explorer-callout');

  const heading = el(
    'strong',
    'explorer-callout-title',
    title
  );

  const message = el(
    'p',
    'explorer-callout-text',
    initial
  );

  box.append(heading, message);
  box.setAttribute('aria-live', 'polite');

  return {
    box,
    heading,
    message
  };
}

function say(callout, heading, message) {
  callout.heading.textContent = heading;
  callout.message.textContent = message;

  callout.box.classList.remove('is-flash');

  // Restart the explanation highlight animation.
  void callout.box.offsetWidth;

  callout.box.classList.add('is-flash');
}

/* ==========================================
   TREE VIEW WITH LEGEND
   ========================================== */

function makeTreeView(kind = 'dfs') {
  const frame = el('div', 'explorer-tree-frame');

  const viewport = el(
    'div',
    'explorer-tree-viewport'
  );

  const svg = svgEl('svg', {
    class: 'explorer-svg',
    role: 'group',
    'aria-label': 'Interactive binary search tree'
  });

  viewport.appendChild(svg);

  const legend = el('div', 'explorer-legend');

  const items = kind === 'build'
    ? [
        ['○', 'Node', 'normal'],
        ['●', 'Comparing', 'current'],
        ['↗', 'Path', 'path'],
        ['+', 'New', 'added']
      ]
    : kind === 'challenge'
      ? [
          ['○', 'Not selected', 'normal'],
          ['#', 'Selected', 'visited'],
          ['×', 'Try again', 'error']
        ]
      : [
          ['○', 'Not visited', 'normal'],
          ['●', 'Current', 'current'],
          ['✓', 'Visited', 'visited'],
          ['◌', 'Waiting', 'pending']
        ];

  const waitingLabel = el(
    'span',
    '',
    'Waiting'
  );

  items.forEach(([symbol, label, type]) => {
    const item = el(
      'span',
      'explorer-legend-item'
    );

    const caption = type === 'pending'
      ? waitingLabel
      : document.createTextNode(label);

    item.append(
      el(
        'span',
        `explorer-legend-dot ${type}`,
        symbol
      ),
      caption
    );

    legend.appendChild(item);
  });

  frame.append(viewport, legend);

  return {
    frame,
    svg,
    waitingLabel
  };
}

/* ==========================================
   DRAW INTERACTIVE TREE
   ========================================== */

function drawTree(view, root, state, onPick) {
  const svg = view.svg;
  svg.replaceChildren();

  const entries = [];

  function collect(node, depth = 0) {
    if (!node) return;

    collect(node.left, depth + 1);

    entries.push({
      node,
      depth
    });

    collect(node.right, depth + 1);
  }

  collect(root);

  if (entries.length === 0) return;

  const width = Math.max(
    670,
    entries.length * 91
  );

  const depth = Math.max(
    ...entries.map(entry => entry.depth)
  );

  const height = Math.max(
    320,
    115 + depth * 102
  );

  svg.setAttribute(
    'viewBox',
    `0 0 ${width} ${height}`
  );

  const positions = new Map();

  entries.forEach(({ node, depth }, index) => {
    const x = entries.length === 1
      ? width / 2
      : 55 + index * (width - 110) /
        (entries.length - 1);

    positions.set(node, {
      x,
      y: 53 + depth * 102
    });
  });

  const path = new Set(state.path || []);
  const visited = state.visited || [];
  const pending = state.pending || [];

  // Draw connections behind nodes.
  entries.forEach(({ node }) => {
    if (!node.parent) return;

    const parent = positions.get(node.parent);
    const child = positions.get(node);

    const inPath =
      path.has(node.value) &&
      path.has(node.parent.value);

    svg.appendChild(svgEl('line', {
      x1: parent.x,
      y1: parent.y,
      x2: child.x,
      y2: child.y,
      class:
        'explorer-edge' +
        (inPath ? ' is-path' : '')
    }));
  });

  // Draw interactive nodes.
  entries.forEach(({ node }) => {
    const { x, y } = positions.get(node);

    const classes = ['explorer-node'];

    const visitedIndex = visited.indexOf(
      node.value
    );

    if (node.value === state.current) {
      classes.push('is-current');
    } else if (visitedIndex >= 0) {
      classes.push('is-visited');
    } else if (pending.includes(node.value)) {
      classes.push('is-pending');
    }

    if (path.has(node.value)) {
      classes.push('is-path');
    }

    if (node.value === state.added) {
      classes.push('is-added');
    }

    if (node.value === state.error) {
      classes.push('is-error');
    }

    if (node.value === state.selected) {
      classes.push('is-selected');
    }

    const group = svgEl('g', {
      class: classes.join(' '),
      role: 'button',
      tabindex: '0',
      'data-value': node.value,
      'aria-label':
        `Node ${node.value}. ` +
        (
          node.parent
            ? `Child of ${node.parent.value}.`
            : 'Root.'
        )
    });

    const label = svgEl('text', {
      x,
      y,
      class: 'explorer-node-value'
    });

    label.textContent = String(node.value);

    const tag = svgEl('text', {
      x,
      y: y + 42,
      class: 'explorer-node-tag'
    });

    tag.textContent =
      node.value === state.current
        ? 'NOW'
        : visitedIndex >= 0
          ? `#${visitedIndex + 1}`
          : pending.includes(node.value)
            ? 'WAIT'
            : '';

    group.append(
      svgEl('circle', {
        cx: x,
        cy: y,
        r: 25
      }),
      label,
      tag
    );

    const choose = () => onPick(node);

    group.addEventListener('click', choose);

    group.addEventListener('keydown', event => {
      if (
        event.key === 'Enter' ||
        event.key === ' '
      ) {
        event.preventDefault();
        choose();
        return;
      }

      const moves = {
        ArrowUp: node.parent,
        ArrowDown: node.left || node.right,
        ArrowLeft: node.left,
        ArrowRight: node.right
      };

      if (!(event.key in moves)) return;

      event.preventDefault();

      const target = moves[event.key];

      if (target) {
        svg.querySelector(
          `[data-value="${target.value}"]`
        )?.focus();
      }
    });

    svg.appendChild(group);
  });
}

function renderTrail(target, numbers, blankText) {
  target.replaceChildren();

  if (numbers.length === 0) {
    target.appendChild(
      el('span', 'explorer-muted', blankText)
    );
    return;
  }

  numbers.forEach((value, index) => {
    target.appendChild(
      el(
        'span',
        'explorer-trail-chip',
        String(value)
      )
    );

    if (index < numbers.length - 1) {
      target.appendChild(
        el('span', 'explorer-arrow', '→')
      );
    }
  });
}

/* ==========================================
   MAIN SCREEN
   ========================================== */

export function render(screen, container) {
  const page = el('main', 'explorer-page');

  let root = makeTree(START_VALUES);
  let addedValues = [];

  let activeTab = 0;

  // BST insertion state
  let pendingInsert = null;
  let lastAdded = null;
  let selectedBuild = null;

  // DFS exploration state
  let labOrder = 'pre';
  let labSteps = traversalSteps(root, labOrder);
  let labIndex = 0;
  let labTimer = null;
  let selectedLab = null;

  // Challenge state
  let challengeOrder = 'in';
  let challengeVisited = [];
  let challengeWrong = null;

  // ------------------------------------------
  // PAGE HEADER
  // ------------------------------------------

  const intro = el('header', 'explorer-intro');

  intro.append(
    el('h1', '', 'DFS Explorer'),
    el(
      'p',
      'explorer-muted',
      'A new tree, new values and three ways to apply ' +
      'what you learned. Build it, explore it, then ' +
      'solve a traversal challenge.'
    )
  );

  // ------------------------------------------
  // THREE TABS
  // ------------------------------------------

  const tabInfo = [
    ['build', '1. Build the BST'],
    ['run', '2. Run DFS'],
    ['challenge', '3. Challenge']
  ];

  const tabBar = el('div', 'explorer-tabs');
  tabBar.setAttribute('role', 'tablist');

  const panels = tabInfo.map(([id]) => {
    const panel = el(
      'section',
      'explorer-panel'
    );

    panel.id = `explorer-panel-${id}`;
    panel.setAttribute('role', 'tabpanel');

    panel.setAttribute(
      'aria-labelledby',
      `explorer-tab-${id}`
    );

    panel.tabIndex = -1;

    return panel;
  });

  const tabButtons = tabInfo.map(([id, label], i) => {
    const tab = button(label, 'explorer-tab');

    tab.id = `explorer-tab-${id}`;
    tab.setAttribute('role', 'tab');

    tab.setAttribute(
      'aria-controls',
      panels[i].id
    );

    tab.addEventListener('click', () => {
      showTab(i);
    });

    tabBar.appendChild(tab);

    return tab;
  });

  function showTab(index) {
    if (index < 0 || index >= panels.length) {
      return;
    }

    if (activeTab === 1 && index !== 1) {
      stopLab();
    }

    activeTab = index;

    panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });

    tabButtons.forEach((tab, i) => {
      const selected = i === index;

      tab.classList.toggle(
        'is-active',
        selected
      );

      tab.setAttribute(
        'aria-selected',
        String(selected)
      );

      tab.tabIndex = selected ? 0 : -1;
    });
  }

  tabBar.addEventListener('keydown', event => {
    const current = tabButtons.indexOf(
      document.activeElement
    );

    if (current < 0) return;

    let next = null;

    if (event.key === 'ArrowRight') {
      next = (current + 1) % 3;
    }

    if (event.key === 'ArrowLeft') {
      next = (current + 2) % 3;
    }

    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 2;

    if (next !== null) {
      event.preventDefault();
      showTab(next);
      tabButtons[next].focus();
    }
  });

  /* ==========================================
     TAB 1 — BUILD A BST
     ========================================== */

  const buildLayout = el(
    'div',
    'explorer-layout'
  );

  const buildTreeCard = el(
    'article',
    'explorer-card'
  );

  const buildTreeView = makeTreeView('build');

  const buildCount = el(
    'span',
    'explorer-count'
  );

  const buildHeading = el(
    'div',
    'explorer-heading'
  );

  buildHeading.append(
    el('h2', '', 'Your Binary Search Tree'),
    buildCount
  );

  const buildTrail = el(
    'div',
    'explorer-trail'
  );

  buildTreeCard.append(
    buildHeading,
    buildTreeView.frame,
    el(
      'strong',
      'explorer-small-heading',
      'Comparison path'
    ),
    buildTrail
  );

  const buildSide = el(
    'div',
    'explorer-side'
  );

  const buildCard = el(
    'article',
    'explorer-card explorer-task'
  );

  buildCard.append(
    el(
      'span',
      'explorer-eyebrow',
      'YOUR DECISION'
    ),
    el(
      'h2',
      '',
      'Where should the new value go?'
    ),
    el(
      'p',
      'explorer-muted',
      'Choose a value and work through the comparisons. ' +
      'A wrong choice gives feedback so you can try again.'
    )
  );

  const buildForm = el(
    'form',
    'explorer-form'
  );

  const buildLabel = el(
    'label',
    '',
    'Value to insert'
  );

  const buildInput = el('input');

  buildInput.type = 'number';
  buildInput.min = '0';
  buildInput.max = '99';
  buildInput.step = '1';
  buildInput.value = '68';
  buildInput.id = 'explorer-value';

  buildLabel.htmlFor = buildInput.id;

  const buildStart = button(
    'Start insertion',
    'explorer-btn explorer-primary'
  );

  buildStart.type = 'submit';

  buildForm.append(
    buildLabel,
    buildInput,
    buildStart
  );

  const suggestions = el(
    'div',
    'explorer-suggestions'
  );

  suggestions.append(
    el('span', 'explorer-muted', 'Try: ')
  );

  [68, 22, 83].forEach(value => {
    const preset = button(
      String(value),
      'explorer-chip'
    );

    preset.addEventListener('click', () => {
      buildInput.value = String(value);
      buildInput.focus();
    });

    suggestions.appendChild(preset);
  });

  const buildCallout = makeCallout(
    'Try an insertion',
    'Start with 68. Compare each value with the nodes you meet.'
  );

  const buildChoices = el(
    'div',
    'explorer-choices'
  );

  const goLeft = button('← Go left');
  const goRight = button('Go right →');
  const insertHint = button('Hint');
  const cancelInsert = button('Cancel');

  buildChoices.append(
    goLeft,
    goRight,
    insertHint,
    cancelInsert
  );

  const resetTree = button(
    'Reset original tree',
    'explorer-btn explorer-reset'
  );

  buildCard.append(
    buildForm,
    suggestions,
    buildCallout.box,
    buildChoices,
    resetTree
  );

  buildSide.appendChild(buildCard);

  buildLayout.append(
    buildTreeCard,
    buildSide
  );

  panels[0].appendChild(buildLayout);

  function updateBuild() {
    const state = {
      current:
        pendingInsert?.current.value ?? null,
      path: pendingInsert?.path ?? [],
      added: lastAdded,
      selected: selectedBuild
    };

    drawTree(
      buildTreeView,
      root,
      state,
      node => {
        selectedBuild = node.value;

        updateBuild();

        const position = node.parent
          ? (
              node.parent.left === node
                ? 'left'
                : 'right'
            ) + ` child of ${node.parent.value}`
          : 'root of the tree';

        say(
          buildCallout,
          `Node ${node.value}`,
          `This node is the ${position}. ` +
          (
            node.left || node.right
              ? 'It has children.'
              : 'It is a leaf.'
          )
        );
      }
    );

    buildCount.textContent =
      `${inorderNodes(root).length} nodes`;

    renderTrail(
      buildTrail,
      pendingInsert?.path ?? [],
      'No comparisons yet.'
    );

    buildInput.disabled = Boolean(pendingInsert);
    buildStart.disabled = Boolean(pendingInsert);

    [
      goLeft,
      goRight,
      insertHint,
      cancelInsert
    ].forEach(control => {
      control.hidden = !pendingInsert;
    });
  }

  function startInsertion(raw) {
    const value = Number(raw);

    if (
      !raw.trim() ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 99
    ) {
      say(
        buildCallout,
        'Check the value',
        'Enter a whole number from 0 to 99.'
      );
      return;
    }

    if (find(root, value)) {
      say(
        buildCallout,
        'Duplicate value',
        `${value} already exists. ` +
        'A BST cannot contain duplicate keys.'
      );
      return;
    }

    if (inorderNodes(root).length >= MAX_NODES) {
      say(
        buildCallout,
        'Tree limit',
        'This exercise allows a maximum of 15 nodes. ' +
        'Reset the tree to try again.'
      );
      return;
    }

    lastAdded = null;
    selectedBuild = null;

    pendingInsert = {
      value,
      current: root,
      path: []
    };

    updateBuild();

    say(
      buildCallout,
      'Your turn',
      `Compare ${value} with ${root.value}. ` +
      'Should you move left or right?'
    );
  }

  buildForm.addEventListener('submit', event => {
    event.preventDefault();

    startInsertion(buildInput.value);
  });

  function chooseSide(side) {
    if (!pendingInsert) return;

    const { value, current } = pendingInsert;

    const expected = value < current.value
      ? 'left'
      : 'right';

    const relation = expected === 'left'
      ? '<'
      : '>';

    if (side !== expected) {
      say(
        buildCallout,
        'Try again',
        `${value} ${relation} ${current.value}. ` +
        'Recheck whether smaller values go left ' +
        'or larger values go right.'
      );
      return;
    }

    pendingInsert.path.push(current.value);

    if (current[side]) {
      pendingInsert.current = current[side];

      updateBuild();

      say(
        buildCallout,
        'Correct comparison',
        `${value} ${relation} ${current.value}: ` +
        `move ${side}. Now compare ${value} with ` +
        `${pendingInsert.current.value}.`
      );
    } else {
      // Correctly reached an empty child position.
      root = insert(root, value);

      addedValues.push(value);
      lastAdded = value;
      pendingInsert = null;

      updateBuild();

      // The changed tree invalidates old saved traversals.
      Object.keys(savedOrders).forEach(key => {
        delete savedOrders[key];
      });

      updateSavedComparison();
      resetLab();
      resetChallenge();

      say(
        buildCallout,
        'Inserted successfully!',
        `${value} ${relation} ${current.value}. ` +
        `The ${side} position was empty, so ${value} ` +
        `is now a child of ${current.value}. ` +
        'Try Run DFS to see what changes.'
      );
    }
  }

  goLeft.addEventListener('click', () => {
    chooseSide('left');
  });

  goRight.addEventListener('click', () => {
    chooseSide('right');
  });

  insertHint.addEventListener('click', () => {
    if (!pendingInsert) return;

    const { value, current } = pendingInsert;

    say(
      buildCallout,
      'Hint',
      `${value} ${value < current.value ? '<' : '>'} ` +
      `${current.value}. Choose ` +
      `${value < current.value ? 'left' : 'right'}.`
    );
  });

  cancelInsert.addEventListener('click', () => {
    pendingInsert = null;

    updateBuild();

    say(
      buildCallout,
      'Cancelled',
      'Choose a value and start again when ready.'
    );
  });

  resetTree.addEventListener('click', () => {
    root = makeTree(START_VALUES);
    addedValues = [];

    pendingInsert = null;
    selectedBuild = null;
    lastAdded = null;

    buildInput.value = '68';

    updateBuild();

    Object.keys(savedOrders).forEach(key => {
      delete savedOrders[key];
    });

    updateSavedComparison();
    resetLab();
    resetChallenge();

    say(
      buildCallout,
      'Tree restored',
      'The original example tree is back. ' +
      'Try a new value.'
    );
  });

  /* ==========================================
     TAB 2 — RUN DFS
     ========================================== */

  const lab = el('div', 'explorer-lab');

  const labToolbar = el(
    'div',
    'explorer-order-tabs'
  );

  const labOrderButtons = {};

  Object.entries(ORDER_INFO).forEach(
    ([key, info]) => {
      const control = button(
        info.title,
        'explorer-order'
      );

      control.setAttribute(
        'aria-pressed',
        'false'
      );

      control.addEventListener('click', () => {
        labOrder = key;
        resetLab();
      });

      labOrderButtons[key] = control;
      labToolbar.appendChild(control);
    }
  );

  const labRule = el(
    'span',
    'explorer-rule'
  );

  labToolbar.appendChild(labRule);

  const labLayout = el(
    'div',
    'explorer-layout'
  );

  const labTreeCard = el(
    'article',
    'explorer-card'
  );

  const labView = makeTreeView();

  const labVisited = el(
    'div',
    'explorer-trail'
  );

  labTreeCard.append(
    el('h2', '', 'Follow the traversal'),
    labView.frame,
    el(
      'strong',
      'explorer-small-heading',
      'Visited order'
    ),
    labVisited
  );

  // Compact comparison of the runs students finish.
  const savedOrders = {};

  const comparison = el(
    'details',
    'explorer-comparison'
  );

  comparison.appendChild(
    el(
      'summary',
      '',
      'Compare completed traversals'
    )
  );

  const comparisonContent = el(
    'div',
    'explorer-comparison-content'
  );

  comparison.appendChild(comparisonContent);
  labTreeCard.appendChild(comparison);

  const labSide = el(
    'div',
    'explorer-side'
  );

  const stackCard = el(
    'article',
    'explorer-card explorer-stack-card'
  );

  const stackTitle = el(
    'h2',
    '',
    'Live stack'
  );

  const stackSub = el(
    'p',
    'explorer-muted'
  );

  const stackContents = el(
    'div',
    'explorer-stack'
  );

  stackCard.append(
    stackTitle,
    stackSub,
    stackContents
  );

  const labCallout = makeCallout(
    'Ready',
    'Choose a traversal and begin.'
  );

  const labActivity = el(
    'article',
    'explorer-card explorer-task'
  );

  labActivity.append(
    el(
      'span',
      'explorer-eyebrow',
      'OPTIONAL PREDICTION'
    ),
    el(
      'h2',
      '',
      'Which node comes next?'
    )
  );

  const guesses = el(
    'div',
    'explorer-guess-buttons'
  );

  const guessFeedback = el(
    'p',
    'explorer-feedback'
  );

  guessFeedback.setAttribute(
    'aria-live',
    'polite'
  );

  const labControls = el(
    'div',
    'explorer-controls'
  );

  const labNext = button(
    'Reveal Next Step →',
    'explorer-btn explorer-primary'
  );

  const labPrev = button('← Previous');
  const labPlay = button('Play');
  const labRestart = button('Restart');

  const labSpeed = el(
    'select',
    'explorer-speed'
  );

  [
    ['1800', 'Slow'],
    ['1100', 'Normal'],
    ['650', 'Fast']
  ].forEach(([value, label]) => {
    const option = el('option', '', label);

    option.value = value;
    labSpeed.appendChild(option);
  });

  labSpeed.value = '1100';

  labSpeed.setAttribute(
    'aria-label',
    'Playback speed'
  );

  const labCounter = el(
    'span',
    'explorer-counter'
  );

  labControls.append(
    labNext,
    labPrev,
    labPlay,
    labRestart,
    labSpeed,
    labCounter
  );

  labActivity.append(
    guesses,
    guessFeedback,
    labControls
  );

  labSide.append(
    stackCard,
    labCallout.box,
    labActivity
  );

  labLayout.append(
    labTreeCard,
    labSide
  );

  lab.append(
    labToolbar,
    labLayout
  );

  panels[1].appendChild(lab);

  function stopLab() {
    if (labTimer !== null) {
      clearInterval(labTimer);
    }

    labTimer = null;
    labPlay.textContent = 'Play';
  }

  function resetLab() {
    stopLab();

    labSteps = traversalSteps(
      root,
      labOrder
    );

    labIndex = 0;
    selectedLab = null;

    refreshLab();
  }

  function updateSavedComparison() {
    comparisonContent.replaceChildren();

    if (!Object.keys(savedOrders).length) {
      comparisonContent.append(
        el(
          'p',
          'explorer-muted',
          'Complete a traversal to record its sequence.'
        )
      );
    }

    Object.entries(savedOrders).forEach(
      ([key, sequence]) => {
        comparisonContent.appendChild(
          el(
            'p',
            '',
            `${ORDER_INFO[key].title}: ` +
            sequence.join(' → ')
          )
        );
      }
    );
  }

  function refreshLab() {
    const step = labSteps[labIndex];

    labView.waitingLabel.textContent =
      labOrder === 'pre'
        ? 'On stack'
        : 'Upcoming';

    drawTree(
      labView,
      root,
      {
        current: step.current,
        visited: step.visited,
        pending: step.pending,
        selected: selectedLab
      },
      node => {
        selectedLab = node.value;

        refreshLab();

        say(
          labCallout,
          `Node ${node.value}`,
          node.parent
            ? `This node has parent ${node.parent.value}. ` +
              'Explore the subtrees to discover when it is visited.'
            : 'This is the root of the tree.'
        );
      }
    );

    renderTrail(
      labVisited,
      step.visited,
      'No nodes visited yet.'
    );

    Object.entries(labOrderButtons).forEach(
      ([key, control]) => {
        control.setAttribute(
          'aria-pressed',
          String(key === labOrder)
        );
      }
    );

    labRule.textContent =
      ORDER_INFO[labOrder].rule;

    stackTitle.textContent =
      labOrder === 'pre'
        ? 'Live stack (LIFO)'
        : 'Upcoming visits';

    stackSub.textContent =
      labOrder === 'pre'
        ? 'The top of the stack is visited next. ' +
          'Right children are pushed before left children.'
        : 'This is the traversal sequence, not a LIFO stack.';

    stackContents.replaceChildren();

    if (!step.pending.length) {
      stackContents.append(
        el(
          'p',
          'explorer-muted',
          'Nothing left to visit.'
        )
      );
    }

    step.pending.forEach((value, index) => {
      const item = el(
        'div',
        'explorer-stack-row'
      );

      item.append(
        el('strong', '', String(value))
      );

      if (index === 0) {
        item.append(
          el(
            'span',
            'explorer-stack-top',
            labOrder === 'pre' ? 'TOP' : 'NEXT'
          )
        );
      }

      stackContents.appendChild(item);
    });

    // Prediction is optional.
    guesses.replaceChildren();

    guessFeedback.textContent = '';
    guessFeedback.className = 'explorer-feedback';

    const finished =
      labIndex === labSteps.length - 1;

    if (!finished) {
      const correct =
        labSteps[labIndex + 1].current;

      const distractors = inorderNodes(root)
        .map(node => node.value)
        .filter(
          value =>
            value !== correct &&
            !step.visited.includes(value)
        )
        .slice(0, 2);

      if (distractors.length < 2) {
        inorderNodes(root)
          .map(node => node.value)
          .forEach(value => {
            if (
              value !== correct &&
              !distractors.includes(value) &&
              distractors.length < 2
            ) {
              distractors.push(value);
            }
          });
      }

      [
        correct,
        ...distractors,
        'Not sure'
      ].forEach(value => {
        const choice = button(
          String(value),
          'explorer-guess'
        );

        choice.setAttribute(
          'aria-pressed',
          'false'
        );

        choice.addEventListener('click', () => {
          guesses.querySelectorAll('button')
            .forEach(other => {
              other.setAttribute(
                'aria-pressed',
                String(other === choice)
              );
            });

          const good = value === correct;

          guessFeedback.className =
            `explorer-feedback ${
              good ? 'is-correct' : 'is-review'
            }`;

          guessFeedback.textContent = good
            ? `Correct! ${correct} is next.`
            : `Next is ${correct}. Look at the ` +
              (
                labOrder === 'pre'
                  ? 'stack'
                  : 'traversal rule'
              ) +
              ' and try the next step.';

          say(
            labCallout,
            'Prediction feedback',
            guessFeedback.textContent
          );
        });

        guesses.appendChild(choice);
      });
    } else {
      guesses.append(
        el(
          'p',
          'explorer-muted',
          'Finished! Try another order and compare.'
        )
      );

      savedOrders[labOrder] = [
        ...step.visited
      ];

      updateSavedComparison();
    }

    labPrev.disabled = labIndex === 0;
    labNext.disabled = finished;
    labPlay.disabled = finished;

    labNext.textContent = finished
      ? 'Traversal complete ✓'
      : 'Reveal Next Step →';

    labCounter.textContent =
      `Step ${labIndex} of ${labSteps.length - 1}`;

    say(
      labCallout,
      finished
        ? 'Traversal complete'
        : labIndex
          ? `Step ${labIndex}: visit ${step.current}`
          : 'Ready to begin',
      step.description
    );
  }

  function labAdvance() {
    if (labIndex >= labSteps.length - 1) {
      return;
    }

    labIndex++;
    selectedLab = null;

    refreshLab();

    if (labIndex === labSteps.length - 1) {
      stopLab();
    }
  }

  labNext.addEventListener('click', () => {
    stopLab();
    labAdvance();
  });

  labPrev.addEventListener('click', () => {
    stopLab();

    if (labIndex > 0) {
      labIndex--;
      refreshLab();
    }
  });

  labRestart.addEventListener(
    'click',
    resetLab
  );

  labPlay.addEventListener('click', () => {
    if (labTimer !== null) {
      stopLab();
      return;
    }

    if (labIndex >= labSteps.length - 1) {
      return;
    }

    labPlay.textContent = 'Pause';

    labTimer = setInterval(
      labAdvance,
      Number(labSpeed.value)
    );
  });

  labSpeed.addEventListener('change', () => {
    if (labTimer === null) return;

    stopLab();
    labPlay.click();
  });

  /* ==========================================
     TAB 3 — TRAVERSAL CHALLENGE
     ========================================== */

  const challengeToolbar = el(
    'div',
    'explorer-order-tabs'
  );

  const challengeOrderButtons = {};

  Object.entries(ORDER_INFO).forEach(
    ([key, info]) => {
      const control = button(
        info.title,
        'explorer-order'
      );

      control.addEventListener('click', () => {
        challengeOrder = key;
        resetChallenge();
      });

      challengeOrderButtons[key] = control;
      challengeToolbar.appendChild(control);
    }
  );

  const challengeRule = el(
    'span',
    'explorer-rule'
  );

  challengeToolbar.appendChild(challengeRule);

  const challengeLayout = el(
    'div',
    'explorer-layout'
  );

  const challengeTreeCard = el(
    'article',
    'explorer-card'
  );

  const challengeTreeView = makeTreeView(
    'challenge'
  );

  const challengeTrail = el(
    'div',
    'explorer-trail'
  );

  challengeTreeCard.append(
    el(
      'h2',
      '',
      'Click the nodes in order'
    ),
    el(
      'p',
      'explorer-muted',
      'Choose each node on the tree. Correct choices ' +
      'are numbered. Wrong choices can be retried.'
    ),
    challengeTreeView.frame,
    el(
      'strong',
      'explorer-small-heading',
      'Your traversal'
    ),
    challengeTrail
  );

  const challengeSide = el(
    'div',
    'explorer-side'
  );

  const challengeCard = el(
    'article',
    'explorer-card explorer-task'
  );

  const challengeCount = el(
    'p',
    'explorer-muted'
  );

  const challengeCallout = makeCallout(
    'Your challenge',
    'Select the first node to visit.'
  );

  const challengeHint = button(
    'Show a hint'
  );

  const challengeRestart = button(
    'Start over'
  );

  const challengeActions = el(
    'div',
    'explorer-choices'
  );

  challengeActions.append(
    challengeHint,
    challengeRestart
  );

  challengeCard.append(
    el(
      'span',
      'explorer-eyebrow',
      'APPLY WHAT YOU LEARNED'
    ),
    el(
      'h2',
      '',
      'Build the full traversal'
    ),
    challengeCount,
    challengeCallout.box,
    challengeActions
  );

  challengeSide.appendChild(challengeCard);

  challengeLayout.append(
    challengeTreeCard,
    challengeSide
  );

  panels[2].append(
    challengeToolbar,
    challengeLayout
  );

  function resetChallenge() {
    challengeVisited = [];
    challengeWrong = null;

    refreshChallenge();

    say(
      challengeCallout,
      'Your challenge',
      `Click the first node using ` +
      `${ORDER_INFO[challengeOrder].rule}.`
    );
  }

  function refreshChallenge() {
    Object.entries(challengeOrderButtons)
      .forEach(([key, control]) => {
        control.setAttribute(
          'aria-pressed',
          String(key === challengeOrder)
        );
      });

    challengeRule.textContent =
      ORDER_INFO[challengeOrder].rule;

    const expected = orderValues(
      root,
      challengeOrder
    );

    const done =
      challengeVisited.length === expected.length;

    drawTree(
      challengeTreeView,
      root,
      {
        visited: challengeVisited,
        current: null,
        error: challengeWrong
      },
      node => {
        if (
          challengeVisited.includes(node.value) ||
          done
        ) {
          return;
        }

        const next =
          expected[challengeVisited.length];

        if (node.value !== next) {
          challengeWrong = node.value;

          refreshChallenge();

          say(
            challengeCallout,
            'Try another node',
            `Not ${node.value} yet. Use ` +
            `${ORDER_INFO[challengeOrder].rule}. ` +
            'You can ask for a hint or try again.'
          );

          return;
        }

        challengeWrong = null;
        challengeVisited.push(node.value);

        refreshChallenge();

        const complete =
          challengeVisited.length === expected.length;

        say(
          challengeCallout,
          complete
            ? 'Challenge complete!'
            : 'Correct node!',
          complete
            ? `You discovered the ` +
              `${ORDER_INFO[challengeOrder].title.toLowerCase()} ` +
              `sequence: ${expected.join(' → ')}. ` +
              'Try another traversal to compare.'
            : `${node.value} is visit ` +
              `#${challengeVisited.length}. ` +
              'Choose the next node.'
        );
      }
    );

    renderTrail(
      challengeTrail,
      challengeVisited,
      'Click the first node in the tree.'
    );

    challengeCount.textContent =
      `${challengeVisited.length} of ` +
      `${expected.length} nodes selected`;

    challengeHint.disabled = done;
  }

  challengeHint.addEventListener('click', () => {
    const expected = orderValues(
      root,
      challengeOrder
    );

    if (
      challengeVisited.length >= expected.length
    ) {
      return;
    }

    const next =
      expected[challengeVisited.length];

    say(
      challengeCallout,
      'Hint',
      `The next correct node is ${next}. ` +
      `The rule is ${ORDER_INFO[challengeOrder].rule}.`
    );
  });

  challengeRestart.addEventListener(
    'click',
    resetChallenge
  );

  /* ==========================================
     BOTTOM NAVIGATION
     ========================================== */

  const navigation = el(
    'nav',
    'explorer-navigation'
  );

  const back = el(
    'a',
    'explorer-btn',
    '← DFS Introduction'
  );

  back.href = '#/concept-idea';

  const forward = el(
    'a',
    'explorer-btn explorer-primary',
    'Next: Practice →'
  );

  forward.href = '#/practice';

  navigation.append(back, forward);

  page.append(
    intro,
    tabBar,
    ...panels,
    navigation
  );

  container.appendChild(page);

  // Initial render.
  updateBuild();
  updateSavedComparison();
  resetLab();
  resetChallenge();
  showTab(0);

  // Cleanup for router navigation.
  return () => {
    stopLab();
  };
}
