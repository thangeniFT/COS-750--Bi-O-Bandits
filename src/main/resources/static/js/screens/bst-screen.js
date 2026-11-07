
/**
 * BST Introduction — Figma Page 2.
 * Diagnostic warm-up, interactive tree and assessment.
 *
 * The example runs locally in the browser.
 * The backend-powered DFS explorer is separate.
 */



const EXAMPLE = [50, 30, 70, 20, 40, 60, 80];
const MAX_NODES = 15;
const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = text;
  return node;
}

function svgEl(tag, attributes = {}) {
  const node = document.createElementNS(SVG_NS, tag);

  for (const [key, value] of Object.entries(attributes)) {
    node.setAttribute(key, String(value));
  }

  return node;
}

function createNode(value, parent = null) {
  return {
    value,
    parent,
    left: null,
    right: null
  };
}

function buildExample() {
  const root = createNode(EXAMPLE[0]);

  for (const value of EXAMPLE.slice(1)) {
    let current = root;

    while (true) {
      const side = value < current.value ? 'left' : 'right';

      if (current[side]) {
        current = current[side];
      } else {
        current[side] = createNode(value, current);
        break;
      }
    }
  }

  return root;
}

function countNodes(node) {
  return node
    ? 1 + countNodes(node.left) + countNodes(node.right)
    : 0;
}

function describeNode(node) {
  const facts = [];

  if (!node.parent) {
    facts.push(`${node.value} is the root of the tree.`);
  } else {
    const parent = node.parent;
    const side = parent.left === node ? 'left' : 'right';

    facts.push(
      `${node.value} is the ${side} child of ${parent.value}.`
    );

    facts.push(`${parent.value} is its parent.`);

    const sibling = side === 'left'
      ? parent.right
      : parent.left;

    if (sibling) {
      facts.push(`${sibling.value} is its sibling.`);
    }
  }

  if (!node.left && !node.right) {
    facts.push('It is a leaf because it has no children.');
  } else {
    if (node.left) {
      facts.push(`${node.left.value} is its left child.`);
    }

    if (node.right) {
      facts.push(`${node.right.value} is its right child.`);
    }

    facts.push(
      'This node and all its descendants form a subtree.'
    );
  }

  return facts.join(' ');
}

/**
 * Draws the tree using an in-order layout.
 * All SVG colours come from styles.css.
 */
function drawTree(svg, root, selected, active, newValue, onSelect) {
  svg.replaceChildren();

  const entries = [];

  function collect(node, depth = 0) {
    if (!node) return;
    collect(node.left, depth + 1);
    entries.push({ node, depth });
    collect(node.right, depth + 1);
  }

  collect(root);

  const maxDepth = Math.max(
    0,
    ...entries.map(item => item.depth)
  );

  const width = Math.max(760, entries.length * 88);
  const height = Math.max(320, 125 + maxDepth * 106);

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('aria-label', 'Interactive binary search tree');

  const positions = new Map();

  entries.forEach(({ node, depth }, index) => {
    const x = entries.length === 1
      ? width / 2
      : 65 + index * (width - 130) / (entries.length - 1);

    positions.set(node, {
      x,
      y: 65 + depth * 106
    });
  });

  // Draw connections before circles.
  entries.forEach(({ node }) => {
    if (!node.parent) return;

    const parent = positions.get(node.parent);
    const child = positions.get(node);

    const classes = ['bst-tree-edge'];

    if (node.value === newValue) {
      classes.push('bst-tree-edge--new');
    }

    svg.appendChild(svgEl('line', {
      x1: parent.x,
      y1: parent.y,
      x2: child.x,
      y2: child.y,
      class: classes.join(' ')
    }));
  });

  // Draw clickable nodes.
  entries.forEach(({ node }) => {
    const { x, y } = positions.get(node);

    const classes = ['bst-tree-node'];

    if (node === selected) classes.push('is-selected');
    if (node === active) classes.push('is-active');
    if (node.value === newValue) classes.push('is-new');

  const group = svgEl('g', {
  class: classes.join(' '),
  'data-value': node.value,
  tabindex: 0,
  role: 'button',
  'aria-label': `Node ${node.value}. ${describeNode(node)}`
});

    const circle = svgEl('circle', {
      cx: x,
      cy: y,
      r: 27
    });

    const value = svgEl('text', {
      x,
      y,
      class: 'bst-tree-value'
    });

    value.textContent = String(node.value);
    group.append(circle, value);

    // Show the structural role beneath or above nodes.
    let labelText = '';

    if (!node.parent) {
      labelText = 'ROOT';
    } else if (!node.left && !node.right) {
      labelText = 'LEAF';
    } else {
      labelText = node.parent.left === node
        ? 'LEFT CHILD'
        : 'RIGHT CHILD';
    }

    const label = svgEl('text', {
      x,
      y: node.parent ? y + 45 : y - 39,
      class: 'bst-tree-role'
    });

    label.textContent = labelText;
    group.appendChild(label);

    group.addEventListener('click', () => onSelect(node));

    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(node);
      }
    });

    svg.appendChild(group);
  });
}

function createWarmup(data) {
  const section = el('section', 'bst-card bst-warmup-card');

  section.append(
    el('span', 'bst-eyebrow', '01 / BEFORE WE BEGIN'),
    el('h2', '', 'Quick warm-up'),
    el(
      'p',
      'bst-muted',
      'Check your knowledge of trees and stacks. ' +
      'If something is new, we will explain it.'
    )
  );

  if (!data?.questions) return section;

  const questions = el('div', 'bst-warmup-grid');

  data.questions.forEach((question, index) => {
    const card = el('article', 'bst-warmup-question');

    card.appendChild(
      el('h3', '', `${index + 1}. ${question.prompt}`)
    );

    const choices = el('div', 'bst-answer-options');
    const feedback = el('p', 'bst-answer-feedback');

    feedback.setAttribute('role', 'status');

    question.options.forEach(option => {
      const button = el('button', 'btn bst-answer', option.text);
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        choices.querySelectorAll('button').forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

        feedback.className = option.correct
          ? 'bst-answer-feedback is-correct'
          : 'bst-answer-feedback is-review';

        feedback.textContent = option.correct
          ? 'Correct! Good work.'
          : data.refreshers[question.refresher] ||
            'Review this concept before continuing.';
      });

      choices.appendChild(button);
    });

    card.append(choices, feedback);
    questions.appendChild(card);
  });

  section.appendChild(questions);
  return section;
}

function createRules() {
  const card = el('aside', 'bst-card bst-rules-card');

  card.append(
    el('span', 'bst-eyebrow', 'THE MAIN IDEA'),
    el('h2', '', 'BST ordering rule'),
    el(
      'p',
      'bst-muted',
      'Every node follows these rules, not just the root.'
    )
  );

  const rules = [
    {
      sign: '←',
      title: 'Smaller goes left',
      detail: '30 is smaller than 50, so 30 goes left.'
    },
    {
      sign: '→',
      title: 'Larger goes right',
      detail: '70 is larger than 50, so 70 goes right.'
    },
    {
      sign: '=',
      title: 'No duplicates',
      detail: 'This BST stores each value only once.'
    }
  ];

  rules.forEach(rule => {
    const item = el('div', 'bst-rule-item');

    item.append(
      el('span', 'bst-rule-icon', rule.sign),
      el('h3', '', rule.title),
      el('p', '', rule.detail)
    );

    card.appendChild(item);
  });

  return card;
}

function createKnowledgeCheck() {
  const section = el('section', 'bst-card bst-check-card');

  section.append(
    el('span', 'bst-eyebrow', '04 / CHECK YOUR KNOWLEDGE'),
    el('h2', '', 'Can you apply the BST rule?'),
    el(
      'p',
      '',
      'In the original example tree, where would 65 be inserted?'
    )
  );

  const choices = el('div', 'bst-answer-options');
  const feedback = el('p', 'bst-answer-feedback');

  feedback.setAttribute('role', 'status');

  const answers = [
    ['Left child of 60', false],
    ['Right child of 60', true],
    ['Right child of 80', false]
  ];

  answers.forEach(([label, correct]) => {
    const button = el('button', 'btn bst-answer', label);
    button.type = 'button';

    button.addEventListener('click', () => {
      choices.querySelectorAll('button').forEach(other => {
        other.setAttribute(
          'aria-pressed',
          String(other === button)
        );
      });

      feedback.className = correct
        ? 'bst-answer-feedback is-correct'
        : 'bst-answer-feedback is-review';

      feedback.textContent = correct
        ? 'Correct! 65 is greater than 50, smaller than 70, ' +
          'and greater than 60. It becomes the right child of 60.'
        : 'Follow the comparisons: 65 > 50, ' +
          '65 < 70 and 65 > 60. Try again.';
    });

    choices.appendChild(button);
  });

  section.append(choices, feedback);
  return section;
}

export function render(screen, container) {


  const page = el('div', 'bst-page');

  let root = buildExample();
  let selected = root;
  let active = null;
  let busy = false;
  let destroyed = false;

  const timers = new Set();

  // Cancel pending animation work on screen changes.
  function pause(ms) {
    return new Promise(resolve => {
      const task = { id: null, resolve };

      task.id = setTimeout(() => {
        timers.delete(task);
        resolve();
      }, ms);

      timers.add(task);
    });
  }

  // Introduction
  const intro = el('section', 'bst-card bst-intro-card');

  intro.append(
    el('span', 'bst-eyebrow', 'LEARN / LESSON 1 OF 2'),
    el('h2', '', 'Understanding Binary Search Trees'),
    el(
      'p',
      '',
      'A Binary Search Tree (BST) is a binary tree. ' +
      'Each node stores a value and has at most two children.'
    ),
    el(
      'p',
      'bst-muted',
      'The top node is the root. A parent is connected ' +
      'to its children. A leaf has no children. ' +
      'A subtree is a node together with all its descendants.'
    )
  );

  const title = el('div', 'bst-section-title');

  title.append(
    el('span', 'bst-eyebrow', '02 / EXPLORE'),
    el('h2', '', 'Explore the tree'),
    el(
      'p',
      'bst-muted',
      'Select a node to discover its relationships, ' +
      'or insert a value to see how a BST grows.'
    )
  );

  // Interactive tree card
  const treeCard = el('section', 'bst-card bst-tree-card');


const treeHeading = el('div', 'bst-tree-heading');
const treeHeadingText = el('div', 'bst-tree-heading__text');
const nodeCount = el('span', 'bst-node-count');

treeHeadingText.append(
  el('span', 'bst-eyebrow', 'GET TO KNOW THE TREE'),
  el('h3', '', 'Understanding the Tree Structure'),
  el(
    'p',
    'bst-tree-description',
    'A Binary Search Tree starts at the root. ' +
    'Each node can have a left child and a right child. ' +
    'Nodes without children are called leaves. ' +
    'Select any node below to discover its relationships.'
  )
);

treeHeading.append(treeHeadingText, nodeCount);


  const svg = svgEl('svg', {
    class: 'bst-lesson-svg'
  });

 
const treeViewport = el('div', 'bst-tree-viewport');
treeViewport.appendChild(svg);

// Popup shown when a student clicks a tree node.
const nodePopup = el('div', 'bst-node-popup');
nodePopup.hidden = true;
nodePopup.setAttribute('role', 'dialog');
nodePopup.setAttribute('aria-label', 'Node explanation');

const popupHeader = el('div', 'bst-node-popup__header');
const popupTitle = el('strong', 'bst-node-popup__title');
const popupClose = el('button', 'bst-node-popup__close', '×');

popupClose.type = 'button';
popupClose.setAttribute('aria-label', 'Close node explanation');

const popupBody = el('p', 'bst-node-popup__body');

popupHeader.append(popupTitle, popupClose);
nodePopup.append(popupHeader, popupBody);
treeViewport.appendChild(nodePopup);

popupClose.addEventListener('click', () => {
  nodePopup.hidden = true;
});


  
const treeNote = el('div', 'bst-tree-note');

treeNote.append(
  el('h4', '', 'How to read this tree'),
  el(
    'p',
    '',
    'The tree begins at 50, which is the root. ' +
    'Values smaller than 50 belong in its left subtree, ' +
    'while larger values belong in its right subtree. ' +
    'For example, 30 is the left child of 50, ' +
    'and 70 is the right child.'
  ),
  el(
    'p',
    '',
    'Follow the branches to see how nodes are connected. ' +
    'Click a node to identify its parent, children, ' +
    'siblings, and whether it is a leaf.'
  )
);


  // Legend
  const legend = el('div', 'bst-tree-legend');

  [
    ['Normal', 'normal'],
    ['Comparing', 'comparing'],
    ['Selected', 'selected'],
    ['New', 'new']
  ].forEach(([label, type]) => {
    const item = el('span', 'bst-legend-item');

    item.append(
      el('i', `bst-legend-dot bst-legend-dot--${type}`),
      document.createTextNode(label)
    );

    legend.appendChild(item);
  });

const explanation = el(
  'p',
  'bst-insertion-explanation',
  'Enter any whole number from 0 to 99 to see how ' +
  'the tree compares values and finds the correct position.'
);

  explanation.setAttribute('role', 'status');

  const details = el('div', 'bst-node-details');
  details.setAttribute('role', 'status');

  // Insertion controls
  const form = el('form', 'bst-insert-form');

  const label = el('label', '', 'Insert a value');
  const input = document.createElement('input');

  input.id = 'bst-insert-value';
  input.type = 'number';
  input.min = '0';
  input.max = '99';
  input.step = '1';
input.value = '';
input.placeholder = 'e.g. 65';
  label.htmlFor = input.id;

  const insertButton = el(
    'button',
    'btn btn--primary',
    'Insert '
  );
  insertButton.type = 'submit';

  const resetButton = el('button', 'btn', 'Reset tree');
  resetButton.type = 'button';

  form.append(label, input, insertButton, resetButton);

 treeCard.append(
  treeHeading,
  treeViewport,

  treeNote,
  legend,
  explanation,
  form,
 
);

  const layout = el('div', 'bst-content-grid');
  layout.append(treeCard, createRules());

  function refresh(newValue = null) {
    if (destroyed) return;

    nodeCount.textContent = `${countNodes(root)} nodes`;

    drawTree(
      svg,
      root,
      selected,
      active,
      newValue,
      selectNode
    );
  }

  
function showNodePopup(node) {
  popupTitle.textContent = `Node ${node.value}`;
  popupBody.textContent = describeNode(node);

  nodePopup.hidden = false;

  // Find the SVG node associated with this value.
  const groups = svg.querySelectorAll('.bst-tree-node');

  const selectedGroup = [...groups].find(group =>
    group.getAttribute('data-value') === String(node.value)
  );

  if (!selectedGroup) return;

  const viewportRect = treeViewport.getBoundingClientRect();
  const nodeRect = selectedGroup.getBoundingClientRect();

  // Position the popup in viewport-local coordinates.
  const x = nodeRect.left - viewportRect.left +
    treeViewport.scrollLeft +
    nodeRect.width / 2;

  const y = nodeRect.bottom - viewportRect.top + 12;

  nodePopup.style.left = `${x}px`;
  nodePopup.style.top = `${y}px`;
}

  function selectNode(node) {
     if (busy) return;

  selected = node;
  refresh();
  showNodePopup(node);
  }

  function setBusy(value) {
    busy = value;

    input.disabled = value;
    insertButton.disabled = value;
    resetButton.disabled = value;
  }

  async function insert(value) {
    if (busy || destroyed) return;


    nodePopup.hidden = true;
    if (!Number.isInteger(value) || value < 0 || value > 99) {
      explanation.textContent =
        'Please enter a whole number between 0 and 99.';
      return;
    }

    // Check duplicates first.
    let current = root;

    while (current) {
      if (value === current.value) {
        explanation.textContent =
          `${value} already exists. Duplicates are not allowed.`;
        return;
      }

      current = value < current.value
        ? current.left
        : current.right;
    }

    if (countNodes(root) >= MAX_NODES) {
      explanation.textContent =
        'The tree already contains 15 nodes. Reset to begin again.';
      return;
    }

    setBusy(true);
    current = root;

    while (current && !destroyed) {
      selected = current;
      active = current;

      const direction = value < current.value ? 'left' : 'right';
      const symbol = direction === 'left' ? '<' : '>';

      explanation.textContent =
        `${value} ${symbol} ${current.value}: move ${direction}.`;

      details.textContent = describeNode(current);
      refresh();

      await pause(850);
      if (destroyed) return;

      if (!current[direction]) {
        const added = createNode(value, current);
        current[direction] = added;

        selected = added;
        active = null;

        explanation.textContent =
          `Success! ${value} is the ${direction} child ` +
          `of ${current.value}.`;

        details.textContent = describeNode(added);
        refresh(value);

        setBusy(false);
        return;
      }

      current = current[direction];
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    if (input.value.trim() === '') {
      explanation.textContent = 'Enter a value first.';
      return;
    }

    insert(Number(input.value));
  });

  resetButton.addEventListener('click', () => {
    if (busy) return;
nodePopup.hidden = true;
    root = buildExample();
    selected = root;
    active = null;
   input.value = '';

explanation.textContent =
  'Tree reset. Enter any whole number from 0 to 99 ' +
  'to explore how insertion works.';

    refresh();
  });

  // Assemble the lesson.
  page.append(
    createWarmup(screen.warmup),
    intro,
    title,
    layout,
    createKnowledgeCheck()
  );

  container.appendChild(page);

  details.textContent = describeNode(root);
  refresh();

  return () => {
    destroyed = true;

    for (const task of timers) {
      clearTimeout(task.id);
      task.resolve();
    }

    timers.clear();
  };
}
