
/**
 * COS212 DFS Tutor — Feedback and Guided Review
 * Page 7
 *
 * Learning design:
 * - Gagne Event 7: Provide feedback
 * - Gagne Event 8: Assess performance
 * - Mayer: signalling, segmenting, multimedia learning
 * - Scaffolding through hints and corrective practice
 * - Metacognition through confidence reflection
 *
 * Reads quiz results from sessionStorage when available.
 * Also works as a standalone review page.
 */

const REVIEW_STORAGE_KEY = 'cos212-dfs-quiz-result';

const REVIEW_SVG_NS = 'http://www.w3.org/2000/svg';

function reviewEl(tag, className = '', text = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;
}

function reviewSvgEl(tag, attributes = {}) {
  const element = document.createElementNS(
    REVIEW_SVG_NS,
    tag
  );

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  return element;
}

/* ============================================
   LEARNING OUTCOME CONTENT
   ========================================== */

const REVIEW_TOPICS = [
  {
    id: 'LO1',
    title: 'Trees and stacks',
    label: 'FOUNDATIONS',
    summary:
      'A tree connects nodes through parent-child ' +
      'relationships. A stack remembers pending work.',
    explanation:
      'The top node of a tree is its root. ' +
      'A stack uses Last In, First Out (LIFO): ' +
      'the most recently added item is removed first.',
    example:
      'Push 1, then 2, then 3. The first value ' +
      'popped is 3.',
    takeaway:
      'DFS can use a stack to remember which nodes ' +
      'still need to be explored.',
    route: '#/concept-bst',
    routeText: 'Review BST Basics',
    cue: 'stack'
  },
  {
    id: 'LO2',
    title: 'Depth-first exploration',
    label: 'DFS BEHAVIOUR',
    summary:
      'DFS explores one path before returning ' +
      'to another pending path.',
    explanation:
      'In left-first DFS, the algorithm explores ' +
      'the left subtree before moving to the right. ' +
      'When it reaches a leaf, it continues from ' +
      'the most recent pending node.',
    example:
      'In tree A, after visiting 50, 30 and 20, ' +
      'DFS visits 40 next rather than stopping.',
    takeaway:
      'Backtracking means continuing from pending ' +
      'work when the current branch ends.',
    route: '#/concept-idea',
    routeText: 'Review DFS Introduction',
    cue: 'tree'
  },
  {
    id: 'LO3',
    title: 'Traversal orders',
    label: 'ALGORITHM ORDER',
    summary:
      'Pre-order, in-order and post-order record ' +
      'nodes at different times.',
    explanation:
      'Pre-order visits Node → Left → Right. ' +
      'In-order visits Left → Node → Right. ' +
      'Post-order visits Left → Right → Node.',
    example:
      'For tree A, pre-order starts with 50. ' +
      'In-order produces 20, 30, 40, 50, 60, 70, 80.',
    takeaway:
      'The same tree produces different visiting ' +
      'sequences depending on the traversal order.',
    route: '#/worked-example',
    routeText: 'Explore traversal orders',
    cue: 'orders'
  },
  {
    id: 'LO4',
    title: 'Understanding the live stack',
    label: 'STACK STATE',
    summary:
      'The top item on the stack is the next ' +
      'pending node to be processed.',
    explanation:
      'For iterative left-first pre-order DFS, ' +
      'push the right child before the left child. ' +
      'This places the left child on top.',
    example:
      'If the stack is [40, 70], with the top ' +
      'shown first, node 40 is popped next.',
    takeaway:
      'Push right first, then left, to visit ' +
      'the left subtree first.',
    route: '#/concept-idea',
    routeText: 'Review the live stack',
    cue: 'stack'
  },
  {
    id: 'LO5',
    title: 'DFS versus BST lookup',
    label: 'APPLY AND COMPARE',
    summary:
      'DFS follows a traversal order, while a ' +
      'BST lookup uses value comparisons.',
    explanation:
      'A BST lookup chooses left or right by ' +
      'comparing the target with the current value. ' +
      'Plain DFS does not skip branches using ' +
      'those comparisons.',
    example:
      'Searching for 80 in tree A, left-first ' +
      'pre-order DFS visits 7 nodes. ' +
      'A BST lookup follows 50 → 70 → 80.',
    takeaway:
      'A traversal and a BST lookup are different ' +
      'algorithms even when they use the same tree.',
    route: '#/worked-example',
    routeText: 'Compare search methods',
    cue: 'tree'
  }
];

/**
 * Misconception codes grounded in the supplied
 * quiz-bank.json. M2 is intentionally not defined
 * because its meaning was not provided.
 */
const REVIEW_MISCONCEPTIONS = {
  M1: {
    title: 'DFS versus breadth-first search',
    description:
      'DFS goes deep along one path before moving ' +
      'to another branch. Breadth-first search ' +
      'visits nodes level by level.',
    outcome: 'LO2'
  },
  M3: {
    title: 'Traversal-order confusion',
    description:
      'Pre-order records a node before its children, ' +
      'in-order between its subtrees, and post-order ' +
      'after its children.',
    outcome: 'LO3'
  },
  M4: {
    title: 'BST lookup versus DFS',
    description:
      'BST lookup compares values to choose a path. ' +
      'Plain DFS follows its traversal order.',
    outcome: 'LO5'
  },
  M5: {
    title: 'Stack order and push direction',
    description:
      'In left-first iterative DFS, right is pushed ' +
      'first, then left. Left is therefore popped first.',
    outcome: 'LO4'
  }
};

/* ============================================
   MINI LEARNING DIAGRAMS
   ========================================== */

function makeMiniTree() {
  const svg = reviewSvgEl('svg', {
    viewBox: '0 0 360 205',
    role: 'img',
    'aria-label':
      'Tree with root 50, children 30 and 70, ' +
      'and leaves 20, 40, 60 and 80'
  });

  const points = [
    [50, 180, 30],
    [30, 90, 105],
    [70, 270, 105],
    [20, 40, 175],
    [40, 140, 175],
    [60, 220, 175],
    [80, 320, 175]
  ];

  const positions = new Map(
    points.map(([value, x, y]) => [
      value,
      { x, y }
    ])
  );

  [
    [50, 30],
    [50, 70],
    [30, 20],
    [30, 40],
    [70, 60],
    [70, 80]
  ].forEach(([parent, child]) => {
    const a = positions.get(parent);
    const b = positions.get(child);

    svg.appendChild(reviewSvgEl('line', {
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      class: 'review-tree-edge'
    }));
  });

  points.forEach(([value, x, y]) => {
    const group = reviewSvgEl('g');

    const circle = reviewSvgEl('circle', {
      cx: x,
      cy: y,
      r: 22,
      class: value === 50
        ? 'review-tree-root'
        : ''
    });

    const label = reviewSvgEl('text', {
      x,
      y,
      class: 'review-tree-value'
    });

    label.textContent = String(value);

    group.append(circle, label);
    svg.appendChild(group);
  });

  return svg;
}

function makeStackDiagram() {
  const diagram = reviewEl(
    'div',
    'review-stack-diagram'
  );

  diagram.appendChild(
    reviewEl(
      'p',
      'review-diagram-label',
      'TOP OF STACK'
    )
  );

  [3, 2, 1].forEach((value, index) => {
    const item = reviewEl(
      'div',
      'review-stack-item',
      String(value)
    );

    if (index === 0) {
      item.classList.add('is-top');
      item.appendChild(
        reviewEl('span', '', 'POP FIRST')
      );
    }

    diagram.appendChild(item);
  });

  diagram.appendChild(
    reviewEl(
      'p',
      'review-diagram-note',
      'Push 1 → 2 → 3. Pop 3 first.'
    )
  );

  return diagram;
}

function makeOrderDiagram() {
  const wrapper = reviewEl(
    'div',
    'review-order-diagram'
  );

  const orders = [
    [
      'Pre-order',
      '50 → 30 → 20 → 40 → 70 → 60 → 80'
    ],
    [
      'In-order',
      '20 → 30 → 40 → 50 → 60 → 70 → 80'
    ],
    [
      'Post-order',
      '20 → 40 → 30 → 60 → 80 → 70 → 50'
    ]
  ];

  orders.forEach(([label, sequence]) => {
    const row = reviewEl(
      'div',
      'review-order-row'
    );

    row.append(
      reviewEl('strong', '', label),
      reviewEl('span', '', sequence)
    );

    wrapper.appendChild(row);
  });

  return wrapper;
}

/* ============================================
   LOAD SAVED QUIZ RESULTS
   ========================================== */

function loadQuizResults() {
  try {
    const raw = sessionStorage.getItem(
      REVIEW_STORAGE_KEY
    );

    if (!raw) return null;

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      !Array.isArray(parsed.answers)
    ) {
      return null;
    }

    // Avoid relying on unvalidated stored fields.
    const answers = parsed.answers.filter(answer =>
      answer &&
      typeof answer.outcome === 'string' &&
      typeof answer.correct === 'boolean'
    );

    if (!answers.length) return null;

    return {
      answers,
      correct: answers.filter(
        answer => answer.correct
      ).length,
      total: answers.length,
      passMark:
        Number.isInteger(parsed.passMark)
          ? parsed.passMark
          : 5
    };
  } catch {
    return null;
  }
}

/* ============================================
   SHORT CORRECTIVE PRACTICE
   ========================================== */

const REVIEW_CHECKS = [
  {
    outcome: 'LO1',
    prompt:
      'You push 1, 2 and 3 onto a stack. ' +
      'Which value is popped first?',
    options: [
      ['1', false],
      ['2', false],
      ['3', true],
      ['Not sure', false]
    ],
    explanation:
      'A stack follows Last In, First Out. ' +
      'The last value pushed was 3.'
  },
  {
    outcome: 'LO2',
    prompt:
      'DFS has just visited leaf node 20. ' +
      'Node 40 is still waiting. What happens next?',
    options: [
      ['Stop the traversal', false],
      ['Visit node 40', true],
      ['Restart at the root', false],
      ['Not sure', false]
    ],
    explanation:
      'DFS continues with pending node 40 ' +
      'instead of stopping at the leaf.'
  },
  {
    outcome: 'LO3',
    prompt:
      'Which traversal visits the root before ' +
      'its left and right subtrees?',
    options: [
      ['Pre-order', true],
      ['In-order', false],
      ['Post-order', false],
      ['Not sure', false]
    ],
    explanation:
      'Pre-order uses Root → Left → Right.'
  },
  {
    outcome: 'LO4',
    prompt:
      'The stack is [40, 70], top first. ' +
      'Which node is removed next?',
    options: [
      ['70', false],
      ['40', true],
      ['Both', false],
      ['Not sure', false]
    ],
    explanation:
      'The top is 40, so it is popped first.'
  },
  {
    outcome: 'LO5',
    prompt:
      'Which algorithm uses BST value comparisons ' +
      'to decide whether to go left or right?',
    options: [
      ['Plain DFS', false],
      ['BST lookup', true],
      ['Both always do', false],
      ['Not sure', false]
    ],
    explanation:
      'BST lookup uses comparisons. ' +
      'Plain DFS follows traversal order.'
  }
];

/* ============================================
   MAIN PAGE
   ========================================== */

export function render(screen, container) {
  const page = reviewEl('div', 'review-page');

  const quizResult = loadQuizResults();
  const completed = new Set();
  const reviewedTopics = new Set();
  const checkCorrect = new Set();

  let chosenPlan = '';

  // ==========================================
  // HEADER OFFSET
  // ==========================================

  const header = document.querySelector('.app-header');
  let headerObserver = null;

  function measureHeader() {
    if (!header) return;

    document.documentElement.style.setProperty(
      '--app-header-height',
      `${Math.ceil(
        header.getBoundingClientRect().height
      )}px`
    );
  }

  measureHeader();

  if (
    header &&
    typeof ResizeObserver !== 'undefined'
  ) {
    headerObserver = new ResizeObserver(measureHeader);
    headerObserver.observe(header);
  }

  // ==========================================
  // PROGRESS
  // ==========================================

  const progress = reviewEl(
    'div',
    'lesson-progress'
  );

  const progressHeader = reviewEl(
    'div',
    'lesson-progress__header'
  );

  const progressTitle = reviewEl(
    'strong',
    '',
    'GUIDED REVIEW'
  );

  const progressCount = reviewEl(
    'span',
    '',
    'Step 0 of 4'
  );

  progressHeader.append(
    progressTitle,
    progressCount
  );

  const progressTrack = reviewEl(
    'div',
    'lesson-progress__track'
  );

  progressTrack.setAttribute(
    'role',
    'progressbar'
  );

  progressTrack.setAttribute(
    'aria-label',
    'Guided review activity progress'
  );

  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '4');
  progressTrack.setAttribute('aria-valuenow', '0');

  const progressFill = reviewEl(
    'div',
    'lesson-progress__fill'
  );

  progressFill.style.width = '0%';

  progressTrack.appendChild(progressFill);

  progress.append(
    progressHeader,
    progressTrack
  );

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
  // INTRODUCTION
  // ==========================================

  const intro = reviewEl(
    'section',
    'review-card review-intro'
  );

  intro.append(
    reviewEl(
      'span',
      'review-eyebrow',
      'PAGE 7 / LEARN FROM FEEDBACK'
    ),
    reviewEl(
      'h1',
      '',
      'Feedback and Guided Review'
    ),
    reviewEl(
      'p',
      'review-lead',
      'Review what you understand, correct ' +
      'misconceptions and practise again ' +
      'before the learning summary.'
    ),
    reviewEl(
      'p',
      'review-muted',
      'Mistakes and uncertainty are useful ' +
      'signals for learning. This review is ' +
      'not graded.'
    )
  );

  // ==========================================
  // DETERMINE AREAS TO REVIEW
  // ==========================================

  const weakOutcomes = new Set();
  const misconceptionCodes = new Set();

  if (quizResult) {
    quizResult.answers.forEach(answer => {
      if (!answer.correct) {
        weakOutcomes.add(answer.outcome);

        if (answer.misconception) {
          misconceptionCodes.add(
            answer.misconception
          );
        }
      }
    });
  }

  const focusTopics = REVIEW_TOPICS.filter(
    topic => weakOutcomes.has(topic.id)
  );

  // If no quiz result or no incorrect answers,
  // make the full concept library available.
  const recommendedTopics = focusTopics.length
    ? focusTopics
    : REVIEW_TOPICS;

  // ==========================================
  // 01 — UNDERSTAND RESULTS
  // ==========================================

  const resultsSection = reviewEl(
    'section',
    'review-card review-results'
  );

  resultsSection.append(
    reviewEl(
      'span',
      'review-eyebrow',
      '01 / UNDERSTAND YOUR RESULTS'
    ),
    reviewEl(
      'h2',
      '',
      'What should you review?'
    )
  );

  const resultSummary = reviewEl(
    'div',
    'review-result-summary'
  );

  if (quizResult) {
    const ready =
      quizResult.correct >= quizResult.passMark;

    resultSummary.append(
      reviewEl(
        'strong',
        'review-result-score',
        `${quizResult.correct} / ${quizResult.total}`
      ),
      reviewEl(
        'p',
        '',
        ready
          ? 'You reached the quiz readiness guideline.'
          : 'Some concepts would benefit from review.'
      )
    );

    if (weakOutcomes.size) {
      resultSummary.appendChild(
        reviewEl(
          'p',
          'review-muted',
          'Recommended learning outcomes: ' +
          [...weakOutcomes].join(', ')
        )
      );
    } else {
      resultSummary.appendChild(
        reviewEl(
          'p',
          'review-muted',
          'You answered all questions correctly. ' +
          'Use the concept cards below to reinforce ' +
          'your understanding.'
        )
      );
    }

    const highConfidenceErrors =
      quizResult.answers.filter(answer =>
        !answer.correct &&
        answer.confidence === 'certain'
      ).length;

    if (highConfidenceErrors > 0) {
      resultSummary.appendChild(
        reviewEl(
          'p',
          'review-confidence-note',
          `${highConfidenceErrors} incorrect ` +
          'answer(s) were marked Certain. ' +
          'Compare your reasoning with the ' +
          'explanations below.'
        )
      );
    }
  } else {
    resultSummary.append(
      reviewEl(
        'strong',
        '',
        'Review available'
      ),
      reviewEl(
        'p',
        '',
        'No completed quiz result was found ' +
        'in this browser tab. You can still ' +
        'review every concept.'
      )
    );
  }

  const resultAction = reviewEl(
    'button',
    'review-button review-button--primary',
    'I understand my results'
  );

  resultAction.type = 'button';

  resultAction.addEventListener('click', () => {
    markComplete('results');

    resultAction.textContent =
      'Results reviewed ✓';

    resultAction.disabled = true;
  });

  resultsSection.append(
    resultSummary,
    resultAction
  );

  // ==========================================
  // 02 — GUIDED CONCEPT REVIEW
  // ==========================================

  const conceptsSection = reviewEl(
    'section',
    'review-concepts'
  );

  conceptsSection.append(
    reviewEl(
      'span',
      'review-eyebrow',
      '02 / CORRECT MISCONCEPTIONS'
    ),
    reviewEl(
      'h2',
      '',
      'Review the important ideas'
    ),
    reviewEl(
      'p',
      'review-muted',
      'Open the recommended concepts. ' +
      'Each explanation includes an example ' +
      'and an activity you can revisit.'
    )
  );

  const conceptGrid = reviewEl(
    'div',
    'review-concepts-grid'
  );

  const conceptStatus = reviewEl(
    'p',
    'review-concepts-status',
    ''
  );

  conceptStatus.setAttribute(
    'aria-live',
    'polite'
  );

  const requiredTopicIds = new Set(
    recommendedTopics.map(topic => topic.id)
  );

  function updateConceptProgress() {
    const done = [...requiredTopicIds]
      .filter(id => reviewedTopics.has(id)).length;

    conceptStatus.textContent =
      `${done} of ${requiredTopicIds.size} ` +
      'recommended concepts reviewed.';

    if (done === requiredTopicIds.size) {
      markComplete('concepts');
    }
  }

  // Show recommended topics first.
  const orderedTopics = [
    ...recommendedTopics,
    ...REVIEW_TOPICS.filter(topic =>
      !requiredTopicIds.has(topic.id)
    )
  ];

  orderedTopics.forEach(topic => {
    const details = reviewEl(
      'details',
      'review-concept-card'
    );

    if (requiredTopicIds.has(topic.id)) {
      details.classList.add('is-recommended');
    }

    const summary = reviewEl(
      'summary',
      'review-concept-summary'
    );

    const heading = reviewEl(
      'div',
      'review-concept-heading'
    );

    heading.append(
      reviewEl(
        'span',
        'review-concept-code',
        topic.id
      ),
      reviewEl(
        'strong',
        '',
        topic.title
      ),
      reviewEl(
        'span',
        'review-concept-label',
        topic.label
      )
    );

    summary.append(
      heading,
      reviewEl(
        'span',
        'review-concept-chevron',
        '⌄'
      )
    );

    const body = reviewEl(
      'div',
      'review-concept-body'
    );

    body.append(
      reviewEl(
        'p',
        'review-concept-lead',
        topic.summary
      ),
      reviewEl(
        'p',
        '',
        topic.explanation
      )
    );

    const example = reviewEl(
      'div',
      'review-example'
    );

    example.append(
      reviewEl(
        'strong',
        '',
        'Example'
      ),
      reviewEl(
        'p',
        '',
        topic.example
      )
    );

    if (topic.cue === 'tree') {
      const diagram = reviewEl(
        'div',
        'review-diagram'
      );

      diagram.appendChild(makeMiniTree());
      example.appendChild(diagram);
    }

    if (topic.cue === 'stack') {
      example.appendChild(
        makeStackDiagram()
      );
    }

    if (topic.cue === 'orders') {
      example.appendChild(
        makeOrderDiagram()
      );
    }

    const takeaway = reviewEl(
      'div',
      'review-takeaway'
    );

    takeaway.append(
      reviewEl(
        'strong',
        '',
        'Remember'
      ),
      reviewEl(
        'p',
        '',
        topic.takeaway
      )
    );

    const link = reviewEl(
      'a',
      'review-topic-link',
      topic.routeText + ' →'
    );

    link.href = topic.route;

    body.append(
      example,
      takeaway,
      link
    );

    details.append(
      summary,
      body
    );

    details.addEventListener('toggle', () => {
      if (!details.open) return;

      reviewedTopics.add(topic.id);
      updateConceptProgress();
    });

    conceptGrid.appendChild(details);
  });

  conceptsSection.append(
    conceptGrid,
    conceptStatus
  );

  updateConceptProgress();

  // ==========================================
  // MISCONCEPTION-SPECIFIC FEEDBACK
  // ==========================================

  const misconceptionSection = reviewEl(
    'section',
    'review-card review-misconceptions'
  );

  misconceptionSection.append(
    reviewEl(
      'span',
      'review-eyebrow',
      'MISCONCEPTION FEEDBACK'
    ),
    reviewEl(
      'h2',
      '',
      'Common misunderstandings'
    )
  );

  const misconceptionList = reviewEl(
    'div',
    'review-misconception-list'
  );

  const codesToDisplay = misconceptionCodes.size
    ? [...misconceptionCodes]
    : ['M1', 'M3', 'M4', 'M5'];

  codesToDisplay.forEach(code => {
    const info = REVIEW_MISCONCEPTIONS[code];

    const item = reviewEl(
      'article',
      'review-misconception-item'
    );

    item.appendChild(
      reviewEl(
        'span',
        'review-misconception-code',
        code
      )
    );

    if (info) {
      item.append(
        reviewEl(
          'h3',
          '',
          info.title
        ),
        reviewEl(
          'p',
          '',
          info.description
        )
      );
    } else {
      item.append(
        reviewEl(
          'h3',
          '',
          'Review this misconception'
        ),
        reviewEl(
          'p',
          '',
          'The quiz recorded this misconception ' +
          'code, but no matching explanation ' +
          'is configured in this review page.'
        )
      );
    }

    misconceptionList.appendChild(item);
  });

  misconceptionSection.appendChild(
    misconceptionList
  );

  // ==========================================
  // 03 — CORRECTIVE PRACTICE
  // ==========================================

  const practiceSection = reviewEl(
    'section',
    'review-card review-practice'
  );

  practiceSection.append(
    reviewEl(
      'span',
      'review-eyebrow',
      '03 / TRY AGAIN'
    ),
    reviewEl(
      'h2',
      '',
      'Check your understanding'
    ),
    reviewEl(
      'p',
      'review-muted',
      'Try these short questions after reviewing. ' +
      'Wrong answers open explanations, and you ' +
      'can retry.'
    )
  );

  // Prioritise questions from weak outcomes.
  const targetedChecks = [
    ...REVIEW_CHECKS.filter(check =>
      weakOutcomes.has(check.outcome)
    ),
    ...REVIEW_CHECKS.filter(check =>
      !weakOutcomes.has(check.outcome)
    )
  ].slice(0, 2);

  const practiceGrid = reviewEl(
    'div',
    'review-practice-grid'
  );

  function updatePracticeProgress() {
    if (
      targetedChecks.every(check =>
        checkCorrect.has(check.outcome)
      )
    ) {
      markComplete('practice');
    }
  }

  targetedChecks.forEach((check, index) => {
    const question = reviewEl(
      'article',
      'review-practice-question'
    );

    question.append(
      reviewEl(
        'span',
        'review-question-code',
        `QUESTION ${index + 1} · ${check.outcome}`
      ),
      reviewEl(
        'h3',
        '',
        check.prompt
      )
    );

    const options = reviewEl(
      'div',
      'review-answer-options'
    );

    const feedback = reviewEl(
      'div',
      'review-feedback'
    );

    feedback.setAttribute(
      'aria-live',
      'polite'
    );

    check.options.forEach(([label, correct]) => {
      const button = reviewEl(
        'button',
        'review-answer',
        label
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

        feedback.className = correct
          ? 'review-feedback is-correct'
          : 'review-feedback is-review';

        feedback.textContent = correct
          ? `Correct! ${check.explanation}`
          : `Review this idea. ${check.explanation} ` +
            'Try again.';

        if (correct) {
          checkCorrect.add(check.outcome);
          updatePracticeProgress();
        }
      });

      options.appendChild(button);
    });

    question.append(
      options,
      feedback
    );

    practiceGrid.appendChild(question);
  });

  practiceSection.appendChild(
    practiceGrid
  );

  // ==========================================
  // 04 — LEARNING PLAN
  // ==========================================

  const planSection = reviewEl(
    'section',
    'review-card review-plan'
  );

  planSection.append(
    reviewEl(
      'span',
      'review-eyebrow',
      '04 / PLAN YOUR NEXT STEP'
    ),
    reviewEl(
      'h2',
      '',
      'What will you do next?'
    ),
    reviewEl(
      'p',
      'review-muted',
      'Choose a learning action. ' +
      'You can return to the lessons at any time.'
    )
  );

  const planOptions = reviewEl(
    'div',
    'review-plan-options'
  );

  const plans = [
    {
      id: 'bst',
      title: 'Review BST Basics',
      description:
        'Revisit roots, children and BST ordering.',
      href: '#/concept-bst'
    },
    {
      id: 'dfs',
      title: 'Revisit DFS Introduction',
      description:
        'Review stack behavior and backtracking.',
      href: '#/concept-idea'
    },
    {
      id: 'explorer',
      title: 'Explore DFS again',
      description:
        'Compare traversal orders step by step.',
      href: '#/worked-example'
    },
    {
      id: 'summary',
      title: 'Continue to Learning Summary',
      description:
        'Reflect on the most important ideas.',
      href: '#/summary'
    }
  ];

  const planFeedback = reviewEl(
    'p',
    'review-plan-feedback'
  );

  planFeedback.setAttribute(
    'aria-live',
    'polite'
  );

  plans.forEach(plan => {
    const button = reviewEl(
      'button',
      'review-plan-option'
    );

    button.type = 'button';
    button.setAttribute(
      'aria-pressed',
      'false'
    );

    button.append(
      reviewEl(
        'strong',
        '',
        plan.title
      ),
      reviewEl(
        'span',
        '',
        plan.description
      )
    );

    button.addEventListener('click', () => {
      chosenPlan = plan.id;

      planOptions.querySelectorAll('button')
        .forEach(other => {
          other.setAttribute(
            'aria-pressed',
            String(other === button)
          );
        });

      planFeedback.textContent =
        `Selected: ${plan.title}.`;

      markComplete('plan');

      planLink.href = plan.href;
      planLink.textContent =
        plan.title + ' →';
    });

    planOptions.appendChild(button);
  });

  const planLink = reviewEl(
    'a',
    'review-button review-button--primary',
    'Choose an action above'
  );

  planLink.href = '#/summary';

  planLink.addEventListener('click', event => {
    if (!chosenPlan) {
      event.preventDefault();
      planFeedback.textContent =
        'Choose a learning action before continuing.';
    }
  });

  planSection.append(
    planOptions,
    planFeedback,
    planLink
  );

  // ==========================================
  // BOTTOM NAVIGATION
  // ==========================================

  const navigation = reviewEl(
    'nav',
    'review-navigation'
  );

  navigation.setAttribute(
    'aria-label',
    'Guided review navigation'
  );

  const backLink = reviewEl(
    'a',
    'review-navigation__back',
    '← Readiness Quiz'
  );

  backLink.href = '#/quiz';

  const nextLink = reviewEl(
    'a',
    'review-navigation__next',
    'Next Lesson →'
  );

  nextLink.href = '#/summary';

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
    resultsSection,
    conceptsSection,
    misconceptionSection,
    practiceSection,
    planSection,
    navigation
  );

  container.appendChild(page);

  return () => {
    headerObserver?.disconnect();
  };
}
