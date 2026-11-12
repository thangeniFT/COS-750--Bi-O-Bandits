
/**
 * COS212 DFS Tutor — Guided DFS Practice
 * Figma Page 5
 *
 * Learning design:
 * 01 Recall prior knowledge
 * 02 Guided DFS search and prediction
 * 03 In-order traversal practice
 * 04 Readiness check and formative feedback
 *
 * No scores are saved or sent to a server.
 */

const PRACTICE_SVG_NS = 'http://www.w3.org/2000/svg';

const PRACTICE_TREE = [
  { value: 50, x: 300, y: 50, left: 30, right: 70 },
  { value: 30, x: 155, y: 155, left: 20, right: 40 },
  { value: 70, x: 445, y: 155, left: 60, right: 80 },
  { value: 20, x: 75, y: 275, left: null, right: null },
  { value: 40, x: 235, y: 275, left: null, right: null },
  { value: 60, x: 365, y: 275, left: null, right: null },
  { value: 80, x: 525, y: 275, left: null, right: null }
];

const PRACTICE_NODE_MAP = new Map(
  PRACTICE_TREE.map(node => [node.value, node])
);

function practiceEl(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function practiceSvgEl(tag, attributes = {}) {
  const element = document.createElementNS(
    PRACTICE_SVG_NS,
    tag
  );

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  return element;
}

/* ==========================================
   GENERATE DFS SEARCH STATES
   ========================================== */

function buildPracticeSteps(target) {
  const stack = [50];
  const visited = [];

  const steps = [{
    current: null,
    visited: [],
    stack: [50],
    found: false,
    explanation:
      'The root node 50 is waiting on the stack. ' +
      'Predict which node will be removed first.'
  }];

  while (stack.length > 0) {
    const current = stack.pop();
    const node = PRACTICE_NODE_MAP.get(current);

    visited.push(current);

    const found = current === target;

    if (!found) {
      // Push right before left for left-first DFS.
      if (node.right !== null) {
        stack.push(node.right);
      }

      if (node.left !== null) {
        stack.push(node.left);
      }
    }

    const explanation = found
      ? `Found ${target}! DFS visited ${visited.length} nodes.`
      : `Visited ${current}. ${
          node.left === null && node.right === null
            ? 'This node has no children.'
            : 'Its children have been added to the stack, ' +
              'with the left child positioned to be visited first.'
        }`;

    steps.push({
      current,
      visited: [...visited],
      stack: [...stack].reverse(),
      found,
      explanation
    });

    if (found) break;
  }

  return steps;
}

function getInOrder() {
  const result = [];

  function visit(value) {
    if (value === null) return;

    const node = PRACTICE_NODE_MAP.get(value);

    visit(node.left);
    result.push(node.value);
    visit(node.right);
  }

  visit(50);
  return result;
}

/* ==========================================
   CREATE TREE SVG
   ========================================== */

function createPracticeTree() {
  const svg = practiceSvgEl('svg', {
    class: 'practice-tree-svg',
    viewBox: '0 0 600 345',
    role: 'img',
    'aria-label':
      'Binary Search Tree with root 50, ' +
      'left subtree 30, 20 and 40, ' +
      'and right subtree 70, 60 and 80'
  });

  PRACTICE_TREE.forEach(node => {
    for (const childValue of [node.left, node.right]) {
      if (childValue === null) continue;

      const child = PRACTICE_NODE_MAP.get(childValue);

      svg.appendChild(practiceSvgEl('line', {
        x1: node.x,
        y1: node.y,
        x2: child.x,
        y2: child.y,
        class: 'practice-tree-edge'
      }));
    }
  });

  PRACTICE_TREE.forEach(node => {
    const group = practiceSvgEl('g', {
      class: 'practice-tree-node',
      'data-node': node.value
    });

    const circle = practiceSvgEl('circle', {
      cx: node.x,
      cy: node.y,
      r: 28
    });

    const number = practiceSvgEl('text', {
      x: node.x,
      y: node.y,
      class: 'practice-tree-value'
    });

    number.textContent = String(node.value);

    const stateLabel = practiceSvgEl('text', {
      x: node.x,
      y: node.y + 45,
      class: 'practice-tree-state'
    });

    group.append(circle, number, stateLabel);
    svg.appendChild(group);
  });

  return svg;
}

/* ==========================================
   MAIN PRACTICE SCREEN
   ========================================== */

export function render(screen, container) {
  const page = practiceEl('div', 'practice-page');

  const target = Number.isInteger(Number(screen.target))
    ? Number(screen.target)
    : 55;

  const steps = buildPracticeSteps(target);
  const correctInOrder = getInOrder();

  let stepIndex = 0;
  let selectedPrediction = null;
  let predictionAttempts = 0;
  let hintCount = 0;
  let inOrderAttempts = 0;
  let wrongAnswers = 0;

  const completed = new Set();

  // Each practice milestone is counted once.
  function markComplete(name) {
    if (completed.has(name)) return;

    completed.add(name);

    const count = completed.size;

    progressCount.textContent = `Step ${count} of 4`;
    progressFill.style.width = `${count * 25}%`;

    progressTrack.setAttribute(
      'aria-valuenow',
      String(count)
    );

    updateReadiness();
  }

  // ==========================================
  // STICKY HEADER OFFSET
  // ==========================================

  const appHeader = document.querySelector('.app-header');
  let headerObserver = null;

  function updateHeaderHeight() {
    if (!appHeader) return;

    const height = Math.ceil(
      appHeader.getBoundingClientRect().height
    );

    document.documentElement.style.setProperty(
      '--app-header-height',
      `${height}px`
    );
  }

  updateHeaderHeight();

  if (
    appHeader &&
    typeof ResizeObserver !== 'undefined'
  ) {
    headerObserver = new ResizeObserver(updateHeaderHeight);
    headerObserver.observe(appHeader);
  }

  // ==========================================
  // STICKY ACTIVITY PROGRESS
  // ==========================================

  const progress = practiceEl('div', 'lesson-progress');

  const progressHeader = practiceEl(
    'div',
    'lesson-progress__header'
  );

  const progressTitle = practiceEl(
    'strong',
    '',
    'GUIDED DFS PRACTICE'
  );

  const progressCount = practiceEl(
    'span',
    '',
    'Step 0 of 4'
  );

  progressHeader.append(progressTitle, progressCount);

  const progressTrack = practiceEl(
    'div',
    'lesson-progress__track'
  );

  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute(
    'aria-label',
    'Practice activity progress'
  );
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '4');
  progressTrack.setAttribute('aria-valuenow', '0');

  const progressFill = practiceEl(
    'div',
    'lesson-progress__fill'
  );

  progressFill.style.width = '0%';

  progressTrack.appendChild(progressFill);
  progress.append(progressHeader, progressTrack);

  // ==========================================
  // INTRODUCTION
  // ==========================================

  const intro = practiceEl(
    'section',
    'practice-card practice-intro'
  );

  intro.append(
    practiceEl(
      'span',
      'practice-eyebrow',
      'LEARN BY DOING'
    ),
    practiceEl('h1', '', 'Guided DFS Practice'),
    practiceEl(
      'p',
      'practice-lead',
      'Now it is your turn. Predict which node ' +
      'will be visited next, work out an in-order ' +
      'traversal and check your understanding.'
    ),
    practiceEl(
      'p',
      'practice-muted',
      'You can retry every activity, use hints ' +
      'and learn from mistakes. This is practice, ' +
      'not a graded assessment.'
    )
  );

  // ==========================================
  // 01 — RECALL PRIOR KNOWLEDGE
  // ==========================================

  const recall = practiceEl(
    'section',
    'practice-card practice-recall'
  );

  recall.append(
    practiceEl('span', 'practice-eyebrow', '01 / RECALL'),
    practiceEl('h2', '', 'Remember how a stack works'),
    practiceEl(
      'p',
      'practice-muted',
      'DFS uses a stack: the last item added ' +
      'is the first item removed. ' +
      'This is called Last In, First Out (LIFO).'
    ),
    practiceEl(
      'h3',
      '',
      'If we push 10, then 20, then 30, ' +
      'which value comes off first?'
    )
  );

  const recallOptions = practiceEl(
    'div',
    'practice-answer-options'
  );

  const recallFeedback = practiceEl(
    'div',
    'practice-feedback'
  );

  recallFeedback.setAttribute('aria-live', 'polite');

  const recallVisual = practiceEl(
    'div',
    'practice-recall-visual'
  );

  recallVisual.hidden = true;

  recallVisual.append(
    practiceEl(
      'strong',
      '',
      'Stack (top first)'
    ),
    practiceEl(
      'div',
      'practice-stack-example',
      '30  ← TOP'
    ),
    practiceEl(
      'div',
      'practice-stack-example',
      '20'
    ),
    practiceEl(
      'div',
      'practice-stack-example',
      '10'
    )
  );

  const recallQuestionOptions = [
    { text: '10', correct: false },
    { text: '20', correct: false },
    { text: '30', correct: true },
    { text: 'Not sure', correct: false }
  ];

  recallQuestionOptions.forEach(option => {
    const button = practiceEl(
      'button',
      'practice-answer',
      option.text
    );

    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
      recallOptions.querySelectorAll('button').forEach(other => {
        other.setAttribute(
          'aria-pressed',
          String(other === button)
        );
      });

      recallFeedback.className = option.correct
        ? 'practice-feedback is-correct'
        : 'practice-feedback is-review';

      if (option.correct) {
        recallFeedback.textContent =
          'Correct! 30 was pushed last, ' +
          'so it is removed first.';

        recallVisual.hidden = false;
        markComplete('recall');
      } else {
        wrongAnswers += option.text === 'Not sure' ? 0 : 1;

        recallFeedback.textContent =
          'Look at the stack below. ' +
          'The last value pushed sits on top. ' +
          'Try again.';

        recallVisual.hidden = false;
      }

      updateReadiness();
    });

    recallOptions.appendChild(button);
  });

  recall.append(
    recallOptions,
    recallFeedback,
    recallVisual
  );

  // ==========================================
  // 02 — GUIDED DFS SEARCH
  // ==========================================

  const searchSection = practiceEl(
    'section',
    'practice-search-section'
  );

  searchSection.append(
    practiceEl(
      'span',
      'practice-eyebrow',
      '02 / GUIDED DFS SEARCH'
    ),
    practiceEl(
      'h2',
      '',
      `Search for ${target}`
    ),
    practiceEl(
      'p',
      'practice-muted',
      `Predict the next node as DFS searches for ${target}. ` +
      'We will explore the left side first. ' +
      'Use the stack to help you decide.'
    )
  );

  const searchLayout = practiceEl(
    'div',
    'practice-search-layout'
  );

  const treeCard = practiceEl(
    'div',
    'practice-card practice-tree-card'
  );

  const treeHeader = practiceEl(
    'div',
    'practice-tree-heading'
  );

  const treeTitle = practiceEl(
    'h3',
    '',
    'Follow the tree'
  );

  const nodeCount = practiceEl(
    'span',
    'practice-node-count',
    '7 nodes'
  );

  treeHeader.append(treeTitle, nodeCount);

  const treeViewport = practiceEl(
    'div',
    'practice-tree-viewport'
  );

  const treeSvg = createPracticeTree();
  treeViewport.appendChild(treeSvg);

  // Non-colour visual cues.
  const legend = practiceEl(
    'div',
    'practice-tree-legend'
  );

  [
    ['○', 'Not visited', 'default'],
    ['●', 'Current', 'current'],
    ['✓', 'Visited', 'visited'],
    ['◌', 'Waiting', 'pending']
  ].forEach(([symbol, label, type]) => {
    const item = practiceEl(
      'span',
      'practice-legend-item'
    );

    item.append(
      practiceEl(
        'span',
        `practice-legend-symbol practice-legend-symbol--${type}`,
        symbol
      ),
      document.createTextNode(label)
    );

    legend.appendChild(item);
  });

  // Prediction exercise.
  const predictionBox = practiceEl(
    'div',
    'practice-prediction'
  );

  predictionBox.append(
    practiceEl(
      'span',
      'practice-eyebrow',
      'PREDICT BEFORE REVEAL'
    ),
    practiceEl(
      'h3',
      '',
      'Which node will DFS visit next?'
    )
  );

  const predictionOptions = practiceEl(
    'div',
    'practice-prediction-options'
  );

  const predictionFeedback = practiceEl(
    'div',
    'practice-feedback'
  );

  predictionFeedback.setAttribute('aria-live', 'polite');

  const predictionHint = practiceEl(
    'button',
    'practice-hint-button',
    'Need a hint?'
  );

  predictionHint.type = 'button';

  predictionBox.append(
    predictionOptions,
    predictionHint,
    predictionFeedback
  );

  // Step-by-step explanation.
  const explanationBox = practiceEl(
    'div',
    'practice-step-explanation'
  );

  const explanationHeading = practiceEl(
    'strong',
    '',
    'Ready to begin'
  );

  const explanationText = practiceEl('p');

  explanationText.setAttribute('aria-live', 'polite');

  explanationBox.append(
    explanationHeading,
    explanationText
  );

  // Traversal sequence.
  const visitedSection = practiceEl(
    'div',
    'practice-visited'
  );

  visitedSection.appendChild(
    practiceEl('h4', '', 'Visited order')
  );

  const visitedList = practiceEl(
    'div',
    'practice-visited-list'
  );

  visitedSection.appendChild(visitedList);

  // Step controls.
  const controls = practiceEl(
    'div',
    'practice-controls'
  );

  const previousButton = practiceEl(
    'button',
    'practice-button',
    '← Previous'
  );

  const nextButton = practiceEl(
    'button',
    'practice-button practice-button--primary',
    'Reveal Next Step →'
  );

  const restartButton = practiceEl(
    'button',
    'practice-button',
    'Restart'
  );

  const stepCounter = practiceEl(
    'span',
    'practice-step-counter'
  );

  for (const button of [
    previousButton,
    nextButton,
    restartButton
  ]) {
    button.type = 'button';
  }

  controls.append(
    previousButton,
    nextButton,
    restartButton,
    stepCounter
  );

  treeCard.append(
    treeHeader,
    treeViewport,
    legend,
    predictionBox,
    explanationBox,
    visitedSection,
    controls
  );

  // ------------------------------------------
  // LIVE STACK PANEL
  // ------------------------------------------

  const stackCard = practiceEl(
    'aside',
    'practice-card practice-stack-card'
  );

  stackCard.append(
    practiceEl(
      'span',
      'practice-eyebrow',
      'LIVE STACK'
    ),
    practiceEl('h3', '', 'Nodes waiting to be visited'),
    practiceEl(
      'p',
      'practice-muted',
      'The top node is the next one DFS will visit.'
    )
  );

  const stackStatus = practiceEl(
    'p',
    'practice-stack-status'
  );

  const stackList = practiceEl(
    'div',
    'practice-stack-list'
  );

  const stackNote = practiceEl(
    'div',
    'practice-stack-note',
    'For a left-first DFS, the right child ' +
    'is pushed before the left child, ' +
    'so the left child is removed first.'
  );

  stackCard.append(
    stackStatus,
    stackList,
    stackNote
  );

  searchLayout.append(
    treeCard,
    stackCard
  );

  const searchResult = practiceEl(
    'div',
    'practice-search-result'
  );

  searchResult.hidden = true;
  searchResult.setAttribute('aria-live', 'polite');

  searchSection.append(
    searchLayout,
    searchResult
  );

  // ------------------------------------------
  // UPDATE DFS TREE
  // ------------------------------------------

  function updateTree(step) {
    treeSvg.querySelectorAll('.practice-tree-node')
      .forEach(group => {
        const value = Number(group.dataset.node);

        group.classList.remove(
          'is-current',
          'is-visited',
          'is-pending'
        );

        let symbol = '';
        let state = 'Not visited';

        if (value === step.current) {
          group.classList.add('is-current');
          symbol = 'NOW';
          state = 'Current';
        } else if (step.visited.includes(value)) {
          group.classList.add('is-visited');
          symbol = '✓';
          state = 'Visited';
        } else if (step.stack.includes(value)) {
          group.classList.add('is-pending');
          symbol = 'WAIT';
          state = 'Waiting on stack';
        }

        group.querySelector(
          '.practice-tree-state'
        ).textContent = symbol;

        group.setAttribute(
          'aria-label',
          `Node ${value}: ${state}`
        );
      });
  }

  // ------------------------------------------
  // UPDATE LIVE STACK
  // ------------------------------------------

  function updateStack(step) {
    stackList.replaceChildren();

    const count = step.stack.length;

    stackStatus.textContent =
      `${count} pending node${count === 1 ? '' : 's'}`;

    if (!count) {
      stackList.appendChild(
        practiceEl(
          'p',
          'practice-stack-empty',
          'The stack is empty.'
        )
      );
      return;
    }

    step.stack.forEach((value, index) => {
      const item = practiceEl(
        'div',
        'practice-stack-item',
        String(value)
      );

      if (index === 0) {
        item.classList.add('is-top');

        item.appendChild(
          practiceEl(
            'span',
            'practice-stack-top',
            'TOP'
          )
        );
      }

      stackList.appendChild(item);
    });
  }

  // ------------------------------------------
  // UPDATE VISITED ORDER
  // ------------------------------------------

  function updateVisited(step) {
    visitedList.replaceChildren();

    if (!step.visited.length) {
      visitedList.appendChild(
        practiceEl(
          'span',
          'practice-visited-empty',
          'No nodes visited yet.'
        )
      );
      return;
    }

    step.visited.forEach((value, index) => {
      visitedList.appendChild(
        practiceEl(
          'span',
          'practice-visited-chip',
          String(value)
        )
      );

      if (index < step.visited.length - 1) {
        visitedList.appendChild(
          practiceEl(
            'span',
            'practice-visited-arrow',
            '→'
          )
        );
      }
    });
  }

  // ------------------------------------------
  // PREDICT THE NEXT NODE
  // ------------------------------------------

  function renderPrediction() {
    predictionOptions.replaceChildren();
    predictionFeedback.textContent = '';
    predictionFeedback.className = 'practice-feedback';

    selectedPrediction = null;

    const finished = stepIndex === steps.length - 1;

    if (finished) {
      predictionBox.hidden = true;
      return;
    }

    predictionBox.hidden = false;

    const currentStep = steps[stepIndex];
    const expected = steps[stepIndex + 1].current;

    // Three node choices and one "Not sure".
    const options = [expected];

    for (const node of PRACTICE_TREE) {
      if (options.length >= 3) break;

      if (
        node.value !== expected &&
        !options.includes(node.value)
      ) {
        options.push(node.value);
      }
    }

    options.forEach(value => {
      const button = practiceEl(
        'button',
        'practice-answer',
        String(value)
      );

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        selectedPrediction = value;
        predictionAttempts++;

        predictionOptions.querySelectorAll('button')
          .forEach(other => {
            other.setAttribute(
              'aria-pressed',
              String(other === button)
            );
          });

        if (value === expected) {
          predictionFeedback.className =
            'practice-feedback is-correct';

          predictionFeedback.textContent =
            'Correct! This is the next node ' +
            'at the top of the stack.';
        } else {
          wrongAnswers++;

          predictionFeedback.className =
            'practice-feedback is-review';

          predictionFeedback.textContent =
            `Not quite. The next node is ${expected}. ` +
            'Remember that the last node pushed ' +
            'comes off first.';
        }

        updateControls();
        updateReadiness();
      });

      predictionOptions.appendChild(button);
    });

    const unsureButton = practiceEl(
      'button',
      'practice-answer',
      'Not sure'
    );

    unsureButton.type = 'button';
    unsureButton.setAttribute('aria-pressed', 'false');

    unsureButton.addEventListener('click', () => {
      selectedPrediction = 'unsure';
      predictionAttempts++;
      hintCount++;

      predictionOptions.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === unsureButton)
          );
        });

      predictionFeedback.className =
        'practice-feedback is-review';

      predictionFeedback.textContent =
        `The next node is ${expected}, ` +
        'which is the top item on the stack.';

      updateControls();
      updateReadiness();
    });

    predictionOptions.appendChild(unsureButton);

    predictionHint.onclick = () => {
      hintCount++;

      predictionFeedback.className =
        'practice-feedback is-review';

      predictionFeedback.textContent =
        currentStep.stack.length
          ? 'Look at the stack on the right. ' +
            'The item marked TOP is visited next.'
          : 'There are no pending nodes.';

      updateReadiness();
    };
  }

  // ------------------------------------------
  // FULL SEARCH STATE UPDATE
  // ------------------------------------------

  function updateControls() {
    const finished = stepIndex === steps.length - 1;

    previousButton.disabled = stepIndex === 0;

    nextButton.disabled =
      finished || selectedPrediction === null;

    nextButton.textContent = finished
      ? 'Search Complete ✓'
      : 'Reveal Next Step →';

    stepCounter.textContent =
      `Step ${stepIndex} of ${steps.length - 1}`;
  }

  function updateSearch() {
    const step = steps[stepIndex];
    const finished = stepIndex === steps.length - 1;

    updateTree(step);
    updateStack(step);
    updateVisited(step);

    explanationHeading.textContent =
      stepIndex === 0
        ? 'Ready to begin'
        : `Step ${stepIndex}: Visit ${step.current}`;

    explanationText.textContent = step.explanation;

    if (finished) {
      predictionBox.hidden = true;
      searchResult.hidden = false;

      const found = step.found;

      searchResult.className =
        'practice-search-result is-complete';

      searchResult.textContent = found
        ? `Target ${target} was found after ` +
          `${step.visited.length} visits.`
        : `Target ${target} was not found. ` +
          'DFS visited every node and the stack is empty. ' +
          'A search can finish without finding its target.';

      markComplete('search');
    } else {
      searchResult.hidden = true;
    }

    renderPrediction();
    updateControls();
  }

  previousButton.addEventListener('click', () => {
    if (stepIndex > 0) {
      stepIndex--;
      updateSearch();
    }
  });

  nextButton.addEventListener('click', () => {
    if (
      selectedPrediction !== null &&
      stepIndex < steps.length - 1
    ) {
      stepIndex++;
      updateSearch();
    }
  });

  restartButton.addEventListener('click', () => {
    stepIndex = 0;
    updateSearch();
  });

  // ==========================================
  // 03 — IN-ORDER TRAVERSAL PRACTICE
  // ==========================================

  const inorder = practiceEl(
    'section',
    'practice-card practice-inorder'
  );

  inorder.append(
    practiceEl(
      'span',
      'practice-eyebrow',
      '03 / TRAVERSAL PRACTICE'
    ),
    practiceEl(
      'h2',
      '',
      'Write the in-order traversal'
    ),
    practiceEl(
      'p',
      'practice-muted',
      'For an in-order traversal, visit the left ' +
      'subtree, then the current node, then the ' +
      'right subtree. Use the tree above.'
    )
  );

  const inorderRule = practiceEl(
    'div',
    'practice-rule',
    'LEFT → NODE → RIGHT'
  );

  const inorderForm = practiceEl(
    'form',
    'practice-inorder-form'
  );

  const inorderLabel = practiceEl(
    'label',
    '',
    'Enter the node values in visiting order'
  );

  const inorderInput = practiceEl(
    'input',
    'practice-inorder-input'
  );

  inorderInput.type = 'text';
  inorderInput.placeholder = 'e.g. 10, 20, 30';
  inorderInput.autocomplete = 'off';

  inorderLabel.appendChild(inorderInput);

  const inorderSubmit = practiceEl(
    'button',
    'practice-button practice-button--primary',
    'Check my answer'
  );

  inorderSubmit.type = 'submit';

  const inorderHint = practiceEl(
    'button',
    'practice-hint-button',
    'Give me a hint'
  );

  inorderHint.type = 'button';

  const inorderFeedback = practiceEl(
    'div',
    'practice-feedback'
  );

  inorderFeedback.setAttribute('aria-live', 'polite');

  const inorderHintText = practiceEl(
    'div',
    'practice-inorder-hint'
  );

  inorderHintText.hidden = true;

  const inorderActions = practiceEl(
    'div',
    'practice-inorder-actions'
  );

  inorderActions.append(
    inorderSubmit,
    inorderHint
  );

  inorderForm.append(
    inorderLabel,
    inorderActions
  );

  let inorderHintLevel = 0;

  inorderHint.addEventListener('click', () => {
    inorderHintLevel++;
    hintCount++;

    const messages = [
      'Begin with the smallest value in the ' +
      'leftmost part of the tree.',
      'Visit 20, then 30, then 40. ' +
      'What comes after the left subtree?',
      'The root 50 comes after its left subtree. ' +
      'Continue through the right subtree.'
    ];

    inorderHintText.hidden = false;
    inorderHintText.textContent =
      messages[Math.min(inorderHintLevel - 1, 2)];

    updateReadiness();
  });

  inorderForm.addEventListener('submit', event => {
    event.preventDefault();

    const raw = inorderInput.value.trim();

    if (!raw) {
      inorderFeedback.className =
        'practice-feedback is-review';

      inorderFeedback.textContent =
        'Enter the traversal first. ' +
        'You can use the hint if you are unsure.';
      return;
    }

    const parts = raw
      .split(/[\s,;→]+/)
      .filter(Boolean);

    const values = parts.map(value => Number(value));

    const valid =
      values.length === correctInOrder.length &&
      values.every(Number.isInteger);

    inorderAttempts++;

    if (!valid) {
      inorderFeedback.className =
        'practice-feedback is-review';

      inorderFeedback.textContent =
        'Enter all seven node values, separated ' +
        'by commas or spaces.';

      updateReadiness();
      return;
    }

    const correct = values.every(
      (value, index) =>
        value === correctInOrder[index]
    );

    if (correct) {
      inorderFeedback.className =
        'practice-feedback is-correct';

      inorderFeedback.textContent =
        `Correct! ${correctInOrder.join(' → ')}. ` +
        'In-order traversal of a BST visits ' +
        'its values in ascending order.';

      markComplete('inorder');
    } else {
      wrongAnswers++;

      inorderFeedback.className =
        'practice-feedback is-review';

      const firstMismatch = values.findIndex(
        (value, index) =>
          value !== correctInOrder[index]
      );

      inorderFeedback.textContent =
        `Check position ${firstMismatch + 1}. ` +
        'Remember: left subtree, node, right subtree. ' +
        'Try again or request a hint.';
    }

    updateReadiness();
  });

  inorder.append(
    inorderRule,
    inorderForm,
    inorderHintText,
    inorderFeedback
  );

  // ==========================================
  // 04 — REFLECTION AND READINESS
  // ==========================================

  const reflection = practiceEl(
    'section',
    'practice-card practice-reflection'
  );

  reflection.append(
    practiceEl(
      'span',
      'practice-eyebrow',
      '04 / CHECK YOUR READINESS'
    ),
    practiceEl(
      'h2',
      '',
      'What did you discover?'
    ),
    practiceEl(
      'p',
      'practice-muted',
      'Answer one final question to connect ' +
      'the practical activity to the algorithm.'
    ),
    practiceEl(
      'h3',
      '',
      `What does it mean if DFS finishes ` +
      `searching for ${target} without finding it?`
    )
  );

  const reflectionOptions = practiceEl(
    'div',
    'practice-answer-options'
  );

  const reflectionFeedback = practiceEl(
    'div',
    'practice-feedback'
  );

  reflectionFeedback.setAttribute('aria-live', 'polite');

  const reflectionAnswers = [
    {
      text: 'The target must be at the root',
      correct: false
    },
    {
      text: 'The target is absent from this tree',
      correct: true
    },
    {
      text: 'The tree is not a valid BST',
      correct: false
    },
    {
      text: 'Not sure',
      correct: false
    }
  ];

  reflectionAnswers.forEach(option => {
    const button = practiceEl(
      'button',
      'practice-answer',
      option.text
    );

    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
      reflectionOptions.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

      reflectionFeedback.className = option.correct
        ? 'practice-feedback is-correct'
        : 'practice-feedback is-review';

      if (option.correct) {
        reflectionFeedback.textContent =
          'Correct! Once DFS has checked every node ' +
          'and the stack is empty, the target is ' +
          'not present in the tree.';

        markComplete('reflection');
      } else {
        wrongAnswers += option.text === 'Not sure' ? 0 : 1;

        reflectionFeedback.textContent =
          'Think about what an empty stack means. ' +
          'If no nodes remain to check, ' +
          'where else could DFS search? Try again.';
      }

      updateReadiness();
    });

    reflectionOptions.appendChild(button);
  });

  // Readiness recommendation.
  const readiness = practiceEl(
    'div',
    'practice-readiness'
  );

  const readinessTitle = practiceEl(
    'h3',
    '',
    'Your practice summary'
  );

  const readinessText = practiceEl(
    'p',
    '',
    'Complete the activities above to receive ' +
    'guidance for your next step.'
  );

  const readinessLink = practiceEl(
    'a',
    'practice-review-link',
    'Review DFS Introduction →'
  );

  readinessLink.href = '#/concept-idea';

  readiness.append(
    readinessTitle,
    readinessText,
    readinessLink
  );

  function updateReadiness() {
    if (completed.size < 4) {
      readinessTitle.textContent =
        'Your practice summary';

      readinessText.textContent =
        `You have completed ${completed.size} of 4 activities. ` +
        'Keep practising to receive your readiness feedback.';

      readinessLink.textContent =
        'Review DFS Introduction →';

      readinessLink.href = '#/concept-idea';
      return;
    }

    if (wrongAnswers === 0 && hintCount === 0) {
      readinessTitle.textContent =
        "You're ready for the quiz!";

      readinessText.textContent =
        'You completed the practice activities ' +
        'without requesting hints or making ' +
        'incorrect attempts. Continue to the quiz.';

      readinessLink.textContent =
        'Continue to Quiz →';

      readinessLink.href = '#/quiz';
    } else {
      readinessTitle.textContent =
        'Good progress — review and continue';

      readinessText.textContent =
        'You completed all four activities. ' +
        'You used feedback or hints along the way, ' +
        'which is part of learning. Review the ' +
        'concepts you found difficult before the quiz.';

      readinessLink.textContent =
        'Review DFS Introduction →';

      readinessLink.href = '#/concept-idea';
    }
  }

  reflection.append(
    reflectionOptions,
    reflectionFeedback,
    readiness
  );

  // ==========================================
  // BOTTOM NAVIGATION
  // ==========================================

  const navigation = practiceEl(
    'nav',
    'practice-page-navigation'
  );

  navigation.setAttribute(
    'aria-label',
    'Practice navigation'
  );

  const backLink = practiceEl(
    'a',
    'practice-page-navigation__back',
    '← Explorer'
  );

  backLink.href = '#/worked-example';

  const nextLink = practiceEl(
    'a',
    'practice-page-navigation__next',
    'Next: Quiz →'
  );

  nextLink.href = '#/quiz';

  navigation.append(
    backLink,
    nextLink
  );

  // ==========================================
  // ASSEMBLE PAGE
  // ==========================================

  page.append(
    progress,
    intro,
    recall,
    searchSection,
    inorder,
    reflection,
    navigation
  );

  container.appendChild(page);

  updateSearch();
  updateReadiness();

  // Clean up the header observer when
  // navigating away from the practice page.
  return () => {
    headerObserver?.disconnect();
  };
}
