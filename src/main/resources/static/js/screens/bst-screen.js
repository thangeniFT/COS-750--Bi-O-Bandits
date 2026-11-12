
/**
 * COS212 DFS Tutor — BST Introduction
 * Figma Page 2
 *
 * Sections:
 * 01 Warm-up
 * 02 Vocabulary
 * 03 Explore the tree
 * 04 Knowledge check
 *
 * Warm-up questions come from lesson.json.
 */

const INITIAL_VALUES = [50, 30, 70, 20, 40, 60, 80];
const MAX_NODES = 15;
const SVG_NS = 'http://www.w3.org/2000/svg';

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
  return {
    value,
    parent,
    left: null,
    right: null
  };
}

function insertNode(root, value) {
  if (!root) return createNode(value);

  let current = root;

  while (true) {
    if (value === current.value) return root;

    const side = value < current.value
      ? 'left'
      : 'right';

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

  INITIAL_VALUES.forEach(value => {
    root = insertNode(root, value);
  });

  return root;
}

function findNode(root, value) {
  let current = root;

  while (current) {
    if (current.value === value) return current;

    current = value < current.value
      ? current.left
      : current.right;
  }

  return null;
}

function countNodes(root) {
  if (!root) return 0;

  return (
    1 +
    countNodes(root.left) +
    countNodes(root.right)
  );
}

function describeNode(node) {
  if (!node) return 'No node selected.';

  const facts = [];

  if (!node.parent) {
    facts.push(`${node.value} is the root of the tree.`);
  } else {
    const parent = node.parent;

    const side = parent.left === node
      ? 'left'
      : 'right';

    facts.push(
      `${node.value} is the ${side} child of ${parent.value}.`
    );

    facts.push(`Parent: ${parent.value}.`);

    const sibling = side === 'left'
      ? parent.right
      : parent.left;

    if (sibling) {
      facts.push(`Sibling: ${sibling.value}.`);
    }
  }

  const children = [
    node.left,
    node.right
  ].filter(Boolean);

  if (children.length === 0) {
    facts.push('It is a leaf because it has no children.');
  } else {
    facts.push(
      `Children: ${children.map(child => child.value).join(', ')}.`
    );

    facts.push(
      'This node and its descendants form a subtree.'
    );
  }

  return facts.join(' ');
}

/* ==========================================
   INTERACTIVE SVG TREE
   ========================================== */

function drawTree(svg, root, state, onSelect) {
  svg.replaceChildren();

  const entries = [];

  function collect(node, depth = 0) {
    if (!node) return;

    collect(node.left, depth + 1);
    entries.push({ node, depth });
    collect(node.right, depth + 1);
  }

  collect(root);

  if (!entries.length) return;

  const maxDepth = Math.max(
    ...entries.map(entry => entry.depth)
  );

  const width = Math.max(760, entries.length * 92);
  const height = Math.max(355, 150 + maxDepth * 110);

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'group');
  svg.setAttribute(
    'aria-label',
    'Interactive Binary Search Tree diagram'
  );

  const positions = new Map();

  entries.forEach(({ node, depth }, index) => {
    const x = entries.length === 1
      ? width / 2
      : 65 + index * (width - 130) /
        (entries.length - 1);

    positions.set(node, {
      x,
      y: 65 + depth * 110
    });
  });

  // Connections are drawn behind the nodes.
  entries.forEach(({ node }) => {
    if (!node.parent) return;

    const parent = positions.get(node.parent);
    const child = positions.get(node);

    const classes = ['bst-tree-edge'];

    if (node.value === state.newValue) {
      classes.push('bst-tree-edge--new');
    }

    if (
      state.answerPath.has(node.value) &&
      state.answerPath.has(node.parent.value)
    ) {
      classes.push('is-answer-path');
    }

    svg.appendChild(svgEl('line', {
      x1: parent.x,
      y1: parent.y,
      x2: child.x,
      y2: child.y,
      class: classes.join(' ')
    }));
  });

  entries.forEach(({ node }) => {
    const { x, y } = positions.get(node);

    const classes = ['bst-tree-node'];

    if (node === state.selected) {
      classes.push('is-selected');
    }

    if (node === state.active) {
      classes.push('is-active');
    }

    if (node === state.highlighted) {
      classes.push('is-rule-highlight');
    }

    if (node.value === state.newValue) {
      classes.push('is-new');
    }

    if (state.answerPath.has(node.value)) {
      classes.push('is-answer-path');
    }

    const group = svgEl('g', {
      class: classes.join(' '),
      'data-value': node.value,
      tabindex: '0',
      role: 'button',
      'aria-pressed': String(node === state.selected),
      'aria-label':
        `Select node ${node.value}. ${describeNode(node)}`
    });

    const circle = svgEl('circle', {
      cx: x,
      cy: y,
      r: 27
    });

    const number = svgEl('text', {
      x,
      y,
      class: 'bst-tree-value'
    });

    number.textContent = String(node.value);

    group.append(circle, number);

    // Only ROOT and LEAF labels.
    // This prevents child labels overlapping branches.
    if (!node.parent || (!node.left && !node.right)) {
      const label = svgEl('text', {
        x,
        y: node.parent ? y + 45 : y - 41,
        class: 'bst-tree-role'
      });

      label.textContent = node.parent ? 'LEAF' : 'ROOT';

      group.appendChild(label);
    }

    if (node.value === state.newValue) {
      const tag = svgEl('text', {
        x: x + 37,
        y: y - 28,
        class: 'bst-tree-new-label'
      });

      tag.textContent = 'NEW';
      group.appendChild(tag);
    }

    group.addEventListener('click', () => {
      onSelect(node);
    });

    group.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(node, true);
      }
    });

    svg.appendChild(group);
  });
}

/* ==========================================
   MAIN SCREEN
   ========================================== */

export function render(screen, container) {
  const page = el('div', 'bst-page');

  let root = buildExample();

  const treeState = {
    selected: root,
    active: null,
    highlighted: null,
    newValue: null,
    answerPath: new Set()
  };

  let pendingInsertion = null;
  let playbackTimer = null;
  let playing = false;
  let destroyed = false;

  const timeoutTasks = new Set();
  const completedSections = new Set();

  // ------------------------------------------
  // ANIMATION HELPERS
  // ------------------------------------------

  function wait(ms) {
    return new Promise(resolve => {
      const task = {
        id: null,
        resolve
      };

      task.id = setTimeout(() => {
        timeoutTasks.delete(task);
        resolve();
      }, ms);

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

  // ------------------------------------------
  // STICKY HEADER OFFSET
  // ------------------------------------------

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
    'BINARY SEARCH TREES'
  );

  const progressLabel = el(
    'span',
    '',
    'Step 0 of 4'
  );

  progressHeader.append(progressTitle, progressLabel);

  const progressTrack = el(
    'div',
    'lesson-progress__track'
  );

  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute(
    'aria-label',
    'BST activity progress'
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

  progress.append(
    progressHeader,
    progressTrack
  );

  function markComplete(section) {
    if (completedSections.has(section)) return;

    completedSections.add(section);

    const count = completedSections.size;

    progressLabel.textContent = `Step ${count} of 4`;

    progressFill.style.width = `${count * 25}%`;

    progressTrack.setAttribute(
      'aria-valuenow',
      String(count)
    );
  }

  // ==========================================
  // 01 — WARM-UP
  // ==========================================

  const warmup = el(
    'section',
    'bst-card bst-warmup-card'
  );

  warmup.id = 'bst-warmup';

  warmup.append(
    el('span', 'bst-eyebrow', '01 / WARM-UP'),
    el('h2', '', 'Quick warm-up'),
    el(
      'p',
      'bst-muted',
      'Check what you already know about trees ' +
      'and stacks. You can ask for help and try again.'
    )
  );

  const warmupGrid = el('div', 'bst-warmup-grid');

  const warmupResult = el(
    'div',
    'bst-warmup-result'
  );

  warmupResult.hidden = true;
  warmupResult.setAttribute('aria-live', 'polite');

  const questions = screen.warmup?.questions || [];
  const refreshers = screen.warmup?.refreshers || {};

  const warmupCorrect = new Set();
  const warmupAttempted = new Set();
  const warmupNeedsReview = new Set();

  function updateWarmupResult() {
    if (warmupAttempted.size !== questions.length) return;
    if (questions.length === 0) return;

    warmupResult.hidden = false;

    if (warmupCorrect.size === questions.length) {
      warmupResult.className =
        'bst-warmup-result is-ready';

      warmupResult.textContent =
        "You're ready! You've recalled the basics " +
        'of trees and stacks. Continue to vocabulary.';

      markComplete('warmup');
      return;
    }

    warmupResult.className =
      'bst-warmup-result is-review';

    if (warmupNeedsReview.has('stacks')) {
      warmupResult.textContent =
        'Review stacks first. Watch the short ' +
        'animation and retry the question.';
    } else {
      warmupResult.textContent =
        'Review the tree explanation and try again. ' +
        'This activity is not graded.';
    }
  }

  questions.forEach((question, questionIndex) => {
    const questionCard = el(
      'article',
      'bst-warmup-question'
    );

    const heading = el(
      'h3',
      '',
      `${questionIndex + 1}. ${question.prompt}`
    );

    const answers = el('div', 'bst-answer-options');

    const feedback = el(
      'div',
      'bst-answer-feedback'
    );

    feedback.setAttribute('aria-live', 'polite');

    // Extra explanation with a mini visual.
    const help = el('div', 'bst-warmup-help');
    help.hidden = true;

    if (question.refresher === 'trees') {
      const diagram = el('div', 'bst-mini-diagram');

      diagram.innerHTML = `
        <svg viewBox="0 0 180 110"
             role="img"
             aria-label="A root node 50 connected to children 30 and 70">
          <line x1="90" y1="25" x2="40" y2="85"/>
          <line x1="90" y1="25" x2="140" y2="85"/>
          <circle cx="90" cy="25" r="18"/>
          <circle cx="40" cy="85" r="18"/>
          <circle cx="140" cy="85" r="18"/>
          <text x="90" y="30">50</text>
          <text x="40" y="90">30</text>
          <text x="140" y="90">70</text>
        </svg>
      `;

      help.append(
        diagram,
        el(
          'p',
          '',
          refreshers.trees ||
          'A tree has a root, connected child nodes and no cycles.'
        )
      );
    }

    if (question.refresher === 'stacks') {
      const demo = el('div', 'bst-stack-demo');

      const stackTitle = el(
        'strong',
        '',
        'Watch how a stack works'
      );

      const stackVisual = el(
        'div',
        'bst-stack-demo__items'
      );

      const stackMessage = el(
        'p',
        'bst-stack-demo__message',
        'Push 1, then 2, then 3.'
      );

      stackMessage.setAttribute('aria-live', 'polite');

      const watchButton = el(
        'button',
        'bst-demo-button',
        'Watch stack animation'
      );

      watchButton.type = 'button';

      let demoRunning = false;

      watchButton.addEventListener('click', async () => {
        if (demoRunning || destroyed) return;

        demoRunning = true;
        watchButton.disabled = true;

        let stack = [];

        function renderStack() {
          stackVisual.replaceChildren();

          [...stack].reverse().forEach((value, index) => {
            const item = el(
              'div',
              'bst-stack-demo__item',
              String(value)
            );

            if (index === 0) {
              item.classList.add('is-top');
            }

            stackVisual.appendChild(item);
          });
        }

        for (const value of [1, 2, 3]) {
          if (destroyed) return;

          stack.push(value);
          stackMessage.textContent = `Push ${value}.`;
          renderStack();

          await wait(700);
        }

        if (destroyed) return;

        stackMessage.textContent =
          'The last value pushed is 3, ' +
          'so 3 is popped first.';

        await wait(950);

        if (destroyed) return;

        stack.pop();
        renderStack();

        stackMessage.textContent =
          '3 came off first. This is Last In, First Out (LIFO).';

        demoRunning = false;
        watchButton.disabled = false;
      });

      demo.append(
        stackTitle,
        stackVisual,
        stackMessage,
        watchButton
      );

      help.append(
        demo,
        el(
          'p',
          '',
          refreshers.stacks ||
          'A stack follows Last In, First Out.'
        )
      );
    }

    // Real questions are loaded from lesson.json.
    const questionOptions = [
      ...question.options,
      {
        id: 'unsure',
        text: 'Not sure',
        unsure: true
      }
    ];

    questionOptions.forEach(option => {
      const button = el(
        'button',
        'bst-answer',
        option.text
      );

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        warmupAttempted.add(question.id);

        answers.querySelectorAll('button').forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

        const correct = option.correct === true;

        if (correct) {
          warmupCorrect.add(question.id);
          warmupNeedsReview.delete(question.refresher);

          feedback.className =
            'bst-answer-feedback is-correct';

          feedback.textContent =
            question.refresher === 'stacks'
              ? 'Correct! The last item pushed comes off first.'
              : 'Correct! A tree has connected nodes and no cycles.';

          help.hidden = true;
        } else {
          warmupCorrect.delete(question.id);
          warmupNeedsReview.add(question.refresher);

          feedback.className =
            'bst-answer-feedback is-review';

          feedback.textContent = option.unsure
            ? "That's okay. Read the explanation below, " +
              'then try again.'
            : 'Not quite. Use the explanation below ' +
              'to work through the answer.';

          help.hidden = false;
        }

        updateWarmupResult();
      });

      answers.appendChild(button);
    });

    questionCard.append(
      heading,
      answers,
      feedback,
      help
    );

    warmupGrid.appendChild(questionCard);
  });

  if (questions.length === 0) {
    warmupResult.hidden = false;
    warmupResult.textContent =
      'Warm-up questions are unavailable. ' +
      'Check the warmup section in lesson.json.';
  }

  warmup.append(
    warmupGrid,
    warmupResult
  );

  // ==========================================
  // INTRODUCTION
  // ==========================================

  const intro = el(
    'section',
    'bst-card bst-intro-card'
  );

  intro.append(
    el('h2', '', 'Binary Search Trees'),
    el(
      'p',
      '',
      'A Binary Search Tree (BST) stores values ' +
      'in connected nodes. Each node has at most ' +
      'two children. Smaller values belong to the ' +
      'left subtree and larger values to the right.'
    )
  );

  // ==========================================
  // 02 — VOCABULARY
  // ==========================================

  const vocabulary = el(
    'section',
    'bst-card bst-vocabulary'
  );

  vocabulary.id = 'bst-vocabulary';

  vocabulary.append(
    el('span', 'bst-eyebrow', '02 / VOCABULARY'),
    el('h2', '', 'Meet the tree'),
    el(
      'p',
      'bst-muted',
      'Select each term to learn what it means. ' +
      'The matching node will be highlighted below.'
    )
  );

  const vocabularyChips = el(
    'div',
    'bst-vocabulary__chips'
  );

  const vocabularyFeedback = el(
    'p',
    'bst-vocabulary__feedback',
    'Choose a term to begin.'
  );

  vocabularyFeedback.setAttribute('aria-live', 'polite');

  const vocabularySeen = new Set();

  const vocabularyTerms = [
    {
      term: 'Root',
      node: 50,
      explanation:
        'The root is the top node where the tree starts. ' +
        'In this example, it is 50.'
    },
    {
      term: 'Parent',
      node: 30,
      explanation:
        'A parent has at least one child. ' +
        'Node 30 is the parent of 20 and 40.'
    },
    {
      term: 'Leaf',
      node: 20,
      explanation:
        'A leaf has no children. Node 20 is a leaf.'
    },
    {
      term: 'Subtree',
      node: 70,
      explanation:
        'A subtree is a node and all its descendants. ' +
        'The subtree rooted at 70 contains 70, 60 and 80.'
    }
  ];

  vocabularyTerms.forEach(item => {
    const chip = el(
      'button',
      'bst-vocabulary__chip',
      item.term
    );

    chip.type = 'button';
    chip.setAttribute('aria-pressed', 'false');

    chip.addEventListener('click', () => {
      vocabularySeen.add(item.term);

      vocabularyChips.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === chip)
          );
        });

      vocabularyFeedback.textContent = item.explanation;

      const node = findNode(root, item.node);

      if (node) {
        treeState.selected = node;
        treeState.highlighted = node;
        refreshTree();
        updateSelectedPanel();
      }

      if (vocabularySeen.size === vocabularyTerms.length) {
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
  // 03 — EXPLORE
  // ==========================================

  const exploreHeading = el(
    'div',
    'bst-section-title'
  );

  exploreHeading.append(
    el('span', 'bst-eyebrow', '03 / EXPLORE'),
    el('h2', '', 'Explore the tree'),
    el(
      'p',
      'bst-muted',
      'Select a node to learn about its relationships, ' +
      'or insert a value to see how the tree grows.'
    )
  );

  const treeCard = el(
    'section',
    'bst-card bst-tree-card'
  );

  const treeHeading = el(
    'div',
    'bst-tree-heading'
  );

  const treeHeadingText = el(
    'div',
    'bst-tree-heading__text'
  );

  const nodeCount = el('span', 'bst-node-count');

  treeHeadingText.append(
    el('h3', '', 'Interactive tree'),
    el(
      'p',
      'bst-tree-description',
      'Click a node to inspect its parent, children and siblings.'
    )
  );

  treeHeading.append(treeHeadingText, nodeCount);

  const treeViewport = el(
    'div',
    'bst-tree-viewport'
  );

  const svg = svgEl('svg', {
    class: 'bst-lesson-svg'
  });

  treeViewport.appendChild(svg);

  // Selected-node panel
  const selectedPanel = el(
    'section',
    'bst-selected-panel'
  );

  const selectedPanelTitle = el(
    'h4',
    '',
    'Selected node'
  );

  const selectedDetails = el(
    'p',
    'bst-selected-panel__details'
  );

  selectedDetails.setAttribute(
    'aria-live',
    'polite'
  );

  selectedPanel.append(
    selectedPanelTitle,
    selectedDetails
  );

  function updateSelectedPanel() {
    selectedDetails.textContent =
      describeNode(treeState.selected);
  }

  function selectNode(node, restoreFocus = false) {
    treeState.selected = node;
    treeState.highlighted = null;

    refreshTree();
    updateSelectedPanel();

    if (restoreFocus) {
      svg.querySelector(
        `[data-value="${node.value}"]`
      )?.focus();
    }
  }

  function refreshTree() {
    if (destroyed) return;

    nodeCount.textContent = `${countNodes(root)} nodes`;

    drawTree(
      svg,
      root,
      treeState,
      selectNode
    );
  }

  // Legend
  const legend = el(
    'div',
    'bst-tree-legend'
  );

  const legendItems = [
    ['○', 'Normal', 'normal'],
    ['◌', 'Comparing', 'comparing'],
    ['●', 'Selected', 'selected'],
    ['+', 'New', 'new']
  ];

  legendItems.forEach(([symbol, label, type]) => {
    const item = el('span', 'bst-legend-item');

    item.append(
      el(
        'span',
        `bst-legend-symbol bst-legend-symbol--${type}`,
        symbol
      ),
      document.createTextNode(label)
    );

    legend.appendChild(item);
  });

  // Short, expandable explanation.
  const treeNote = el(
    'details',
    'bst-tree-note'
  );

  treeNote.append(
    el('summary', '', 'How to read this tree — More'),
    el(
      'p',
      '',
      'Start at 50. Smaller values go left and ' +
      'larger values go right. Follow each branch ' +
      'to see how nodes are connected.'
    )
  );

  // Insertion explanation
  const explanation = el(
    'p',
    'bst-insertion-explanation',
    'Try inserting 65 into the tree.'
  );

  explanation.setAttribute('aria-live', 'polite');
  explanation.setAttribute('aria-atomic', 'true');

  // Insertion form
  const form = el('form', 'bst-insert-form');

  const inputLabel = el(
    'label',
    '',
    'Insert a value (0–99)'
  );

  const input = el('input');

  input.id = 'bst-insert-value';
  input.type = 'number';
  input.min = '0';
  input.max = '99';
  input.step = '1';
  input.placeholder = 'e.g. 65';

  inputLabel.htmlFor = input.id;

  const insertButton = el(
    'button',
    'btn btn--primary',
    'Start insertion'
  );

  insertButton.type = 'submit';

  const resetButton = el(
    'button',
    'btn',
    'Reset tree'
  );

  resetButton.type = 'button';

  form.append(
    inputLabel,
    input,
    insertButton,
    resetButton
  );

  // ------------------------------------------
  // INSERTION PLAYER
  // ------------------------------------------

  const player = el(
    'div',
    'bst-insertion-player'
  );

  const nextButton = el(
    'button',
    'btn btn--primary',
    'Next →'
  );

  nextButton.type = 'button';

  const playButton = el(
    'button',
    'btn',
    'Play'
  );

  playButton.type = 'button';

  const speedLabel = el(
    'label',
    '',
    'Speed'
  );

  const speedSelect = el(
    'select',
    'bst-speed'
  );

  const speeds = [
    ['1500', 'Slow'],
    ['850', 'Normal'],
    ['400', 'Fast']
  ];

  speeds.forEach(([value, text]) => {
    const option = el('option', '', text);

    option.value = value;

    if (value === '850') {
      option.selected = true;
    }

    speedSelect.appendChild(option);
  });

  speedLabel.appendChild(speedSelect);

  player.append(
    nextButton,
    playButton,
    speedLabel
  );

  function updatePlayer() {
    const hasPending = pendingInsertion !== null;

    nextButton.disabled = !hasPending || playing;
    playButton.disabled = !hasPending;

    input.disabled = hasPending;
    insertButton.disabled = hasPending;

    playButton.textContent = playing ? 'Pause' : 'Play';
  }

  function getInsertionPath(value) {
    const path = [];
    let current = root;

    while (current) {
      const direction = value < current.value
        ? 'left'
        : 'right';

      path.push({
        node: current,
        direction
      });

      current = current[direction];
    }

    return path;
  }

  function prepareInsertion(value) {
    stopPlayback();

    if (!Number.isInteger(value) || value < 0 || value > 99) {
      explanation.textContent =
        'Please enter a whole number between 0 and 99.';
      return false;
    }

    if (findNode(root, value)) {
      explanation.textContent =
        `${value} already exists in the tree. ` +
        'Try another number.';
      return false;
    }

    if (countNodes(root) >= MAX_NODES) {
      explanation.textContent =
        'The tree has reached its practice limit of 15 nodes. ' +
        'Reset the tree to start again.';
      return false;
    }

    treeState.active = null;
    treeState.newValue = null;
    treeState.highlighted = null;
    treeState.answerPath.clear();

    pendingInsertion = {
      value,
      path: getInsertionPath(value),
      index: 0
    };

    explanation.textContent =
      `Ready to insert ${value}. ` +
      'Use Next to compare values one at a time, ' +
      'or Play to watch automatically.';

    refreshTree();
    updatePlayer();

    return true;
  }

  function advanceInsertion() {
    if (!pendingInsertion) return;

    const { value, path, index } = pendingInsertion;
    const step = path[index];

    treeState.active = step.node;
    treeState.selected = step.node;

    const symbol = step.direction === 'left'
      ? '<'
      : '>';

    const comparison =
      `${value} ${symbol} ${step.node.value}: ` +
      `go ${step.direction}.`;

    pendingInsertion.index += 1;

    if (pendingInsertion.index >= path.length) {
      const added = createNode(value, step.node);

      step.node[step.direction] = added;

      treeState.selected = added;
      treeState.active = null;
      treeState.newValue = value;

      pendingInsertion = null;

      stopPlayback();

      explanation.textContent =
        `${comparison} Success! ${value} is now the ` +
        `${step.direction} child of ${step.node.value}.`;

      markComplete('explore');
    } else {
      explanation.textContent = comparison;
    }

    refreshTree();
    updateSelectedPanel();
    updatePlayer();
  }

  nextButton.addEventListener('click', () => {
    if (!playing) advanceInsertion();
  });

  playButton.addEventListener('click', () => {
    if (playing) {
      stopPlayback();
      updatePlayer();
      return;
    }

    if (!pendingInsertion) return;

    playing = true;
    updatePlayer();

    playbackTimer = setInterval(() => {
      advanceInsertion();
    }, Number(speedSelect.value));
  });

  speedSelect.addEventListener('change', () => {
    if (!playing) return;

    clearInterval(playbackTimer);

    playbackTimer = setInterval(() => {
      advanceInsertion();
    }, Number(speedSelect.value));
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const raw = input.value.trim();

    if (raw === '') {
      explanation.textContent =
        'Enter a value first. Try 65 as an example.';
      return;
    }

    prepareInsertion(Number(raw));
  });

  function resetTree() {
    stopPlayback();

    root = buildExample();

    treeState.selected = root;
    treeState.active = null;
    treeState.highlighted = null;
    treeState.newValue = null;
    treeState.answerPath.clear();

    pendingInsertion = null;
    input.value = '';

    explanation.textContent =
      'The original tree has been restored. ' +
      'Enter a number to begin.';

    refreshTree();
    updateSelectedPanel();
    updatePlayer();
  }

  resetButton.addEventListener('click', resetTree);

  // ------------------------------------------
  // BST ORDERING RULES
  // ------------------------------------------

  const rulesCard = el(
    'aside',
    'bst-card bst-rules-card'
  );

  rulesCard.append(
    el('span', 'bst-eyebrow', 'THE MAIN IDEA'),
    el('h2', '', 'BST ordering rule'),
    el(
      'p',
      'bst-muted',
      'Each node follows these rules.'
    )
  );

  const rules = [
    {
      symbol: '←',
      title: 'Smaller goes left',
      description: '30 is smaller than 50.',
      value: 30
    },
    {
      symbol: '→',
      title: 'Larger goes right',
      description: '70 is larger than 50.',
      value: 70
    },
    {
      symbol: '=',
      title: 'No duplicates',
      description: 'Each value appears only once.',
      value: 50
    }
  ];

  rules.forEach(rule => {
    const item = el(
      'button',
      'bst-rule-item'
    );

    item.type = 'button';

    item.append(
      el('span', 'bst-rule-icon', rule.symbol),
      el('strong', '', rule.title),
      el(
        'span',
        'bst-rule-description',
        rule.description
      )
    );

    const highlight = () => {
      treeState.highlighted = findNode(root, rule.value);
      refreshTree();
    };

    const clearHighlight = () => {
      treeState.highlighted = null;
      refreshTree();
    };

    item.addEventListener('mouseenter', highlight);
    item.addEventListener('mouseleave', clearHighlight);

    item.addEventListener('focus', highlight);
    item.addEventListener('blur', clearHighlight);

    item.addEventListener('click', () => {
      const node = findNode(root, rule.value);

      if (node) {
        treeState.selected = node;
        updateSelectedPanel();
        refreshTree();
      }
    });

    rulesCard.appendChild(item);
  });

  // Assemble tree card.
  treeCard.append(
    treeHeading,
    treeViewport,
    selectedPanel,
    legend,
    treeNote,
    explanation,
    form,
    player
  );

  const layout = el(
    'div',
    'bst-content-grid'
  );

  layout.append(
    treeCard,
    rulesCard
  );

  // ==========================================
  // 04 — KNOWLEDGE CHECK
  // ==========================================

  const check = el(
    'section',
    'bst-card bst-check-card'
  );

  check.id = 'bst-knowledge-check';

  check.append(
    el('span', 'bst-eyebrow', '04 / CHECK'),
    el('h2', '', 'Can you apply the BST rule?'),
    el(
      'p',
      '',
      'In the original example tree, ' +
      'where would 65 be inserted?'
    )
  );

  const checkAnswers = el(
    'div',
    'bst-answer-options'
  );

  const checkFeedback = el(
    'div',
    'bst-answer-feedback'
  );

  checkFeedback.setAttribute('aria-live', 'polite');

  const checkOptions = [
    { text: 'Left child of 60', correct: false },
    { text: 'Right child of 60', correct: true },
    { text: 'Right child of 80', correct: false },
    { text: 'Not sure', correct: false }
  ];

  checkOptions.forEach(option => {
    const button = el(
      'button',
      'bst-answer',
      option.text
    );

    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
      checkAnswers.querySelectorAll('button').forEach(other => {
        other.setAttribute(
          'aria-pressed',
          String(other === button)
        );
      });

      if (option.correct) {
        checkFeedback.className =
          'bst-answer-feedback is-correct';

        checkFeedback.textContent =
          'Correct! Compare 65 with 50, then 70, then 60. ' +
          'It becomes the right child of 60.';

        treeState.answerPath = new Set([50, 70, 60]);

        markComplete('check');
      } else {
        checkFeedback.className =
          'bst-answer-feedback is-review';

        checkFeedback.textContent =
          option.text === 'Not sure'
            ? 'That is okay. Follow 65 through the tree: ' +
              'start at 50, then compare with 70 and 60. ' +
              'Use Show me if you want to watch.'
            : 'Not quite. Compare 65 with 50, then 70, ' +
              'then 60. Try again, or select Show me.';

        treeState.answerPath.clear();
      }

      refreshTree();
    });

    checkAnswers.appendChild(button);
  });

  const showMeButton = el(
    'button',
    'bst-show-me',
    'Show me →'
  );

  showMeButton.type = 'button';

  showMeButton.addEventListener('click', () => {
    resetTree();

    input.value = '65';

    if (!prepareInsertion(65)) return;

    playing = true;
    updatePlayer();

    playbackTimer = setInterval(() => {
      advanceInsertion();
    }, Number(speedSelect.value));

    treeCard.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });

  check.append(
    checkAnswers,
    checkFeedback,
    showMeButton
  );

  // ==========================================
  // NEXT LESSON
  // ==========================================

  const lessonNavigation = el(
    'nav',
    'bst-lesson-navigation'
  );

  lessonNavigation.setAttribute(
    'aria-label',
    'BST lesson navigation'
  );

  const nextLesson = el(
  'a',
  'bst-next-button',
  'Next Lesson →'
);

nextLesson.href = '#/concept-idea';

lessonNavigation.appendChild(nextLesson);

  // ==========================================
  // ASSEMBLE PAGE
  // ==========================================

  page.append(
    progress,
    warmup,
    intro,
    vocabulary,
    exploreHeading,
    layout,
    check,
    lessonNavigation
  );

  container.appendChild(page);

  refreshTree();
  updateSelectedPanel();
  updatePlayer();

  // Cleanup when navigating to another screen.
  return () => {
    destroyed = true;

    stopPlayback();

    if (headerObserver) {
      headerObserver.disconnect();
    }

    for (const task of timeoutTasks) {
      clearTimeout(task.id);
      task.resolve();
    }

    timeoutTasks.clear();
  };
}
