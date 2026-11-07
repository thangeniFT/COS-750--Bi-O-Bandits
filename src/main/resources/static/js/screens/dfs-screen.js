
/**
 * DFS Introduction — Figma Page 3
 *
 * Demonstrates iterative, left-first DFS using a stack.
 * This is a local teaching animation; the backend
 * explorer remains on Page 4.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const TREE = [
  { value: 50, x: 300, y: 55, left: 30, right: 70 },
  { value: 30, x: 155, y: 160, left: 20, right: 40 },
  { value: 70, x: 445, y: 160, left: 60, right: 80 },
  { value: 20, x: 75, y: 275, left: null, right: null },
  { value: 40, x: 235, y: 275, left: null, right: null },
  { value: 60, x: 365, y: 275, left: null, right: null },
  { value: 80, x: 525, y: 275, left: null, right: null }
];

const NODE_BY_VALUE = new Map(
  TREE.map(node => [node.value, node])
);

function el(tag, className = '', text = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;
}

function svgEl(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }

  return element;
}

/**
 * Generate correct DFS states from the tree structure.
 *
 * The internal stack stores its top at the end.
 * The visual stack shows its top first.
 */
function createDfsSteps() {
  const stack = [50];
  const visited = [];
  const steps = [
    {
      current: null,
      visited: [],
      stack: [50],
      explanation:
        'DFS begins with the root node, 50, on the stack. ' +
        'Press Next Step to begin.'
    }
  ];

  while (stack.length > 0) {
    const value = stack.pop();
    const node = NODE_BY_VALUE.get(value);

    visited.push(value);

    const added = [];

    // Push right first, so left will be processed first.
    if (node.right !== null) {
      stack.push(node.right);
      added.push(node.right);
    }

    if (node.left !== null) {
      stack.push(node.left);
      added.push(node.left);
    }

    let explanation = '';

    if (value === 50) {
      explanation =
        'Visit 50. Push 70, then 30. Because the stack is ' +
        'Last In, First Out, 30 will be visited next.';
    } else if (value === 30) {
      explanation =
        'Visit 30. Push its right child 40, then its ' +
        'left child 20. DFS will explore 20 first.';
    } else if (value === 20) {
      explanation =
        'Visit 20. It is a leaf, so there are no children ' +
        'to add. DFS will backtrack using the stack.';
    } else if (value === 40) {
      explanation =
        'Visit 40. This branch is complete. The next ' +
        'pending node is 70, from the right subtree.';
    } else if (value === 70) {
      explanation =
        'Visit 70. Push 80, then 60. The stack will ' +
        'process 60 before 80.';
    } else if (value === 60) {
      explanation =
        'Visit 60. It is a leaf. Node 80 is still ' +
        'waiting on the stack.';
    } else if (value === 80) {
      explanation =
        'Visit 80. No nodes remain on the stack. ' +
        'The DFS traversal is complete.';
    }

    steps.push({
      current: value,
      visited: [...visited],
      stack: [...stack].reverse(),
      added,
      explanation
    });
  }

  return steps;
}

const DFS_STEPS = createDfsSteps();

function createTreeSvg() {
  const svg = svgEl('svg', {
    class: 'dfs-lesson-svg',
    viewBox: '0 0 600 345',
    role: 'img',
    'aria-label': 'Depth-first search tree animation'
  });

  // Draw edges behind the nodes.
  TREE.forEach(node => {
    [node.left, node.right].forEach(childValue => {
      if (childValue === null) return;

      const child = NODE_BY_VALUE.get(childValue);

      const line = svgEl('line', {
        x1: node.x,
        y1: node.y,
        x2: child.x,
        y2: child.y,
        class: 'dfs-lesson-edge'
      });

      svg.appendChild(line);
    });
  });

  // Draw each node.
  TREE.forEach(node => {
    const group = svgEl('g', {
      class: 'dfs-lesson-node',
      'data-node': node.value
    });

    const circle = svgEl('circle', {
      cx: node.x,
      cy: node.y,
      r: 29
    });

    const label = svgEl('text', {
      x: node.x,
      y: node.y,
      class: 'dfs-lesson-value'
    });

    label.textContent = String(node.value);

    group.append(circle, label);
    svg.appendChild(group);
  });

  return svg;
}

function createConceptCard(number, heading, explanation) {
  const card = el('article', 'dfs-concept-card');

  card.append(
    el('span', 'dfs-concept-number', number),
    el('h3', '', heading),
    el('p', '', explanation)
  );

  return card;
}

export function render(screen, container) {
  // Deliberately do not call renderHeader().
  // It would repeat the lesson.json paragraphs
  // above our custom Figma page.

  const page = el('div', 'dfs-lesson-page');

  // INTRODUCTION
  const intro = el('section', 'dfs-lesson-intro');

  intro.append(
    el('span', 'dfs-lesson-eyebrow', 'LEARN / LESSON 2 OF 2'),
    el('h1', '', 'Introduction to Depth-First Search'),
    el(
      'p',
      'dfs-lesson-lead',
      'Depth-First Search (DFS) is a tree traversal algorithm ' +
      'that explores one branch as deeply as possible ' +
      'before moving to another branch.'
    ),
    el(
      'p',
      'dfs-lesson-muted',
      'In this lesson, we use a stack to show exactly ' +
      'which node DFS visits next and why.'
    )
  );

  // ANIMATION SECTION HEADING
  const sectionHeading = el('div', 'dfs-section-heading');

  sectionHeading.append(
    el('span', 'dfs-lesson-eyebrow', '01 / WATCH HOW IT WORKS'),
    el('h2', '', 'Follow DFS step by step'),
    el(
      'p',
      'dfs-lesson-muted',
      'Use the controls to advance through the tree ' +
      'and watch the stack change.'
    )
  );

  const layout = el('div', 'dfs-lesson-layout');

  // LEFT CARD: TREE
  const treeCard = el('section', 'dfs-lesson-card dfs-tree-card');

  treeCard.append(
    el('h3', '', 'Tree traversal'),
    el(
      'p',
      'dfs-lesson-muted',
      'DFS visits the left branch first in this example.'
    )
  );

  const svg = createTreeSvg();

  const treeViewport = el('div', 'dfs-tree-viewport');
  treeViewport.appendChild(svg);

  // Tree legend
  const legend = el('div', 'dfs-lesson-legend');

  [
    ['Not visited', 'default'],
    ['Current node', 'current'],
    ['Visited', 'visited'],
    ['On stack', 'pending']
  ].forEach(([label, type]) => {
    const item = el('span', 'dfs-legend-item');

    item.append(
      el('i', `dfs-legend-dot dfs-legend-dot--${type}`),
      document.createTextNode(label)
    );

    legend.appendChild(item);
  });

  // Step explanation
  const explanationBox = el(
    'div',
    'dfs-step-explanation'
  );

  const stepHeading = el(
    'strong',
    'dfs-step-explanation__heading'
  );

  const stepMessage = el(
    'p',
    'dfs-step-explanation__message'
  );

  explanationBox.append(stepHeading, stepMessage);
  explanationBox.setAttribute('role', 'status');

  // Traversal sequence
  const visitSection = el('div', 'dfs-visited-section');

  visitSection.appendChild(
    el('strong', '', 'Traversal order')
  );

  const visitList = el('div', 'dfs-visited-list');
  visitSection.appendChild(visitList);

  // Player controls
  const controls = el('div', 'dfs-lesson-controls');

  const previousButton = el(
    'button',
    'btn',
    '← Previous Step'
  );
  previousButton.type = 'button';

  const nextButton = el(
    'button',
    'btn btn--primary',
    'Next Step →'
  );
  nextButton.type = 'button';

  const restartButton = el(
    'button',
    'btn',
    'Restart'
  );
  restartButton.type = 'button';

  const counter = el('span', 'dfs-step-counter');

  controls.append(
    previousButton,
    nextButton,
    restartButton,
    counter
  );

  treeCard.append(
    treeViewport,
    legend,
    explanationBox,
    visitSection,
    controls
  );

  // RIGHT CARD: STACK
  const stackCard = el(
    'aside',
    'dfs-lesson-card dfs-stack-card'
  );

  stackCard.append(
    el('span', 'dfs-lesson-eyebrow', 'LIVE STACK'),
    el('h3', '', 'Stack (LIFO)'),
    el(
      'p',
      'dfs-lesson-muted',
      'The last node pushed onto the stack ' +
      'is the first node removed.'
    )
  );

  const stackStatus = el('div', 'dfs-stack-status');
  const stackList = el('div', 'dfs-lesson-stack');

  const stackNote = el(
    'div',
    'dfs-stack-note',
    'To explore the left side first, DFS pushes ' +
    'the right child before the left child.'
  );

  stackCard.append(stackStatus, stackList, stackNote);
  layout.append(treeCard, stackCard);

  // CONCEPT CARDS
  const concepts = el('section', 'dfs-concepts');

  concepts.append(
    el('span', 'dfs-lesson-eyebrow', '02 / UNDERSTAND THE ALGORITHM'),
    el('h2', '', 'The four ideas behind DFS')
  );

  const conceptGrid = el('div', 'dfs-concepts-grid');

  [
    [
      '01',
      'Start at the root',
      'Begin at the root node. For this example, ' +
      'we place 50 on the stack.'
    ],
    [
      '02',
      'Use a stack',
      'The stack follows Last In, First Out (LIFO). ' +
      'It remembers nodes that are waiting to be explored.'
    ],
    [
      '03',
      'Go deep',
      'Follow one branch as far as possible before ' +
      'exploring another branch.'
    ],
    [
      '04',
      'Backtrack',
      'When a branch finishes, use the next pending ' +
      'node on the stack to continue.'
    ]
  ].forEach(([number, title, text]) => {
    conceptGrid.appendChild(
      createConceptCard(number, title, text)
    );
  });

  concepts.appendChild(conceptGrid);

  // REMINDER CARD
  const reminder = el(
    'section',
    'dfs-lesson-card dfs-reminder-card'
  );

  reminder.append(
    el('span', 'dfs-lesson-eyebrow', 'REMEMBER'),
    el('h2', '', 'DFS is not the same as BST lookup'),
    el(
      'p',
      '',
      'A BST lookup uses the ordering rule to choose ' +
      'left or right. DFS is a traversal strategy: it ' +
      'can visit the whole tree, even when a node is ' +
      'not on the current branch.'
    ),
    el(
      'p',
      'dfs-lesson-muted',
      'In the next section, you will explore DFS ' +
      'and different traversal orders yourself.'
    )
  );

  // ANIMATION STATE
  let stepIndex = 0;

  function updateTree(step) {
    svg.querySelectorAll('.dfs-lesson-node')
      .forEach(group => {
        const value = Number(group.dataset.node);

        group.classList.remove(
          'is-current',
          'is-visited',
          'is-pending'
        );

        if (value === step.current) {
          group.classList.add('is-current');
        } else if (step.visited.includes(value)) {
          group.classList.add('is-visited');
        } else if (step.stack.includes(value)) {
          group.classList.add('is-pending');
        }
      });
  }

  function updateStack(step) {
    stackList.replaceChildren();

    const pendingCount = step.stack.length;

    stackStatus.textContent =
      `${pendingCount} pending node${pendingCount === 1 ? '' : 's'}`;

    if (pendingCount === 0) {
      stackList.appendChild(
        el(
          'p',
          'dfs-stack-empty',
          'The stack is empty.'
        )
      );
      return;
    }

    step.stack.forEach((value, index) => {
      const item = el(
        'div',
        'dfs-stack-item',
        String(value)
      );

      if (index === 0) {
        item.classList.add('is-top');

        const topLabel = el(
          'span',
          'dfs-stack-top-label',
          'TOP'
        );

        item.appendChild(topLabel);
      }

      stackList.appendChild(item);
    });
  }

  function updateVisited(step) {
    visitList.replaceChildren();

    if (step.visited.length === 0) {
      visitList.appendChild(
        el(
          'span',
          'dfs-visit-empty',
          'No nodes visited yet'
        )
      );
      return;
    }

    step.visited.forEach((value, index) => {
      visitList.appendChild(
        el('span', 'dfs-visit-chip', String(value))
      );

      if (index < step.visited.length - 1) {
        visitList.appendChild(
          el('span', 'dfs-visit-arrow', '→')
        );
      }
    });
  }

  function update() {
    const step = DFS_STEPS[stepIndex];
    const completed = stepIndex === DFS_STEPS.length - 1;

    updateTree(step);
    updateStack(step);
    updateVisited(step);

    stepHeading.textContent = completed
      ? 'Traversal complete!'
      : stepIndex === 0
        ? 'Ready to begin'
        : `Step ${stepIndex}: Visit ${step.current}`;

    stepMessage.textContent = step.explanation;

    counter.textContent =
      `Step ${stepIndex} of ${DFS_STEPS.length - 1}`;

    previousButton.disabled = stepIndex === 0;
    nextButton.disabled = completed;

    if (completed) {
      nextButton.textContent = 'Completed ✓';
    } else {
      nextButton.textContent = 'Next Step →';
    }
  }

  previousButton.addEventListener('click', () => {
    if (stepIndex > 0) {
      stepIndex -= 1;
      update();
    }
  });

  nextButton.addEventListener('click', () => {
    if (stepIndex < DFS_STEPS.length - 1) {
      stepIndex += 1;
      update();
    }
  });

  restartButton.addEventListener('click', () => {
    stepIndex = 0;
    update();
  });

  // ASSEMBLE PAGE
  page.append(
    intro,
    sectionHeading,
    layout,
    concepts,
    reminder
  );

  container.appendChild(page);
  update();
}
