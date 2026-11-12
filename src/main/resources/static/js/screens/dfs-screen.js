
/**
 * COS212 DFS Tutor — DFS Introduction
 * Figma Page 3
 *
 * 01 Vocabulary
 * 02 Interactive walkthrough
 * 03 Four ideas behind DFS
 * 04 Knowledge check
 *
 * Uses iterative, left-first DFS.
 * No backend changes required.
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

const NODE_MAP = new Map(
  TREE.map(node => [node.value, node])
);

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
   GENERATE DFS TRAVERSAL
   ========================================== */

function createDfsSteps() {
  const stack = [50];
  const visited = [];

  const steps = [{
    current: null,
    visited: [],
    stack: [50],
    explanation:
      'Node 50 is waiting on the stack. ' +
      'A stack is a list where the last item added ' +
      'is the first one removed.'
  }];

  while (stack.length > 0) {
    const value = stack.pop();
    const node = NODE_MAP.get(value);

    visited.push(value);

    const pushed = [];

    // Push the right child first so the left
    // child is removed from the stack first.
    if (node.right !== null) {
      stack.push(node.right);
      pushed.push(node.right);
    }

    if (node.left !== null) {
      stack.push(node.left);
      pushed.push(node.left);
    }

    const explanationByNode = {
      50:
        'Visit 50. Push 70, then 30. ' +
        'Because 30 was pushed last, it is next.',
      30:
        'Visit 30. Push 40, then 20. ' +
        'The next node is 20.',
      20:
        'Visit 20. It has no children, ' +
        'so continue with the next node on the stack.',
      40:
        'Visit 40. This branch is finished. ' +
        'Node 70 is still waiting on the stack.',
      70:
        'Visit 70. Push 80, then 60. ' +
        'Node 60 will be visited before 80.',
      60:
        'Visit 60. It has no children. ' +
        'Node 80 is still waiting.',
      80:
        'Visit 80. The stack is empty. ' +
        'Every node has now been visited.'
    };

    steps.push({
      current: value,
      visited: [...visited],
      stack: [...stack].reverse(),
      pushed,
      explanation: explanationByNode[value]
    });
  }

  return steps;
}

const DFS_STEPS = createDfsSteps();

/* ==========================================
   TREE VISUALIZATION
   ========================================== */

function createTreeSvg() {
  const svg = svgEl('svg', {
    class: 'dfs-lesson-svg',
    viewBox: '0 0 600 345',
    role: 'img',
    'aria-label':
      'Depth-First Search demonstration on a tree with seven nodes'
  });

  // Connections first, then nodes.
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

    const circle = svgEl('circle', {
      cx: node.x,
      cy: node.y,
      r: 29
    });

    const value = svgEl('text', {
      x: node.x,
      y: node.y,
      class: 'dfs-lesson-value'
    });

    value.textContent = String(node.value);

    // Non-colour indication of node state.
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

/* ==========================================
   MAIN PAGE
   ========================================== */

export function render(screen, container) {
  const page = el('div', 'dfs-lesson-page');

  let stepIndex = 0;
  let predictionChoice = null;
  let predictionMade = false;

  const milestones = new Set();

  // ------------------------------------------
  // MEASURE HEADER HEIGHT
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
  // STICKY ACTIVITY PROGRESS
  // ==========================================

  const progress = el('div', 'lesson-progress');

  const progressHeader = el(
    'div',
    'lesson-progress__header'
  );

  const progressTitle = el(
    'strong',
    '',
    'DEPTH-FIRST SEARCH'
  );

  const progressLabel = el(
    'span',
    '',
    'Step 0 of 4'
  );

  progressHeader.append(
    progressTitle,
    progressLabel
  );

  const progressTrack = el(
    'div',
    'lesson-progress__track'
  );

  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute(
    'aria-label',
    'DFS lesson activity progress'
  );
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '4');
  progressTrack.setAttribute('aria-valuenow', '0');

  const progressFill = el(
    'div',
    'lesson-progress__fill'
  );

  progressFill.style.width = '0%';

  progressTrack.appendChild(progressFill);
  progress.append(progressHeader, progressTrack);

  function markComplete(milestone) {
    if (milestones.has(milestone)) return;

    milestones.add(milestone);

    const count = milestones.size;

    progressLabel.textContent = `Step ${count} of 4`;
    progressFill.style.width = `${count * 25}%`;

    progressTrack.setAttribute(
      'aria-valuenow',
      String(count)
    );
  }

  // ==========================================
  // INTRODUCTION
  // ==========================================

  const intro = el(
    'section',
    'dfs-lesson-card dfs-lesson-intro'
  );

  intro.append(
    el('h1', '', 'Introduction to Depth-First Search'),
    el(
      'p',
      'dfs-lesson-lead',
      'Depth-First Search (DFS) is a way of visiting ' +
      'nodes in a tree. It follows one path as far as ' +
      'possible before going back to explore another.'
    ),
    el(
      'p',
      'dfs-lesson-muted',
      'A tree contains connected nodes. The root is ' +
      'the starting node, and a branch is a path ' +
      'connecting nodes. Visiting nodes in a chosen ' +
      'order is called a traversal.'
    )
  );

  const bstReminder = el(
    'div',
    'dfs-prerequisite'
  );

  bstReminder.append(
    el(
      'p',
      '',
      'New to roots, children or leaves? ' +
      'Review the tree basics first.'
    )
  );

  const bstLink = el(
    'a',
    '',
    'Review BST Basics →'
  );

  bstLink.href = '#/concept-bst';

  bstReminder.appendChild(bstLink);
  intro.appendChild(bstReminder);

  // ==========================================
  // 01 — VOCABULARY
  // ==========================================

  const vocabulary = el(
    'section',
    'dfs-lesson-card dfs-vocabulary'
  );

  vocabulary.append(
    el('span', 'dfs-lesson-eyebrow', '01 / VOCABULARY'),
    el('h2', '', 'Words to know'),
    el(
      'p',
      'dfs-lesson-muted',
      'Select every term to learn what it means. ' +
      'These ideas will appear in the animation.'
    )
  );

  const vocabularyChips = el(
    'div',
    'dfs-vocabulary__chips'
  );

  const vocabularyFeedback = el(
    'p',
    'dfs-vocabulary__feedback',
    'Choose a term to begin.'
  );

  vocabularyFeedback.setAttribute('aria-live', 'polite');

  const visitedTerms = new Set();

  const vocabularyTerms = [
    {
      term: 'Root',
      explanation:
        'The root is the starting node of a tree. ' +
        'Here, the root is 50.'
    },
    {
      term: 'Traversal',
      explanation:
        'A traversal means visiting nodes in a ' +
        'particular order.'
    },
    {
      term: 'Stack',
      explanation:
        'A stack is a collection where the last ' +
        'item added is the first one removed. ' +
        'This is called Last In, First Out (LIFO).'
    },
    {
      term: 'Backtracking',
      explanation:
        'Backtracking means returning to a previous ' +
        'choice when there is no further path ' +
        'to explore.'
    }
  ];

  vocabularyTerms.forEach(item => {
    const chip = el(
      'button',
      'dfs-vocabulary__chip',
      item.term
    );

    chip.type = 'button';
    chip.setAttribute('aria-pressed', 'false');

    chip.addEventListener('click', () => {
      visitedTerms.add(item.term);

      vocabularyChips.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === chip)
          );
        });

      vocabularyFeedback.textContent = item.explanation;

      if (visitedTerms.size === vocabularyTerms.length) {
        markComplete('vocabulary');
      }
    });

    vocabularyChips.appendChild(chip);
  });

  vocabulary.append(
    vocabularyChips,
    vocabularyFeedback
  );

  // ==========================================
  // 02 — INTERACTIVE WALKTHROUGH
  // ==========================================

  const walkthroughHeading = el(
    'div',
    'dfs-section-heading'
  );

  walkthroughHeading.append(
    el(
      'span',
      'dfs-lesson-eyebrow',
      '02 / INTERACTIVE WALKTHROUGH'
    ),
    el('h2', '', 'Follow DFS step by step'),
    el(
      'p',
      'dfs-lesson-muted',
      'Make a prediction, reveal the next node, ' +
      'and watch the stack change.'
    )
  );

  const layout = el('div', 'dfs-lesson-layout');

  const treeCard = el(
    'section',
    'dfs-lesson-card dfs-tree-card'
  );

  treeCard.append(
    el('h3', '', 'Tree traversal'),
    el(
      'p',
      'dfs-lesson-muted',
      'This example visits the left side before ' +
      'the right side.'
    )
  );

  const svg = createTreeSvg();

  const treeViewport = el(
    'div',
    'dfs-tree-viewport'
  );

  treeViewport.appendChild(svg);

  // ------------------------------------------
  // ACCESSIBLE LEGEND
  // ------------------------------------------

  const legend = el(
    'div',
    'dfs-lesson-legend'
  );

  const legendItems = [
    ['○', 'Not visited', 'default'],
    ['●', 'Current node', 'current'],
    ['✓', 'Visited', 'visited'],
    ['◌', 'On stack', 'pending']
  ];

  legendItems.forEach(([symbol, label, type]) => {
    const item = el('span', 'dfs-legend-item');

    item.append(
      el(
        'span',
        `dfs-legend-symbol dfs-legend-symbol--${type}`,
        symbol
      ),
      document.createTextNode(label)
    );

    legend.appendChild(item);
  });

  // ------------------------------------------
  // PREDICT BEFORE REVEAL
  // ------------------------------------------

  const prediction = el(
    'section',
    'dfs-prediction'
  );

  prediction.append(
    el(
      'span',
      'dfs-lesson-eyebrow',
      'YOUR TURN'
    ),
    el(
      'h4',
      '',
      'Which node will DFS visit next?'
    ),
    el(
      'p',
      'dfs-prediction__hint',
      'Look at the node at the top of the stack.'
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

  function renderPrediction() {
    predictionOptions.replaceChildren();
    predictionFeedback.textContent = '';
    predictionChoice = null;

    const current = DFS_STEPS[stepIndex];
    const nextValue = current.stack[0];

    if (nextValue === undefined) {
      prediction.hidden = true;
      return;
    }

    prediction.hidden = false;

    // Include the correct answer and distractors.
    const options = [
      nextValue,
      ...TREE.map(node => node.value)
        .filter(value =>
          value !== nextValue &&
          !current.visited.includes(value)
        )
        .slice(0, 2)
    ];

    // At late steps, use visited nodes as distractors
    // if fewer than three unvisited nodes remain.
    for (const node of TREE) {
      if (options.length >= 3) break;
      if (!options.includes(node.value)) {
        options.push(node.value);
      }
    }

    options.forEach(value => {
      const button = el(
        'button',
        'dfs-prediction__option',
        String(value)
      );

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        predictionChoice = value;
        predictionMade = true;

        predictionOptions.querySelectorAll('button')
          .forEach(other => {
            other.setAttribute(
              'aria-pressed',
              String(other === button)
            );
          });

        if (value === nextValue) {
          predictionFeedback.className =
            'dfs-prediction__feedback is-correct';

          predictionFeedback.textContent =
            `Correct! ${nextValue} is on top of the stack.`;
        } else {
          predictionFeedback.className =
            'dfs-prediction__feedback is-review';

          predictionFeedback.textContent =
            'Good try. The stack follows Last In, ' +
            'First Out. Look at the TOP label.';
        }

        markComplete('prediction');
        updateControls();
      });

      predictionOptions.appendChild(button);
    });

    const unsureButton = el(
      'button',
      'dfs-prediction__option',
      'Not sure'
    );

    unsureButton.type = 'button';

    unsureButton.addEventListener('click', () => {
      predictionChoice = 'unsure';
      predictionMade = true;

      predictionOptions.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === unsureButton)
          );
        });

      predictionFeedback.className =
        'dfs-prediction__feedback is-review';

      predictionFeedback.textContent =
        `The next node is ${nextValue}, because it ` +
        'is the top item on the stack.';

      markComplete('prediction');
      updateControls();
    });

    predictionOptions.appendChild(unsureButton);
  }

  // ------------------------------------------
  // STEP EXPLANATION
  // ------------------------------------------

  const explanationBox = el(
    'div',
    'dfs-step-explanation'
  );

  explanationBox.setAttribute('aria-live', 'polite');

  const stepHeading = el(
    'strong',
    'dfs-step-explanation__heading'
  );

  const stepMessage = el(
    'p',
    'dfs-step-explanation__message'
  );

  explanationBox.append(stepHeading, stepMessage);

  // ------------------------------------------
  // TRAVERSAL ORDER
  // ------------------------------------------

  const visitedSection = el(
    'div',
    'dfs-visited-section'
  );

  visitedSection.appendChild(
    el('strong', '', 'Traversal order')
  );

  const visitedList = el(
    'div',
    'dfs-visited-list'
  );

  visitedSection.appendChild(visitedList);

  // ------------------------------------------
  // PLAYER CONTROLS
  // ------------------------------------------

  const controls = el(
    'div',
    'dfs-lesson-controls'
  );

  const previousButton = el(
    'button',
    'btn',
    '← Previous Step'
  );

  previousButton.type = 'button';

  const nextButton = el(
    'button',
    'btn btn--primary',
    'Reveal Next Step →'
  );

  nextButton.type = 'button';

  const restartButton = el(
    'button',
    'btn',
    'Restart'
  );

  restartButton.type = 'button';

  const counter = el(
    'span',
    'dfs-step-counter'
  );

  controls.append(
    previousButton,
    nextButton,
    restartButton,
    counter
  );

  treeCard.append(
    treeViewport,
    legend,
    prediction,
    explanationBox,
    visitedSection,
    controls
  );

  // ==========================================
  // LIVE STACK
  // ==========================================

  const stackCard = el(
    'aside',
    'dfs-lesson-card dfs-stack-card'
  );

  stackCard.append(
    el(
      'span',
      'dfs-lesson-eyebrow',
      'LIVE STACK'
    ),
    el('h3', '', 'Stack (LIFO)'),
    el(
      'p',
      'dfs-lesson-muted',
      'A stack is a list where the last item added ' +
      'is the first one removed. ' +
      'This is Last In, First Out (LIFO).'
    )
  );

  const stackStatus = el(
    'div',
    'dfs-stack-status'
  );

  const stackList = el(
    'div',
    'dfs-lesson-stack'
  );

  const stackNote = el(
    'div',
    'dfs-stack-note',
    'The top item is removed first. ' +
    'For left-first DFS, we push the right child ' +
    'before the left child.'
  );

  stackCard.append(
    stackStatus,
    stackList,
    stackNote
  );

  layout.append(treeCard, stackCard);

  // ==========================================
  // WALKTHROUGH STATE UPDATES
  // ==========================================

  function updateTree(step) {
    svg.querySelectorAll('.dfs-lesson-node')
      .forEach(group => {
        const value = Number(group.dataset.node);

        group.classList.remove(
          'is-current',
          'is-visited',
          'is-pending'
        );

        let stateLabel = '';
        let stateDescription = 'Not visited';

        if (value === step.current) {
          group.classList.add('is-current');
          stateLabel = 'NOW';
          stateDescription = 'Currently being visited';
        } else if (step.visited.includes(value)) {
          group.classList.add('is-visited');
          stateLabel = '✓';
          stateDescription = 'Already visited';
        } else if (step.stack.includes(value)) {
          group.classList.add('is-pending');
          stateLabel = 'WAIT';
          stateDescription = 'Waiting on the stack';
        }

        group.querySelector(
          '.dfs-lesson-node-state'
        ).textContent = stateLabel;

        group.setAttribute(
          'aria-label',
          `Node ${value}. ${stateDescription}.`
        );
      });
  }

  function updateStack(step) {
    stackList.replaceChildren();

    const count = step.stack.length;

    stackStatus.textContent =
      `${count} pending node${count === 1 ? '' : 's'}`;

    if (count === 0) {
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

        item.appendChild(
          el('span', 'dfs-stack-top-label', 'TOP')
        );
      }

      stackList.appendChild(item);
    });
  }

  function updateVisited(step) {
    visitedList.replaceChildren();

    if (step.visited.length === 0) {
      visitedList.appendChild(
        el(
          'span',
          'dfs-visit-empty',
          'No nodes visited yet'
        )
      );
      return;
    }

    step.visited.forEach((value, index) => {
      visitedList.appendChild(
        el('span', 'dfs-visit-chip', String(value))
      );

      if (index < step.visited.length - 1) {
        visitedList.appendChild(
          el('span', 'dfs-visit-arrow', '→')
        );
      }
    });
  }

  function updateControls() {
    const complete =
      stepIndex === DFS_STEPS.length - 1;

    previousButton.disabled = stepIndex === 0;
    nextButton.disabled =
      complete || predictionChoice === null;

    nextButton.textContent = complete
      ? 'Traversal Complete ✓'
      : 'Reveal Next Step →';

    counter.textContent =
      `Step ${stepIndex} of ${DFS_STEPS.length - 1}`;
  }

  function updateWalkthrough() {
    const step = DFS_STEPS[stepIndex];

    updateTree(step);
    updateStack(step);
    updateVisited(step);

    stepHeading.textContent =
      stepIndex === 0
        ? 'Ready to begin'
        : stepIndex === DFS_STEPS.length - 1
          ? 'Traversal complete!'
          : `Step ${stepIndex}: Visit ${step.current}`;

    stepMessage.textContent = step.explanation;

    if (stepIndex === DFS_STEPS.length - 1) {
      markComplete('walkthrough');
    }

    // Restore the prediction question for this step.
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
    if (
      predictionChoice !== null &&
      stepIndex < DFS_STEPS.length - 1
    ) {
      stepIndex += 1;
      updateWalkthrough();
    }
  });

  restartButton.addEventListener('click', () => {
    stepIndex = 0;
    updateWalkthrough();
  });

  // ==========================================
  // 03 — FOUR IDEAS BEHIND DFS
  // ==========================================

  const concepts = el(
    'section',
    'dfs-concepts'
  );

  concepts.append(
    el(
      'span',
      'dfs-lesson-eyebrow',
      '03 / UNDERSTAND THE ALGORITHM'
    ),
    el('h2', '', 'The four ideas behind DFS')
  );

  const conceptGrid = el(
    'div',
    'dfs-concepts-grid'
  );

  const conceptData = [
    [
      '01',
      'Start at the root',
      'Begin with node 50, the top node of our tree.'
    ],
    [
      '02',
      'Use a stack',
      'Keep track of the nodes waiting to be visited.'
    ],
    [
      '03',
      'Go deep',
      'Explore one path before exploring another.'
    ],
    [
      '04',
      'Backtrack',
      'Return to a waiting node when a path ends.'
    ]
  ];

  conceptData.forEach(([number, title, text]) => {
    const card = el(
      'article',
      'dfs-concept-card'
    );

    card.append(
      el('span', 'dfs-concept-number', number),
      el('h3', '', title),
      el('p', '', text)
    );

    conceptGrid.appendChild(card);
  });

  concepts.appendChild(conceptGrid);

  // A short connection to COS212 algorithms.
  const algorithmCard = el(
    'div',
    'dfs-algorithm-card'
  );

  algorithmCard.append(
    el('h3', '', 'How does the algorithm work?'),
    el(
      'p',
      '',
      'This version uses an explicit stack. ' +
      'DFS can also be written recursively, ' +
      'where function calls use the call stack.'
    )
  );

  const pseudocode = el(
    'pre',
    'dfs-pseudocode'
  );

  pseudocode.textContent =
`stack = [root]

while stack is not empty:
    node = stack.pop()
    visit(node)

    if node.right exists:
        stack.push(node.right)

    if node.left exists:
        stack.push(node.left)`;

  algorithmCard.appendChild(pseudocode);

  // Reminder about BST lookup versus traversal.
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
      'A BST lookup uses value comparisons to choose ' +
      'a left or right path. DFS visits nodes in a ' +
      'traversal order, even when their values do not ' +
      'help locate a target.'
    )
  );

  // ==========================================
  // 04 — KNOWLEDGE CHECK
  // ==========================================

  const check = el(
    'section',
    'dfs-lesson-card dfs-check'
  );

  check.append(
    el(
      'span',
      'dfs-lesson-eyebrow',
      '04 / CHECK YOUR UNDERSTANDING'
    ),
    el('h2', '', 'Ready to explore DFS?'),
    el(
      'p',
      'dfs-lesson-muted',
      'Try two short questions. ' +
      'You can use hints and retry without losing marks.'
    )
  );

  const checkQuestions = [
    {
      id: 'stack',
      prompt:
        'A stack contains 70, then 30 on top. ' +
        'Which node is removed first?',
      options: ['70', '30', 'Both at once', 'Not sure'],
      correct: '30',
      hint:
        'A stack uses Last In, First Out. ' +
        'Look at the top item.',
      explanation:
        'Correct! Node 30 is on top, so it is removed first.'
    },
    {
      id: 'order',
      prompt:
        'In the example tree, which node is visited after 30?',
      options: ['70', '40', '20', 'Not sure'],
      correct: '20',
      hint:
        'When 30 is visited, its right child 40 is pushed ' +
        'before its left child 20.',
      explanation:
        'Correct! Node 20 is visited next because ' +
        'it was pushed last and is on top of the stack.'
    }
  ];

  const checkCorrect = new Set();

  const checkGrid = el(
    'div',
    'dfs-check__grid'
  );

  const finalResult = el(
    'div',
    'dfs-check__result'
  );

  finalResult.hidden = true;
  finalResult.setAttribute('aria-live', 'polite');

  function updateCheckResult() {
    if (checkCorrect.size === checkQuestions.length) {
      finalResult.hidden = false;
      finalResult.className =
        'dfs-check__result is-ready';

      finalResult.textContent =
        "You're ready to explore DFS! " +
        'You understand the stack and the next-node order.';

      markComplete('check');
    }
  }

  checkQuestions.forEach((question, index) => {
    const card = el(
      'article',
      'dfs-check__question'
    );

    card.appendChild(
      el(
        'h3',
        '',
        `${index + 1}. ${question.prompt}`
      )
    );

    const options = el(
      'div',
      'dfs-check__options'
    );

    const feedback = el(
      'p',
      'dfs-check__feedback'
    );

    feedback.setAttribute('aria-live', 'polite');

    question.options.forEach(answer => {
      const button = el(
        'button',
        'dfs-check__option',
        answer
      );

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        options.querySelectorAll('button').forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

        if (answer === question.correct) {
          checkCorrect.add(question.id);

          feedback.className =
            'dfs-check__feedback is-correct';

          feedback.textContent = question.explanation;
        } else {
          checkCorrect.delete(question.id);

          feedback.className =
            'dfs-check__feedback is-review';

          feedback.textContent =
            answer === 'Not sure'
              ? `That's okay. ${question.hint}`
              : `Not quite. ${question.hint} Try again.`;
        }

        updateCheckResult();
      });

      options.appendChild(button);
    });

    card.append(options, feedback);
    checkGrid.appendChild(card);
  });

  check.append(
    checkGrid,
    finalResult
  );

  // ==========================================
  // PAGE NAVIGATION
  // ==========================================

  const lessonNavigation = el(
    'nav',
    'dfs-page-navigation'
  );

  lessonNavigation.setAttribute(
    'aria-label',
    'DFS lesson navigation'
  );

  const backToBst = el(
    'a',
    'dfs-page-navigation__back',
    '← BST Basics'
  );

  backToBst.href = '#/concept-bst';

  const goToExplorer = el(
    'a',
    'dfs-page-navigation__next',
    'Next: DFS Explorer →'
  );

  goToExplorer.href = '#/worked-example';

  lessonNavigation.append(
    backToBst,
    goToExplorer
  );

  // ==========================================
  // ASSEMBLE PAGE
  // ==========================================

  page.append(
    progress,
    intro,
    vocabulary,
    walkthroughHeading,
    layout,
    concepts,
    algorithmCard,
    reminder,
    check,
    lessonNavigation
  );

  container.appendChild(page);

  updateWalkthrough();

  // Cleanup when leaving this screen.
  return () => {
    headerObserver?.disconnect();
  };
}
