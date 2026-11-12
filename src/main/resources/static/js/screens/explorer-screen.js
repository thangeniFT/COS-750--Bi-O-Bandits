
/**
 * COS212 DFS Tutor — Interactive DFS Explorer
 * Figma Page 4
 *
 * Supports:
 * - Pre-order, in-order and post-order
 * - Full traversal or target search
 * - Correct iterative stack operations
 * - Step controls and automatic playback
 * - Predict before reveal
 * - BST insertion and reset
 * - Four learning milestones
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const INITIAL = [50, 30, 70, 20, 40, 60, 80];
const MAX_NODES = 15;

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

function createNode(value, parent = null) {
  return { value, parent, left: null, right: null };
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

function makeTree() {
  let root = null;
  INITIAL.forEach(value => {
    root = insertNode(root, value);
  });
  return root;
}

function findNode(root, value) {
  let current = root;

  while (current) {
    if (value === current.value) return current;
    current = value < current.value
      ? current.left : current.right;
  }
  return null;
}

function countNodes(root) {
  return root
    ? 1 + countNodes(root.left) + countNodes(root.right)
    : 0;
}

/**
 * Iterative DFS using operation frames.
 *
 * PRE:  visit, left, right
 * IN:   left, visit, right
 * POST: left, right, visit
 *
 * The stack's top is the last array element.
 * The visual stack reverses this for display.
 */
function generateSteps(root, order, mode, target) {
  if (!root) return [];

  const stack = [{ node: root, action: 'enter' }];
  const visited = [];
  const steps = [];

  function snapshot(current, explanation) {
    return {
      current,
      visited: [...visited],
      stack: [...stack].reverse().map(task => ({
        value: task.node.value,
        action: task.action
      })),
      explanation
    };
  }

  steps.push(snapshot(
    null,
    'The root is ready. Predict the first node, ' +
    'then reveal the next step.'
  ));

  while (stack.length > 0) {
    const task = stack.pop();
    const node = task.node;

    if (task.action === 'visit') {
      visited.push(node.value);

      let explanation =
        `Visit ${node.value}. ` +
        `The traversal has visited ${visited.length} ` +
        `${visited.length === 1 ? 'node' : 'nodes'}.`;

      const found =
        mode === 'search' && node.value === target;

      if (found) {
        explanation =
          `Target ${target} found! DFS visited ` +
          `${visited.length} nodes.`;
        stack.length = 0;
      }

      steps.push(snapshot(node.value, explanation));
      if (found) break;
      continue;
    }

    if (order === 'PRE_ORDER') {
      if (node.right) {
        stack.push({
          node: node.right,
          action: 'enter'
        });
      }

      if (node.left) {
        stack.push({
          node: node.left,
          action: 'enter'
        });
      }

      stack.push({ node, action: 'visit' });
    }

    if (order === 'IN_ORDER') {
      if (node.right) {
        stack.push({
          node: node.right,
          action: 'enter'
        });
      }

      stack.push({ node, action: 'visit' });

      if (node.left) {
        stack.push({
          node: node.left,
          action: 'enter'
        });
      }
    }

    if (order === 'POST_ORDER') {
      stack.push({ node, action: 'visit' });

      if (node.right) {
        stack.push({
          node: node.right,
          action: 'enter'
        });
      }

      if (node.left) {
        stack.push({
          node: node.left,
          action: 'enter'
        });
      }
    }
  }

  return steps;
}

/* ============================================
   DRAW THE TREE
   ============================================ */

function drawTree(svg, root, step) {
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
    0, ...entries.map(entry => entry.depth)
  );

  const width = Math.max(640, entries.length * 85);
  const height = Math.max(345, 120 + maxDepth * 105);

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    'Interactive tree showing Depth-First Search progress'
  );

  const positions = new Map();

  entries.forEach(({ node, depth }, index) => {
    const x = entries.length === 1
      ? width / 2
      : 55 + index * (width - 110) /
        (entries.length - 1);

    positions.set(node, {
      x,
      y: 54 + depth * 105
    });
  });

  // Draw connections.
  entries.forEach(({ node }) => {
    if (!node.parent) return;

    const parent = positions.get(node.parent);
    const child = positions.get(node);

    svg.appendChild(svgEl('line', {
      x1: parent.x,
      y1: parent.y,
      x2: child.x,
      y2: child.y,
      class: 'explorer-edge'
    }));
  });

  const visited = new Set(step.visited);
  const pending = new Set(
    step.stack.map(item => item.value)
  );

  entries.forEach(({ node }) => {
    const { x, y } = positions.get(node);

    const classes = ['explorer-node'];

    let state = 'Not visited';

    if (node.value === step.current) {
      classes.push('is-current');
      state = 'Current node';
    } else if (visited.has(node.value)) {
      classes.push('is-visited');
      state = 'Visited';
    } else if (pending.has(node.value)) {
      classes.push('is-pending');
      state = 'Waiting on stack';
    }

    const group = svgEl('g', {
      class: classes.join(' '),
      'aria-label': `Node ${node.value}: ${state}`
    });

    const circle = svgEl('circle', {
      cx: x,
      cy: y,
      r: 26
    });

    const number = svgEl('text', {
      x,
      y,
      class: 'explorer-node-value'
    });

    number.textContent = String(node.value);

    const symbol = svgEl('text', {
      x,
      y: y + 43,
      class: 'explorer-node-symbol'
    });

    symbol.textContent =
      node.value === step.current ? 'NOW' :
      visited.has(node.value) ? '✓' :
      pending.has(node.value) ? 'WAIT' : '';

    group.append(circle, number, symbol);
    svg.appendChild(group);
  });
}

/* ============================================
   MAIN EXPLORER
   ============================================ */

export function render(screen, container) {
  const page = el('div', 'explorer-page');

  let root = makeTree();
  let order = screen.order || 'PRE_ORDER';
  let mode = 'search';
  let target = Number.isInteger(Number(screen.target))
    ? Number(screen.target) : 60;

  let steps = [];
  let stepIndex = 0;
  let prediction = null;
  let playing = false;
  let playTimer = null;
  let treeEdited = false;

  const completed = new Set();
  const completedOrders = new Set();

  // Track header height for sticky progress.
  const header = document.querySelector('.app-header');
  let headerObserver = null;

  function measureHeader() {
    if (!header) return;

    document.documentElement.style.setProperty(
      '--app-header-height',
      `${Math.ceil(header.getBoundingClientRect().height)}px`
    );
  }

  measureHeader();

  if (header && typeof ResizeObserver !== 'undefined') {
    headerObserver = new ResizeObserver(measureHeader);
    headerObserver.observe(header);
  }

  // ==========================================
  // STICKY PROGRESS
  // ==========================================

  const progress = el('div', 'lesson-progress');
  const progressHeader = el(
    'div', 'lesson-progress__header'
  );

  const progressLabel = el(
    'span', '', 'DFS EXPLORER'
  );

  const progressCount = el(
    'span', '', 'Step 0 of 4'
  );

  progressHeader.append(progressLabel, progressCount);

  const progressTrack = el(
    'div', 'lesson-progress__track'
  );

  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute(
    'aria-label', 'Explorer activity progress'
  );
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '4');
  progressTrack.setAttribute('aria-valuenow', '0');

  const progressFill = el(
    'div', 'lesson-progress__fill'
  );

  progressFill.style.width = '0%';
  progressTrack.appendChild(progressFill);
  progress.append(progressHeader, progressTrack);

  function markComplete(key) {
    if (completed.has(key)) return;

    completed.add(key);

    progressCount.textContent =
      `Step ${completed.size} of 4`;

    progressFill.style.width =
      `${completed.size * 25}%`;

    progressTrack.setAttribute(
      'aria-valuenow',
      String(completed.size)
    );
  }

  // ==========================================
  // PAGE INTRODUCTION
  // ==========================================

  const intro = el('section', 'explorer-intro');

  intro.append(
    el(
      'span',
      'explorer-eyebrow',
      'INTERACTIVE LEARNING'
    ),
    el('h1', '', 'Explore Depth-First Search'),
    el(
      'p',
      '',
      'Choose a traversal order, search for a value, ' +
      'or change the tree. Predict the next node and ' +
      'see how DFS works.'
    )
  );

  // ==========================================
  // 01 — EXPLORER CONFIGURATION
  // ==========================================

  const setup = el('section', 'explorer-card explorer-setup');

  setup.append(
    el('span', 'explorer-eyebrow', '01 / EXPLORE'),
    el('h2', '', 'Choose your exploration')
  );

  const configGrid = el('div', 'explorer-config-grid');

  const orderField = el('label', 'explorer-field');
  orderField.appendChild(
    el('span', '', 'Traversal order')
  );

  const orderSelect = el('select');

  [
    ['PRE_ORDER', 'Pre-order — Root, Left, Right'],
    ['IN_ORDER', 'In-order — Left, Root, Right'],
    ['POST_ORDER', 'Post-order — Left, Right, Root']
  ].forEach(([value, label]) => {
    const option = el('option', '', label);
    option.value = value;
    orderSelect.appendChild(option);
  });

  orderSelect.value = order;
  orderField.appendChild(orderSelect);

  const modeField = el('label', 'explorer-field');
  modeField.appendChild(el('span', '', 'Activity'));

  const modeSelect = el('select');

  [
    ['search', 'Search for a value'],
    ['traverse', 'Visit every node']
  ].forEach(([value, label]) => {
    const option = el('option', '', label);
    option.value = value;
    modeSelect.appendChild(option);
  });

  modeSelect.value = mode;
  modeField.appendChild(modeSelect);

  const targetField = el('label', 'explorer-field');
  targetField.appendChild(el('span', '', 'Target value'));

  const targetInput = el('input');
  targetInput.type = 'number';
  targetInput.min = '0';
  targetInput.max = '99';
  targetInput.step = '1';
  targetInput.value = String(target);

  targetField.appendChild(targetInput);

  const configureButton = el(
    'button',
    'explorer-button explorer-button--primary',
    'Start exploration'
  );

  configureButton.type = 'button';

  const configFeedback = el(
    'p', 'explorer-feedback'
  );
  configFeedback.setAttribute('aria-live', 'polite');

  configGrid.append(
    orderField,
    modeField,
    targetField,
    configureButton
  );

  setup.append(configGrid, configFeedback);

  // ==========================================
  // INTERACTIVE VISUALIZATION
  // ==========================================

  const layout = el('div', 'explorer-layout');

  const treeCard = el(
    'section', 'explorer-card explorer-tree-card'
  );

  const treeHeading = el('div', 'explorer-card-heading');

  const treeTitle = el(
    'h2', '', 'Interactive tree'
  );

  const nodeCount = el('span', 'explorer-count');

  treeHeading.append(treeTitle, nodeCount);

  const treeViewport = el('div', 'explorer-tree-viewport');

  const svg = svgEl('svg', {
    class: 'explorer-svg'
  });

  treeViewport.appendChild(svg);

  // State legend: colour plus symbols.
  const legend = el('div', 'explorer-legend');

  [
    ['○', 'Not visited', 'default'],
    ['●', 'Current', 'current'],
    ['✓', 'Visited', 'visited'],
    ['◌', 'Pending', 'pending']
  ].forEach(([symbol, name, type]) => {
    const item = el('span', 'explorer-legend-item');

    item.append(
      el(
        'span',
        `explorer-legend-symbol explorer-legend-symbol--${type}`,
        symbol
      ),
      document.createTextNode(name)
    );

    legend.appendChild(item);
  });

  // Prediction panel
  const predictBox = el(
    'section', 'explorer-prediction'
  );

  predictBox.append(
    el('span', 'explorer-eyebrow', 'PREDICT BEFORE REVEAL'),
    el('h3', '', 'Which node will be visited next?')
  );

  const predictOptions = el(
    'div', 'explorer-prediction-options'
  );

  const predictFeedback = el(
    'p', 'explorer-feedback'
  );
  predictFeedback.setAttribute('aria-live', 'polite');

  predictBox.append(predictOptions, predictFeedback);

  // Explanation of current step
  const explanation = el(
    'div', 'explorer-explanation'
  );

  const explanationTitle = el(
    'strong', '', 'Ready to begin'
  );

  const explanationText = el('p');
  explanationText.setAttribute('aria-live', 'polite');

  explanation.append(
    explanationTitle,
    explanationText
  );

  // Visited sequence
  const traversalPanel = el(
    'div', 'explorer-traversal'
  );

  traversalPanel.appendChild(
    el('h3', '', 'Visited order')
  );

  const visitedList = el(
    'div', 'explorer-visited-list'
  );

  traversalPanel.appendChild(visitedList);

  // Player
  const controls = el('div', 'explorer-controls');

  const previousButton = el(
    'button', 'explorer-button', '← Previous'
  );

  const nextButton = el(
    'button',
    'explorer-button explorer-button--primary',
    'Next Step →'
  );

  const playButton = el(
    'button', 'explorer-button', 'Play'
  );

  const restartButton = el(
    'button', 'explorer-button', 'Restart'
  );

  [previousButton, nextButton, playButton, restartButton]
    .forEach(button => {
      button.type = 'button';
    });

  const speedLabel = el('label', 'explorer-speed');
  speedLabel.appendChild(el('span', '', 'Speed'));

  const speedSelect = el('select');

  [
    ['1500', 'Slow'],
    ['900', 'Normal'],
    ['400', 'Fast']
  ].forEach(([value, label]) => {
    const option = el('option', '', label);
    option.value = value;
    speedSelect.appendChild(option);
  });

  speedSelect.value = '900';
  speedLabel.appendChild(speedSelect);

  const stepCounter = el(
    'span', 'explorer-step-counter'
  );

  controls.append(
    previousButton,
    nextButton,
    playButton,
    restartButton,
    speedLabel,
    stepCounter
  );

  treeCard.append(
    treeHeading,
    treeViewport,
    legend,
    predictBox,
    explanation,
    traversalPanel,
    controls
  );

  // ==========================================
  // LIVE STACK
  // ==========================================

  const stackCard = el(
    'aside',
    'explorer-card explorer-stack-card'
  );

  stackCard.append(
    el('span', 'explorer-eyebrow', 'LIVE ALGORITHM STATE'),
    el('h2', '', 'Operation stack'),
    el(
      'p',
      'explorer-muted',
      'The top operation is handled first. ' +
      'VISIT records a node. EXPLORE opens a branch.'
    )
  );

  const stackStatus = el(
    'p', 'explorer-stack-status'
  );

  const stackList = el(
    'div', 'explorer-stack-list'
  );

  const stackNote = el(
    'div',
    'explorer-stack-note',
    'The stack also stores pending operations. ' +
    'That is how in-order and post-order correctly ' +
    'delay visiting parent nodes.'
  );

  stackCard.append(
    stackStatus,
    stackList,
    stackNote
  );

  layout.append(treeCard, stackCard);

  // ==========================================
  // 02 — COMPARE ORDERS
  // ==========================================

  const compareCard = el(
    'section', 'explorer-card explorer-info-card'
  );

  compareCard.append(
    el('span', 'explorer-eyebrow', '02 / COMPARE'),
    el('h2', '', 'Try a different traversal'),
    el(
      'p',
      'explorer-muted',
      'Run a complete traversal using a second order. ' +
      'Compare the visited sequences. ' +
      'In-order traversal of a BST produces ascending values.'
    )
  );

  // ==========================================
  // 03 — EXPERIMENT WITH THE TREE
  // ==========================================

  const experiment = el(
    'section', 'explorer-card explorer-experiment'
  );

  experiment.append(
    el('span', 'explorer-eyebrow', '03 / EXPERIMENT'),
    el('h2', '', 'Change the tree'),
    el(
      'p',
      'explorer-muted',
      'Insert a unique whole number between 0 and 99, ' +
      'then run DFS again to see how the result changes.'
    )
  );

  const insertForm = el('form', 'explorer-insert-form');

  const insertLabel = el('label', 'explorer-field');
  insertLabel.appendChild(
    el('span', '', 'New node value')
  );

  const insertInput = el('input');
  insertInput.type = 'number';
  insertInput.min = '0';
  insertInput.max = '99';
  insertInput.step = '1';
  insertInput.placeholder = 'e.g. 65';

  insertLabel.appendChild(insertInput);

  const insertButton = el(
    'button',
    'explorer-button explorer-button--primary',
    'Insert node'
  );

  insertButton.type = 'submit';

  const resetTreeButton = el(
    'button', 'explorer-button', 'Reset tree'
  );

  resetTreeButton.type = 'button';

  const insertFeedback = el(
    'p', 'explorer-feedback'
  );
  insertFeedback.setAttribute('aria-live', 'polite');

  insertForm.append(
    insertLabel, insertButton, resetTreeButton
  );

  experiment.append(
    insertForm, insertFeedback
  );

  // ==========================================
  // 04 — REFLECT
  // ==========================================

  const reflect = el(
    'section', 'explorer-card explorer-reflect'
  );

  reflect.append(
    el('span', 'explorer-eyebrow', '04 / REFLECT'),
    el('h2', '', 'What did you discover?'),
    el(
      'p',
      '',
      'Which traversal lists the values of a ' +
      'Binary Search Tree in ascending order?'
    )
  );

  const reflectOptions = el(
    'div', 'explorer-reflect-options'
  );

  const reflectFeedback = el(
    'p', 'explorer-feedback'
  );

  reflectFeedback.setAttribute('aria-live', 'polite');

  [
    ['Pre-order', false],
    ['In-order', true],
    ['Post-order', false],
    ['Not sure', false]
  ].forEach(([label, correct]) => {
    const button = el(
      'button', 'explorer-answer', label
    );

    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
      reflectOptions.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

      reflectFeedback.className = correct
        ? 'explorer-feedback is-correct'
        : 'explorer-feedback is-review';

      reflectFeedback.textContent = correct
        ? 'Correct! In-order visits the left subtree, ' +
          'then the node, then the right subtree.'
        : 'Try again. In a BST, smaller values are on ' +
          'the left and larger values are on the right.';

      if (correct) markComplete('reflect');
    });

    reflectOptions.appendChild(button);
  });

  reflect.append(
    reflectOptions,
    reflectFeedback
  );

  // ==========================================
  // NEXT PAGE
  // ==========================================

  const navigation = el(
    'nav', 'explorer-page-navigation'
  );

  navigation.setAttribute(
    'aria-label', 'Explorer navigation'
  );

  const backLink = el(
    'a',
    'explorer-page-navigation__back',
    '← Previous Lesson'
  );

  backLink.href = '#/concept-idea';

  const nextLink = el(
    'a',
    'explorer-page-navigation__next',
    'Next: Practice →'
  );

  nextLink.href = '#/practice';

  navigation.append(backLink, nextLink);

  // ==========================================
  // PLAYER STATE AND BEHAVIOUR
  // ==========================================

  function stopPlayback() {
    if (playTimer !== null) {
      clearInterval(playTimer);
      playTimer = null;
    }

    playing = false;
  }

  function finishRun() {
    if (mode === 'traverse') {
      completedOrders.add(order);

      if (completedOrders.size >= 1) {
        markComplete('explore');
      }

      if (completedOrders.size >= 2) {
        markComplete('compare');
      }
    }

    if (treeEdited) {
      markComplete('experiment');
    }
  }

  function renderStack(step) {
    stackList.replaceChildren();

    stackStatus.textContent =
      `${step.stack.length} pending operations`;

    if (step.stack.length === 0) {
      stackList.appendChild(
        el(
          'p',
          'explorer-stack-empty',
          'No pending operations.'
        )
      );
      return;
    }

    step.stack.forEach((task, index) => {
      const item = el(
        'div', 'explorer-stack-item'
      );

      if (index === 0) {
        item.classList.add('is-top');
      }

      const label = task.action === 'visit'
        ? 'VISIT'
        : 'EXPLORE';

      item.append(
        el('strong', '', String(task.value)),
        el('span', '', label)
      );

      stackList.appendChild(item);
    });
  }

  function renderVisited(step) {
    visitedList.replaceChildren();

    if (!step.visited.length) {
      visitedList.appendChild(
        el(
          'span',
          'explorer-visit-empty',
          'No nodes visited yet.'
        )
      );
      return;
    }

    step.visited.forEach((value, index) => {
      visitedList.appendChild(
        el('span', 'explorer-visit-chip', String(value))
      );

      if (index < step.visited.length - 1) {
        visitedList.appendChild(
          el('span', 'explorer-visit-arrow', '→')
        );
      }
    });
  }

  function updateButtons() {
    const finished = stepIndex >= steps.length - 1;

    previousButton.disabled = stepIndex === 0;
    nextButton.disabled =
      finished || prediction === null;

    playButton.disabled = finished;
    playButton.textContent = playing ? 'Pause' : 'Play';

    nextButton.textContent = finished
      ? 'Completed ✓'
      : 'Reveal Next Step →';

    stepCounter.textContent =
      `Step ${stepIndex} of ${Math.max(0, steps.length - 1)}`;
  }

  function renderPrediction() {
    predictOptions.replaceChildren();
    predictFeedback.textContent = '';
    predictFeedback.className = 'explorer-feedback';
    prediction = null;

    if (stepIndex >= steps.length - 1) {
      predictBox.hidden = true;
      return;
    }

    predictBox.hidden = false;

    const correctValue = steps[stepIndex + 1].current;

    // Three distinct node options plus Not sure.
    const options = [correctValue];

    for (const nodeValue of INITIAL) {
      if (options.length >= 3) break;
      if (
        findNode(root, nodeValue) &&
        !options.includes(nodeValue)
      ) {
        options.push(nodeValue);
      }
    }

    function selectPrediction(value, button) {
      prediction = value;

      predictOptions.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

      const correct = value === correctValue;

      predictFeedback.className = correct
        ? 'explorer-feedback is-correct'
        : 'explorer-feedback is-review';

      predictFeedback.textContent = correct
        ? `Correct! ${correctValue} is visited next.`
        : `The next node is ${correctValue}. ` +
          'Review the operation stack, then reveal the step.';

      updateButtons();
    }

    options.forEach(value => {
      const button = el(
        'button', 'explorer-answer', String(value)
      );

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        selectPrediction(value, button);
      });

      predictOptions.appendChild(button);
    });

    const unsure = el(
      'button', 'explorer-answer', 'Not sure'
    );

    unsure.type = 'button';

    unsure.addEventListener('click', () => {
      selectPrediction('unsure', unsure);
    });

    predictOptions.appendChild(unsure);
  }

  function update() {
    const step = steps[stepIndex];
    if (!step) return;

    nodeCount.textContent = `${countNodes(root)} nodes`;

    drawTree(svg, root, step);
    renderStack(step);
    renderVisited(step);

    const finished = stepIndex === steps.length - 1;
    const found = mode === 'search' &&
      step.current === target;

    explanationTitle.textContent =
      finished
        ? found
          ? 'Target found!'
          : 'Exploration complete'
        : stepIndex === 0
          ? 'Ready to begin'
          : `Step ${stepIndex}: Visit ${step.current}`;

    explanationText.textContent =
      finished && mode === 'search' && !found
        ? `Target ${target} was not found after visiting ` +
          `${step.visited.length} nodes.`
        : step.explanation;

    if (finished) finishRun();

    renderPrediction();
    updateButtons();
  }

  function advance() {
    if (stepIndex >= steps.length - 1) return;

    stepIndex += 1;
    update();
  }

  function restartRun(message = '') {
    stopPlayback();

    steps = generateSteps(root, order, mode, target);
    stepIndex = 0;
    prediction = null;

    update();

    if (message) {
      configFeedback.textContent = message;
    }
  }

  function startPlayback() {
    if (playing || stepIndex >= steps.length - 1) {
      return;
    }

    playing = true;
    updateButtons();

    playTimer = setInterval(() => {
      if (stepIndex >= steps.length - 1) {
        stopPlayback();
        updateButtons();
        return;
      }

      // Automatic playback bypasses prediction.
      // Manual Next requires a prediction first.
      advance();

      if (stepIndex >= steps.length - 1) {
        stopPlayback();
        updateButtons();
      }
    }, Number(speedSelect.value));
  }

  previousButton.addEventListener('click', () => {
    stopPlayback();

    if (stepIndex > 0) {
      stepIndex -= 1;
      update();
    }
  });

  nextButton.addEventListener('click', () => {
    if (prediction !== null) {
      stopPlayback();
      advance();
    }
  });

  playButton.addEventListener('click', () => {
    if (playing) {
      stopPlayback();
      updateButtons();
    } else {
      startPlayback();
    }
  });

  restartButton.addEventListener('click', () => {
    restartRun();
  });

  speedSelect.addEventListener('change', () => {
    if (!playing) return;
    stopPlayback();
    startPlayback();
  });

  function applyConfiguration() {
    const selectedMode = modeSelect.value;
    const selectedOrder = orderSelect.value;

    if (selectedMode === 'search') {
      const raw = targetInput.value.trim();
      const number = Number(raw);

      if (
        raw === '' ||
        !Number.isInteger(number) ||
        number < 0 ||
        number > 99
      ) {
        configFeedback.className =
          'explorer-feedback is-review';

        configFeedback.textContent =
          'Enter a whole number between 0 and 99.';
        return;
      }

      target = number;
    }

    order = selectedOrder;
    mode = selectedMode;

    configFeedback.className = 'explorer-feedback';

    restartRun(
      mode === 'search'
        ? `Searching for ${target} using ${order.replace('_', '-').toLowerCase()}.`
        : 'Ready to visit all nodes. Predict the first node.'
    );
  }

  configureButton.addEventListener(
    'click', applyConfiguration
  );

  modeSelect.addEventListener('change', () => {
    targetField.hidden = modeSelect.value !== 'search';
  });

  insertForm.addEventListener('submit', event => {
    event.preventDefault();

    const raw = insertInput.value.trim();
    const value = Number(raw);

    insertFeedback.className = 'explorer-feedback';

    if (
      raw === '' ||
      !Number.isInteger(value) ||
      value < 0 ||
      value > 99
    ) {
      insertFeedback.className =
        'explorer-feedback is-review';
      insertFeedback.textContent =
        'Please enter a whole number between 0 and 99.';
      return;
    }

    if (findNode(root, value)) {
      insertFeedback.className =
        'explorer-feedback is-review';
      insertFeedback.textContent =
        `${value} is already in the tree. Try another value.`;
      return;
    }

    if (countNodes(root) >= MAX_NODES) {
      insertFeedback.className =
        'explorer-feedback is-review';
      insertFeedback.textContent =
        'The tree has reached 15 nodes. Reset to continue.';
      return;
    }

    root = insertNode(root, value);
    treeEdited = true;

    insertFeedback.className =
      'explorer-feedback is-correct';

    insertFeedback.textContent =
      `${value} was inserted successfully. ` +
      'Run DFS to see the new traversal.';

    insertInput.value = '';
    restartRun();
  });

  resetTreeButton.addEventListener('click', () => {
    root = makeTree();
    treeEdited = false;
    insertInput.value = '';

    insertFeedback.className = 'explorer-feedback';
    insertFeedback.textContent =
      'Original tree restored.';

    restartRun();
  });

  // ==========================================
  // ASSEMBLE THE PAGE
  // ==========================================

  page.append(
    progress,
    intro,
    setup,
    layout,
    compareCard,
    experiment,
    reflect,
    navigation
  );

  container.appendChild(page);

  restartRun();

  return () => {
    stopPlayback();
    headerObserver?.disconnect();
  };
}
