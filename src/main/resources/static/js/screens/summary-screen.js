
/**
 * COS212 DFS Tutor — Learning Summary
 * Page 8 of 8
 *
 * Learning design:
 * - Gagne Event 9: Enhance retention and transfer
 * - Mayer: signalling, coherence and segmenting
 * - Retrieval practice and metacognition
 * - Self-regulated learning
 *
 * Uses the existing lesson.json screen:
 *   id: "summary"
 *   type: "text"
 *
 * Reads quiz results from sessionStorage if
 * Page 6 saved them.
 */

const SUMMARY_STORAGE_KEY = 'cos212-dfs-quiz-result';
const SUMMARY_SVG_NS = 'http://www.w3.org/2000/svg';

function summaryEl(tag, className = '', text = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;
}

function summarySvgEl(tag, attributes = {}) {
  const element = document.createElementNS(
    SUMMARY_SVG_NS,
    tag
  );

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  return element;
}

/* ============================================
   ORIGINAL EXAMPLE BST
   ============================================ */

const SUMMARY_TREE = [
  { value: 50, x: 300, y: 50, left: 30, right: 70 },
  { value: 30, x: 155, y: 150, left: 20, right: 40 },
  { value: 70, x: 445, y: 150, left: 60, right: 80 },
  { value: 20, x: 75, y: 270, left: null, right: null },
  { value: 40, x: 235, y: 270, left: null, right: null },
  { value: 60, x: 365, y: 270, left: null, right: null },
  { value: 80, x: 525, y: 270, left: null, right: null }
];

const SUMMARY_NODE_MAP = new Map(
  SUMMARY_TREE.map(node => [node.value, node])
);

const SUMMARY_ORDERS = {
  PRE_ORDER: {
    name: 'Pre-order',
    rule: 'Root → Left → Right',
    values: [50, 30, 20, 40, 70, 60, 80],
    explanation:
      'Record a node before visiting its children.'
  },

  IN_ORDER: {
    name: 'In-order',
    rule: 'Left → Root → Right',
    values: [20, 30, 40, 50, 60, 70, 80],
    explanation:
      'In a valid BST, the values appear in ascending order.'
  },

  POST_ORDER: {
    name: 'Post-order',
    rule: 'Left → Right → Root',
    values: [20, 40, 30, 60, 80, 70, 50],
    explanation:
      'Record a node after visiting its children.'
  }
};

/* ============================================
   LEARNING OUTCOMES
   ============================================ */

const SUMMARY_CONCEPTS = [
  {
    id: 'bst',
    number: '01',
    title: 'Binary Search Trees',
    description:
      'A BST stores smaller values in the left subtree ' +
      'and larger values in the right subtree.',
    example:
      'In our tree, 30 is left of 50 and 70 is right of 50.',
    href: '#/concept-bst',
    link: 'Review BST Basics'
  },
  {
    id: 'dfs',
    number: '02',
    title: 'Depth-First Search',
    description:
      'DFS follows one path as far as possible before ' +
      'returning to explore another path.',
    example:
      'Left-first DFS visits 50, 30 and 20 before 40.',
    href: '#/concept-idea',
    link: 'Review DFS Introduction'
  },
  {
    id: 'stack',
    number: '03',
    title: 'Stacks and backtracking',
    description:
      'A stack uses Last In, First Out. It remembers ' +
      'pending nodes so DFS can continue after a path ends.',
    example:
      'If the stack is [40, 70], top first, 40 is next.',
    href: '#/concept-idea',
    link: 'Review the live stack'
  },
  {
    id: 'orders',
    number: '04',
    title: 'Traversal orders',
    description:
      'Pre-order, in-order and post-order differ in ' +
      'when they visit a node relative to its subtrees.',
    example:
      'In-order on our BST produces ' +
      '20, 30, 40, 50, 60, 70, 80.',
    href: '#/worked-example',
    link: 'Compare in Explorer'
  },
  {
    id: 'comparison',
    number: '05',
    title: 'DFS versus BST lookup',
    description:
      'DFS follows its traversal order. BST lookup ' +
      'uses the ordering rule to choose a search path.',
    example:
      'A BST lookup for 80 follows 50 → 70 → 80, ' +
      'whereas left-first DFS visits all seven nodes.',
    href: '#/practice',
    link: 'Practise searching'
  }
];

/* ============================================
   DRAW A TREE
   ============================================ */

function createSummaryTree() {
  const svg = summarySvgEl('svg', {
    class: 'summary-tree-svg',
    viewBox: '0 0 600 345',
    role: 'img',
    'aria-label':
      'Binary search tree with root 50, ' +
      'left children 30, 20 and 40, ' +
      'and right children 70, 60 and 80'
  });

  SUMMARY_TREE.forEach(node => {
    [node.left, node.right].forEach(childValue => {
      if (childValue === null) return;

      const child = SUMMARY_NODE_MAP.get(childValue);

      svg.appendChild(summarySvgEl('line', {
        x1: node.x,
        y1: node.y,
        x2: child.x,
        y2: child.y,
        class: 'summary-tree-edge'
      }));
    });
  });

  SUMMARY_TREE.forEach(node => {
    const group = summarySvgEl('g', {
      class: 'summary-tree-node',
      'data-value': node.value
    });

    const circle = summarySvgEl('circle', {
      cx: node.x,
      cy: node.y,
      r: 28
    });

    const label = summarySvgEl('text', {
      x: node.x,
      y: node.y,
      class: 'summary-tree-value'
    });

    label.textContent = String(node.value);

    const orderLabel = summarySvgEl('text', {
      x: node.x,
      y: node.y + 46,
      class: 'summary-tree-order'
    });

    group.append(circle, label, orderLabel);
    svg.appendChild(group);
  });

  return svg;
}

/* ============================================
   READ QUIZ RESULT SAFELY
   ============================================ */

function getSummaryQuizResult() {
  try {
    const raw = sessionStorage.getItem(
      SUMMARY_STORAGE_KEY
    );

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !Array.isArray(parsed.answers) ||
      parsed.answers.length === 0
    ) {
      return null;
    }

    const answers = parsed.answers.filter(answer =>
      answer &&
      typeof answer.outcome === 'string' &&
      typeof answer.correct === 'boolean'
    );

    if (answers.length === 0) return null;

    return {
      correct: answers.filter(a => a.correct).length,
      total: answers.length,
      passMark: Number.isInteger(parsed.passMark)
        ? parsed.passMark
        : 5,
      answers
    };
  } catch {
    return null;
  }
}

/* ============================================
   MAIN SUMMARY PAGE
   ============================================ */

export function render(screen, container) {
  const page = summaryEl('div', 'summary-page');

  const quizResult = getSummaryQuizResult();
  const completed = new Set();
  const readConcepts = new Set();
  const reflectionAnswers = new Set();

  let selectedOrder = 'PRE_ORDER';
  let selectedAction = '';

  // ------------------------------------------
  // STICKY HEADER HEIGHT
  // ------------------------------------------

  const appHeader = document.querySelector('.app-header');
  let headerObserver = null;

  function measureHeader() {
    if (!appHeader) return;

    document.documentElement.style.setProperty(
      '--app-header-height',
      `${Math.ceil(
        appHeader.getBoundingClientRect().height
      )}px`
    );
  }

  measureHeader();

  if (
    appHeader &&
    typeof ResizeObserver !== 'undefined'
  ) {
    headerObserver = new ResizeObserver(measureHeader);
    headerObserver.observe(appHeader);
  }

  // ==========================================
  // PROGRESS BAR
  // ==========================================

  const progress = summaryEl(
    'div',
    'lesson-progress'
  );

  const progressHeader = summaryEl(
    'div',
    'lesson-progress__header'
  );

  const progressTitle = summaryEl(
    'strong',
    '',
    'LEARNING SUMMARY'
  );

  const progressCount = summaryEl(
    'span',
    '',
    'Step 0 of 4'
  );

  progressHeader.append(
    progressTitle,
    progressCount
  );

  const progressTrack = summaryEl(
    'div',
    'lesson-progress__track'
  );

  progressTrack.setAttribute('role', 'progressbar');
  progressTrack.setAttribute(
    'aria-label',
    'Summary activity progress'
  );
  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '4');
  progressTrack.setAttribute('aria-valuenow', '0');

  const progressFill = summaryEl(
    'div',
    'lesson-progress__fill'
  );

  progressFill.style.width = '0%';
  progressTrack.appendChild(progressFill);

  progress.append(progressHeader, progressTrack);

  function markComplete(activity) {
    if (completed.has(activity)) return;

    completed.add(activity);

    progressCount.textContent =
      `Step ${completed.size} of 4`;

    progressFill.style.width =
      `${completed.size * 25}%`;

    progressTrack.setAttribute(
      'aria-valuenow',
      String(completed.size)
    );

    updateCompletion();
  }

  // ==========================================
  // INTRODUCTION
  // ==========================================

  const intro = summaryEl(
    'section',
    'summary-card summary-intro'
  );

  intro.append(
    summaryEl(
      'span',
      'summary-eyebrow',
      'PAGE 8 / REFLECT AND APPLY'
    ),
    summaryEl(
      'h1',
      '',
      'Your Learning Summary'
    ),
    summaryEl(
      'p',
      'summary-lead',
      'You have reached the final section of the ' +
      'DFS Tutor. Review the key ideas, reflect on ' +
      'your learning and prepare to apply them ' +
      'in your Computer Science lecture.'
    ),
    summaryEl(
      'p',
      'summary-muted',
      'Completing this page is not a grade. ' +
      'You can revisit any activity whenever ' +
      'you need more practice.'
    )
  );

  // ==========================================
  // 01 — KEY CONCEPTS
  // ==========================================

  const concepts = summaryEl(
    'section',
    'summary-concepts'
  );

  concepts.append(
    summaryEl(
      'span',
      'summary-eyebrow',
      '01 / RETAIN THE KEY IDEAS'
    ),
    summaryEl(
      'h2',
      '',
      'What have you learned?'
    ),
    summaryEl(
      'p',
      'summary-muted',
      'Open each card to recall the concept, ' +
      'see an example and revisit the lesson ' +
      'if necessary.'
    )
  );

  const conceptGrid = summaryEl(
    'div',
    'summary-concept-grid'
  );

  const conceptStatus = summaryEl(
    'p',
    'summary-concept-status',
    '0 of 5 concepts reviewed'
  );

  conceptStatus.setAttribute(
    'aria-live',
    'polite'
  );

  SUMMARY_CONCEPTS.forEach(concept => {
    const details = summaryEl(
      'details',
      'summary-concept-card'
    );

    const heading = summaryEl(
      'summary',
      'summary-concept-heading'
    );

    heading.append(
      summaryEl(
        'span',
        'summary-concept-number',
        concept.number
      ),
      summaryEl(
        'strong',
        '',
        concept.title
      ),
      summaryEl(
        'span',
        'summary-concept-chevron',
        '⌄'
      )
    );

    const body = summaryEl(
      'div',
      'summary-concept-body'
    );

    body.append(
      summaryEl(
        'p',
        '',
        concept.description
      )
    );

    const example = summaryEl(
      'div',
      'summary-concept-example'
    );

    example.append(
      summaryEl('strong', '', 'Example'),
      summaryEl('p', '', concept.example)
    );

    const link = summaryEl(
      'a',
      'summary-concept-link',
      concept.link + ' →'
    );

    link.href = concept.href;

    body.append(example, link);
    details.append(heading, body);

    details.addEventListener('toggle', () => {
      if (!details.open) return;

      readConcepts.add(concept.id);

      conceptStatus.textContent =
        `${readConcepts.size} of 5 concepts reviewed`;

      if (
        readConcepts.size === SUMMARY_CONCEPTS.length
      ) {
        markComplete('concepts');
      }
    });

    conceptGrid.appendChild(details);
  });

  concepts.append(
    conceptGrid,
    conceptStatus
  );

  // ==========================================
  // TRAVERSAL COMPARISON VISUAL
  // ==========================================

  const visual = summaryEl(
    'section',
    'summary-card summary-visual'
  );

  visual.append(
    summaryEl(
      'span',
      'summary-eyebrow',
      'VISUAL RECAP'
    ),
    summaryEl(
      'h2',
      '',
      'One tree, three traversal orders'
    ),
    summaryEl(
      'p',
      'summary-muted',
      'Select a traversal order to see how ' +
      'the visiting sequence changes.'
    )
  );

  const orderButtons = summaryEl(
    'div',
    'summary-order-buttons'
  );

  const treeViewport = summaryEl(
    'div',
    'summary-tree-viewport'
  );

  const treeSvg = createSummaryTree();
  treeViewport.appendChild(treeSvg);

  const ruleLabel = summaryEl(
    'strong',
    'summary-order-rule'
  );

  const orderExplanation = summaryEl(
    'p',
    'summary-muted'
  );

  const sequence = summaryEl(
    'div',
    'summary-order-sequence'
  );

  function updateOrder() {
    const details = SUMMARY_ORDERS[selectedOrder];

    ruleLabel.textContent =
      `${details.name}: ${details.rule}`;

    orderExplanation.textContent =
      details.explanation;

    sequence.replaceChildren();

    details.values.forEach((value, index) => {
      const chip = summaryEl(
        'span',
        'summary-sequence-chip',
        String(value)
      );

      sequence.appendChild(chip);

      if (index < details.values.length - 1) {
        sequence.appendChild(
          summaryEl(
            'span',
            'summary-sequence-arrow',
            '→'
          )
        );
      }
    });

    const positions = new Map(
      details.values.map((value, index) => [
        value,
        index + 1
      ])
    );

    treeSvg.querySelectorAll('.summary-tree-node')
      .forEach(group => {
        const value = Number(group.dataset.value);

        group.querySelector(
          '.summary-tree-order'
        ).textContent =
          `#${positions.get(value)}`;
      });
  }

  [
    ['PRE_ORDER', 'Pre-order'],
    ['IN_ORDER', 'In-order'],
    ['POST_ORDER', 'Post-order']
  ].forEach(([value, label]) => {
    const button = summaryEl(
      'button',
      'summary-order-button',
      label
    );

    button.type = 'button';
    button.setAttribute(
      'aria-pressed',
      String(value === selectedOrder)
    );

    button.addEventListener('click', () => {
      selectedOrder = value;

      orderButtons.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

      updateOrder();
    });

    orderButtons.appendChild(button);
  });

  visual.append(
    orderButtons,
    treeViewport,
    ruleLabel,
    orderExplanation,
    sequence
  );

  // ==========================================
  // 02 — REFLECT ON PROGRESS
  // ==========================================

  const reflection = summaryEl(
    'section',
    'summary-card summary-reflection'
  );

  reflection.append(
    summaryEl(
      'span',
      'summary-eyebrow',
      '02 / REFLECT ON YOUR PROGRESS'
    ),
    summaryEl(
      'h2',
      '',
      'How has your understanding developed?'
    )
  );

  const resultCard = summaryEl(
    'div',
    'summary-result-card'
  );

  if (quizResult) {
    const ready =
      quizResult.correct >= quizResult.passMark;

    resultCard.append(
      summaryEl(
        'span',
        'summary-result-eyebrow',
        'YOUR MOST RECENT SAVED QUIZ RESULT'
      ),
      summaryEl(
        'strong',
        'summary-result-score',
        `${quizResult.correct} / ${quizResult.total}`
      ),
      summaryEl(
        'p',
        '',
        ready
          ? 'You reached the readiness guideline ' +
            'in your quiz attempt.'
          : 'Your quiz identified concepts that ' +
            'may benefit from more practice.'
      )
    );

    const weakOutcomes = [
      ...new Set(
        quizResult.answers
          .filter(answer => !answer.correct)
          .map(answer => answer.outcome)
      )
    ];

    if (weakOutcomes.length) {
      resultCard.appendChild(
        summaryEl(
          'p',
          'summary-muted',
          'Learning outcomes to revisit: ' +
          weakOutcomes.join(', ')
        )
      );
    }
  } else {
    resultCard.append(
      summaryEl(
        'strong',
        '',
        'No saved quiz result'
      ),
      summaryEl(
        'p',
        '',
        'You can still complete this summary. ' +
        'Visit the Readiness Quiz whenever you ' +
        'want to check your understanding.'
      )
    );
  }

  const resultLink = summaryEl(
    'a',
    'summary-inline-link',
    'Open Readiness Quiz →'
  );

  resultLink.href = '#/quiz';
  resultCard.appendChild(resultLink);

  reflection.appendChild(resultCard);

  const reflectionQuestion = summaryEl(
    'label',
    'summary-reflection-label',
    'Which concept would you like to practise more?'
  );

  const reflectionSelect = summaryEl(
    'select',
    'summary-reflection-select'
  );

  const placeholder = summaryEl(
    'option',
    '',
    'Choose a concept'
  );

  placeholder.value = '';
  reflectionSelect.appendChild(placeholder);

  SUMMARY_CONCEPTS.forEach(concept => {
    const option = summaryEl(
      'option',
      '',
      concept.title
    );

    option.value = concept.id;
    reflectionSelect.appendChild(option);
  });

  reflectionQuestion.appendChild(
    reflectionSelect
  );

  const reflectionFeedback = summaryEl(
    'div',
    'summary-reflection-feedback'
  );

  reflectionFeedback.setAttribute(
    'aria-live',
    'polite'
  );

  reflectionSelect.addEventListener('change', () => {
    const concept = SUMMARY_CONCEPTS.find(
      item => item.id === reflectionSelect.value
    );

    if (!concept) return;

    reflectionFeedback.replaceChildren(
      summaryEl(
        'p',
        '',
        `You chose ${concept.title}. ` +
        'Reviewing it can help reinforce ' +
        'your understanding.'
      )
    );

    const link = summaryEl(
      'a',
      'summary-inline-link',
      concept.link + ' →'
    );

    link.href = concept.href;
    reflectionFeedback.appendChild(link);

    markComplete('reflection');
  });

  reflection.append(
    reflectionQuestion,
    reflectionFeedback
  );

  // ==========================================
  // 03 — TRANSFER YOUR LEARNING
  // ==========================================

  const transfer = summaryEl(
    'section',
    'summary-card summary-transfer'
  );

  transfer.append(
    summaryEl(
      'span',
      'summary-eyebrow',
      '03 / PREPARE FOR THE LECTURE'
    ),
    summaryEl(
      'h2',
      '',
      'Think beyond this example'
    ),
    summaryEl(
      'p',
      'summary-muted',
      'Use what you have learned to answer ' +
      'two questions. These encourage you ' +
      'to apply the ideas in new situations.'
    )
  );

  const transferQuestions = [
    {
      id: 'comparison',
      prompt:
        'Why might BST lookup find a value ' +
        'in fewer visits than plain DFS?',
      options: [
        {
          text:
            'BST lookup uses value comparisons ' +
            'to choose a branch.',
          correct: true
        },
        {
          text:
            'DFS always visits fewer nodes.',
          correct: false
        },
        {
          text:
            'BST lookup must visit every node.',
          correct: false
        },
        {
          text: 'Not sure',
          correct: false
        }
      ],
      explanation:
        'BST lookup uses the ordering property ' +
        'to discard an irrelevant subtree. ' +
        'Plain DFS follows its traversal order.'
    },
    {
      id: 'bfs',
      prompt:
        'When might you prefer exploring a tree ' +
        'level by level instead of depth first?',
      options: [
        {
          text:
            'When you need to find the nearest ' +
            'node or shallowest solution in an ' +
            'unweighted tree.',
          correct: true
        },
        {
          text:
            'When you always want to visit ' +
            'the deepest node first.',
          correct: false
        },
        {
          text:
            'When the tree has no root.',
          correct: false
        },
        {
          text: 'Not sure',
          correct: false
        }
      ],
      explanation:
        'Breadth-first search explores nodes ' +
        'level by level. It is useful for finding ' +
        'a shallowest solution when every edge ' +
        'has the same cost.'
    }
  ];

  const transferGrid = summaryEl(
    'div',
    'summary-transfer-grid'
  );

  function checkTransferCompletion() {
    if (
      reflectionAnswers.size ===
      transferQuestions.length
    ) {
      markComplete('transfer');
    }
  }

  transferQuestions.forEach((question, index) => {
    const card = summaryEl(
      'article',
      'summary-transfer-card'
    );

    card.append(
      summaryEl(
        'span',
        'summary-question-number',
        `QUESTION ${index + 1}`
      ),
      summaryEl('h3', '', question.prompt)
    );

    const options = summaryEl(
      'div',
      'summary-answer-options'
    );

    const feedback = summaryEl(
      'div',
      'summary-answer-feedback'
    );

    feedback.setAttribute('aria-live', 'polite');

    question.options.forEach(option => {
      const button = summaryEl(
        'button',
        'summary-answer-button',
        option.text
      );

      button.type = 'button';
      button.setAttribute(
        'aria-pressed',
        'false'
      );

      button.addEventListener('click', () => {
        options.querySelectorAll('button')
          .forEach(other => {
            other.setAttribute(
              'aria-pressed',
              String(other === button)
            );
          });

        feedback.className = option.correct
          ? 'summary-answer-feedback is-correct'
          : 'summary-answer-feedback is-review';

        feedback.textContent = option.correct
          ? `Correct! ${question.explanation}`
          : `Consider this explanation: ` +
            question.explanation +
            ' Try again.';

        if (option.correct) {
          reflectionAnswers.add(question.id);
          checkTransferCompletion();
        }
      });

      options.appendChild(button);
    });

    card.append(options, feedback);
    transferGrid.appendChild(card);
  });

  transfer.appendChild(transferGrid);

  // ==========================================
  // 04 — CHOOSE NEXT LEARNING ACTION
  // ==========================================

  const nextSection = summaryEl(
    'section',
    'summary-card summary-next'
  );

  nextSection.append(
    summaryEl(
      'span',
      'summary-eyebrow',
      '04 / PLAN YOUR NEXT STEP'
    ),
    summaryEl(
      'h2',
      '',
      'Where would you like to go next?'
    ),
    summaryEl(
      'p',
      'summary-muted',
      'Choose an activity that will help you ' +
      'prepare for the lecture or continue practising.'
    )
  );

  const actionGrid = summaryEl(
    'div',
    'summary-action-grid'
  );

  const actions = [
    {
      id: 'bst',
      title: 'Review BST Basics',
      description:
        'Revisit nodes, roots, leaves and insertion.',
      href: '#/concept-bst'
    },
    {
      id: 'dfs',
      title: 'Review DFS Introduction',
      description:
        'Revisit stack operations and backtracking.',
      href: '#/concept-idea'
    },
    {
      id: 'explorer',
      title: 'Explore the algorithm again',
      description:
        'Experiment with different traversal orders.',
      href: '#/worked-example'
    },
    {
      id: 'quiz',
      title: 'Retry the Readiness Quiz',
      description:
        'Use another attempt to test your knowledge.',
      href: '#/quiz'
    }
  ];

  const actionFeedback = summaryEl(
    'div',
    'summary-action-feedback'
  );

  actionFeedback.setAttribute(
    'aria-live',
    'polite'
  );

  const actionLink = summaryEl(
    'a',
    'summary-button summary-button--primary',
    'Select an activity above'
  );

  actionLink.href = '#/summary';

  actions.forEach(action => {
    const button = summaryEl(
      'button',
      'summary-action-card'
    );

    button.type = 'button';
    button.setAttribute(
      'aria-pressed',
      'false'
    );

    button.append(
      summaryEl(
        'strong',
        '',
        action.title
      ),
      summaryEl(
        'span',
        '',
        action.description
      )
    );

    button.addEventListener('click', () => {
      selectedAction = action.id;

      actionGrid.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

      actionFeedback.textContent =
        `Selected: ${action.title}.`;

      actionLink.href = action.href;
      actionLink.textContent =
        action.title + ' →';

      markComplete('action');
    });

    actionGrid.appendChild(button);
  });

  actionLink.addEventListener('click', event => {
    if (!selectedAction) {
      event.preventDefault();

      actionFeedback.textContent =
        'Choose an activity before using this link.';
    }
  });

  nextSection.append(
    actionGrid,
    actionFeedback,
    actionLink
  );

  // ==========================================
  // COMPLETION MESSAGE
  // ==========================================

  const completion = summaryEl(
    'section',
    'summary-card summary-completion'
  );

  completion.hidden = true;

  const completionHeading = summaryEl(
    'h2',
    '',
    'You have completed the learning summary!'
  );

  const completionText = summaryEl(
    'p',
    '',
    'You reviewed the main concepts, reflected ' +
    'on your understanding, answered transfer ' +
    'questions and selected your next action.'
  );

  const completionNote = summaryEl(
    'p',
    'summary-muted',
    'This confirms completion of the summary ' +
    'activities. It is not a certificate or ' +
    'formal assessment result.'
  );

  completion.append(
    completionHeading,
    completionText,
    completionNote
  );

  function updateCompletion() {
    completion.hidden = completed.size !== 4;
  }

  // ==========================================
  // BOTTOM NAVIGATION
  // ==========================================

  const navigation = summaryEl(
    'nav',
    'summary-navigation'
  );

  navigation.setAttribute(
    'aria-label',
    'Learning summary navigation'
  );

  const previousLink = summaryEl(
    'a',
    'summary-navigation__back',
    '← Guided Review'
  );

  previousLink.href = '#/review';

  const homeLink = summaryEl(
    'a',
    'summary-navigation__next',
    'Back to Welcome →'
  );

  homeLink.href = '#/hook';

  navigation.append(
    previousLink,
    homeLink
  );

  // ==========================================
  // BUILD PAGE
  // ==========================================

  page.append(
    progress,
    intro,
    concepts,
    visual,
    reflection,
    transfer,
    nextSection,
    completion,
    navigation
  );

  container.appendChild(page);

  updateOrder();
  updateCompletion();

  return () => {
    headerObserver?.disconnect();
  };
}
