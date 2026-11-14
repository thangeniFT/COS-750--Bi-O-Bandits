
/**
 * COS212 DFS Tutor — Guided Review
 *
 * Displays saved Readiness Quiz results.
 * Tabs:
 * 1. My Results
 * 2. Key Ideas
 * 3. Quick Check
 * 4. Next Steps
 *
 * No progress bar and no backend required.
 */

const REVIEW_KEY = 'cos212-dfs-quiz-result';
const REVIEW_NS = 'http://www.w3.org/2000/svg';

const REVIEW_AREAS = [
  {
    id: 'bst',
    title: 'BST Skills',
    rule:
      'Smaller goes left. Larger goes right. ' +
      'Keys are unique.',
    explanation:
      'A node must satisfy the ordering rule ' +
      'of every ancestor, not only its direct parent. ' +
      'During insertion, compare the value at each ' +
      'node until you find an empty child position.',
    example:
      'To insert 63: 63 > 44, so go right to 68. ' +
      '63 < 68, so go left to 59. ' +
      '63 > 59, so insert on the right of 59.',
    route: '#/concept-bst',
    action: 'Revisit BST Basics'
  },
  {
    id: 'dfs',
    title: 'DFS & Stack',
    rule:
      'Go depth-first. A stack uses Last In, ' +
      'First Out (LIFO).',
    explanation:
      'In left-first iterative pre-order DFS, ' +
      'pop and visit a node, push its right child ' +
      'first, then its left child. If a branch ends, ' +
      'continue from the next pending stack item. ' +
      'DFS does not use BST target comparisons ' +
      'to skip branches.',
    example:
      'After visiting 44, push 68 and then 21. ' +
      'Node 21 is now on top and will be visited next.',
    route: '#/concept-idea',
    action: 'Revisit DFS Introduction'
  },
  {
    id: 'traversal',
    title: 'Traversal Orders',
    rule:
      'Pre: Root → Left → Right  |  ' +
      'In: Left → Root → Right  |  ' +
      'Post: Left → Right → Root',
    explanation:
      'A traversal visits every node once. ' +
      'The three orders differ in when the parent ' +
      'is recorded. For a valid BST, in-order ' +
      'produces the values from smallest to largest.',
    example:
      'For the review tree: Pre-order is ' +
      '44, 21, 15, 32, 68, 59, 79. ' +
      'In-order is 15, 21, 32, 44, 59, 68, 79. ' +
      'Post-order is 15, 32, 21, 59, 79, 68, 44.',
    route: '#/worked-example',
    action: 'Explore the traversals'
  }
];

const REVIEW_ERRORS = {
  M1:
    'DFS explores a branch before returning to ' +
    'another. Breadth-first search visits nodes ' +
    'level by level.',
  M3:
    'Pre-order records a parent first, in-order ' +
    'between its subtrees, and post-order last.',
  M4:
    'BST lookup compares target values to select ' +
    'a branch. Plain DFS follows the traversal order.',
  M5:
    'For left-first DFS, push the right child ' +
    'first, then the left. The left child is ' +
    'popped first.'
};

const REVIEW_CHECKS = {
  bst: {
    prompt:
      'On the review tree, where would you insert 63?',
    choices: [
      'Left of 59',
      'Right of 59',
      'Right of 68'
    ],
    correct: 1,
    explanation:
      '63 > 44, 63 < 68, and 63 > 59. ' +
      'Therefore 63 becomes the right child of 59.'
  },
  dfs: {
    prompt:
      'DFS visits 44, then pushes 68 and 21. ' +
      'Which node comes off the stack next?',
    choices: ['68', '21', '44'],
    correct: 1,
    explanation:
      '21 was pushed last, so it is popped first. ' +
      'A stack follows LIFO.'
  },
  traversal: {
    prompt:
      'What is the post-order of the subtree ' +
      'rooted at 68, with children 59 and 79?',
    choices: [
      '68 → 59 → 79',
      '59 → 68 → 79',
      '59 → 79 → 68'
    ],
    correct: 2,
    explanation:
      'Post-order is Left → Right → Root: ' +
      '59, then 79, then 68.'
  }
};

/* ==========================================
   DOM HELPERS
   ========================================== */

function rvEl(tag, cls = '', value = '') {
  const e = document.createElement(tag);

  if (cls) e.className = cls;

  e.textContent = value;
  return e;
}

function rvBtn(value, cls = 'review-button') {
  const b = rvEl('button', cls, value);
  b.type = 'button';
  return b;
}

function rvSvg(tag, props = {}) {
  const e = document.createElementNS(
    REVIEW_NS,
    tag
  );

  for (const [key, value] of Object.entries(props)) {
    e.setAttribute(key, String(value));
  }

  return e;
}

/* ==========================================
   READ THE ACTUAL QUIZ RESULTS
   ========================================== */

function readReviewResult() {
  try {
    const raw = sessionStorage.getItem(REVIEW_KEY);

    if (!raw) return null;

    const saved = JSON.parse(raw);

    if (
      !saved ||
      !Array.isArray(saved.answers)
    ) {
      return null;
    }

    const answers = saved.answers
      .filter(a =>
        a &&
        typeof a.correct === 'boolean' &&
        Number.isInteger(Number(a.slot))
      )
      .map(a => ({
        ...a,
        slot: Number(a.slot)
      }))
      .sort((a, b) => a.slot - b.slot);

    if (!answers.length) return null;

    const correct = answers.filter(
      a => a.correct
    ).length;

    const passMark = Number.isInteger(
      saved.passMark
    )
      ? saved.passMark
      : Math.ceil(answers.length * 0.75);

    return {
      answers,
      correct,
      total: answers.length,
      passMark,
      attempt: Number.isInteger(saved.attempt)
        ? saved.attempt
        : 0
    };
  } catch {
    return null;
  }
}

/* ==========================================
   MATCH RESULTS WITH QUIZ QUESTIONS
   ========================================== */

function areaFor(answer, bankItem) {
  if (
    ['bst', 'dfs', 'traversal'].includes(
      bankItem?.section
    )
  ) {
    return bankItem.section;
  }

  const slot = Number(answer.slot);

  // Fallback for the updated 8-question bank.
  if (slot <= 2) return 'bst';
  if (slot <= 5) return 'dfs';

  return 'traversal';
}

function answerName(item, savedAnswer) {
  if (
    savedAnswer === undefined ||
    savedAnswer === null
  ) {
    return null;
  }

  if (Array.isArray(savedAnswer)) {
    return savedAnswer.join(' → ');
  }

  if (savedAnswer === '__unsure__') {
    return 'Not sure';
  }

  if (item?.type === 'choice') {
    return item.options?.find(
      opt =>
        String(opt.id) === String(savedAnswer)
    )?.text || String(savedAnswer);
  }

  return String(savedAnswer);
}

function expectedName(item) {
  if (!item) return null;

  if (
    item.type === 'order' &&
    Array.isArray(item.answer)
  ) {
    return item.answer.join(' → ');
  }

  if (item.type === 'choice') {
    return item.options?.find(
      opt => opt.correct === true
    )?.text || null;
  }

  return null;
}

/* ==========================================
   REVIEW TREE VISUAL
   ========================================== */

function reviewTree() {
  const points = [
    [44, 180, 28],
    [21, 94, 95],
    [68, 266, 95],
    [15, 49, 166],
    [32, 139, 166],
    [59, 221, 166],
    [79, 311, 166]
  ];

  const edges = [
    [44, 21],
    [44, 68],
    [21, 15],
    [21, 32],
    [68, 59],
    [68, 79]
  ];

  const position = new Map(
    points.map(([v, x, y]) => [
      v,
      { x, y }
    ])
  );

  const svg = rvSvg('svg', {
    viewBox: '0 0 360 207',
    role: 'img',
    'aria-label':
      'BST with root 44, left child 21, ' +
      'right child 68, and leaves 15, 32, 59 and 79'
  });

  for (const [a, b] of edges) {
    const p = position.get(a);
    const c = position.get(b);

    svg.append(
      rvSvg('line', {
        x1: p.x,
        y1: p.y,
        x2: c.x,
        y2: c.y,
        class: 'review-tree-edge'
      })
    );
  }

  for (const [value, x, y] of points) {
    const circle = rvSvg('circle', {
      cx: x,
      cy: y,
      r: 22,
      class: value === 44 ? 'review-root' : ''
    });

    const label = rvSvg('text', {
      x,
      y,
      class: 'review-tree-number'
    });

    label.textContent = String(value);

    svg.append(circle, label);
  }

  const frame = rvEl(
    'div',
    'review-tree-frame'
  );

  frame.append(
    svg,
    rvEl(
      'p',
      'review-muted',
      'Review example tree'
    )
  );

  return frame;
}

/* ==========================================
   MAIN REVIEW PAGE
   ========================================== */

export function render(screen, container) {
  const page = rvEl('main', 'review-page');

  let stored = readReviewResult();
  let bank = new Map();
  let destroyed = false;

  const recheckState = new Map();

  // ==========================================
  // HEADER
  // ==========================================

  const intro = rvEl(
    'header',
    'review-intro'
  );

  intro.append(
    rvEl(
      'h1',
      '',
      'Results & Guided Review'
    ),
    rvEl(
      'p',
      'review-muted',
      'See how you did in the quiz, understand ' +
      'any mistakes, and revisit the ideas you need. ' +
      'Your quiz is formative, not a recorded grade.'
    )
  );

  // ==========================================
  // TAB NAVIGATION
  // ==========================================

  const tabDefs = [
    ['results', '1. My Results'],
    ['concepts', '2. Key Ideas'],
    ['check', '3. Quick Check'],
    ['next', '4. Next Steps']
  ];

  const tabs = rvEl(
    'div',
    'review-tabs'
  );

  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute(
    'aria-label',
    'Guided review sections'
  );

  const panels = tabDefs.map(([id]) => {
    const p = rvEl('section', 'review-panel');

    p.id = `review-panel-${id}`;

    p.setAttribute('role', 'tabpanel');

    p.setAttribute(
      'aria-labelledby',
      `review-tab-${id}`
    );

    p.tabIndex = -1;

    return p;
  });

  let active = 0;

  const tabButtons = tabDefs.map(
    ([id, label], i) => {
      const b = rvBtn(
        label,
        'review-tab'
      );

      b.id = `review-tab-${id}`;

      b.setAttribute('role', 'tab');

      b.setAttribute(
        'aria-controls',
        panels[i].id
      );

      b.addEventListener('click', () => {
        switchTab(i);
      });

      tabs.append(b);
      return b;
    }
  );

  function switchTab(index) {
    active = index;

    panels.forEach((p, i) => {
      p.hidden = i !== index;
    });

    tabButtons.forEach((b, i) => {
      b.classList.toggle(
        'is-active',
        i === index
      );

      b.setAttribute(
        'aria-selected',
        String(i === index)
      );

      b.tabIndex = i === index ? 0 : -1;
    });
  }

  tabs.addEventListener('keydown', event => {
    const i = tabButtons.indexOf(
      document.activeElement
    );

    if (i < 0) return;

    let next = -1;

    if (event.key === 'ArrowRight') {
      next = (i + 1) % tabButtons.length;
    }

    if (event.key === 'ArrowLeft') {
      next =
        (i - 1 + tabButtons.length) %
        tabButtons.length;
    }

    if (event.key === 'Home') next = 0;

    if (event.key === 'End') {
      next = tabButtons.length - 1;
    }

    if (next !== -1) {
      event.preventDefault();

      switchTab(next);
      tabButtons[next].focus();
    }
  });

  // ==========================================
  // BOTTOM NAVIGATION
  // ==========================================

  const navigation = rvEl(
    'nav',
    'review-navigation'
  );

  navigation.setAttribute(
    'aria-label',
    'Review navigation'
  );

  const back = rvEl(
    'a',
    'review-button',
    '← Readiness Quiz'
  );

  back.href = '#/quiz';

  const forward = rvEl(
    'a',
    'review-button review-primary',
    'Learning Summary →'
  );

  forward.href = '#/summary';

  navigation.append(back, forward);

  page.append(
    intro,
    tabs,
    ...panels,
    navigation
  );

  container.replaceChildren(page);

  // ==========================================
  // QUIZ RESULT HELPERS
  // ==========================================

  function quizItem(answer) {
    return bank.get(answer.id);
  }

  function weakAreas() {
    if (!stored) return [];

    return [
      ...new Set(
        stored.answers
          .filter(a => !a.correct)
          .map(a =>
            areaFor(a, quizItem(a))
          )
      )
    ];
  }

  function summaryStats() {
    return REVIEW_AREAS.map(area => {
      const related = stored?.answers.filter(
        a =>
          areaFor(a, quizItem(a)) === area.id
      ) || [];

      return {
        ...area,
        total: related.length,
        correct: related.filter(
          a => a.correct
        ).length
      };
    });
  }

  /* ==========================================
     TAB 1 — MY RESULTS
     ========================================== */

  function renderResults() {
    const panel = panels[0];
    panel.replaceChildren();

    // No quiz result yet.
    if (!stored) {
      const empty = rvEl(
        'div',
        'review-card review-empty'
      );

      empty.append(
        rvEl(
          'h2',
          '',
          'No completed quiz results yet'
        ),
        rvEl(
          'p',
          'review-muted',
          'Complete the Readiness Quiz, choose ' +
          'See Results, then open Guided Review ' +
          'in the same browser tab. The score ' +
          'will appear here automatically.'
        ),
        rvEl(
          'p',
          'review-muted',
          'You can still use Key Ideas and ' +
          'Quick Check without taking the quiz.'
        )
      );

      const quiz = rvEl(
        'a',
        'review-button review-primary',
        'Open Readiness Quiz →'
      );

      quiz.href = '#/quiz';

      const refresh = rvBtn(
        'Refresh results'
      );

      refresh.addEventListener('click', () => {
        stored = readReviewResult();
        renderAll();
      });

      const row = rvEl(
        'div',
        'review-actions'
      );

      row.append(quiz, refresh);
      empty.append(row);
      panel.append(empty);

      return;
    }

    // ------------------------------------------
    // SCORE
    // ------------------------------------------

    const incorrect =
      stored.total - stored.correct;

    const met =
      stored.correct >= stored.passMark;

    const scoreCard = rvEl(
      'div',
      'review-card review-score-card'
    );

    const scoreLeft = rvEl(
      'div',
      'review-score-main'
    );

    scoreLeft.append(
      rvEl(
        'span',
        'review-eyebrow',
        `QUIZ ATTEMPT ${stored.attempt + 1}`
      ),
      rvEl(
        'h2',
        '',
        'Your quiz results'
      ),
      rvEl(
        'p',
        'review-score',
        `${stored.correct} / ${stored.total}`
      ),
      rvEl(
        'p',
        'review-muted',
        met
          ? 'You met the quiz readiness guideline.'
          : 'Review the areas below and try ' +
            'again when ready.'
      )
    );

    const tiles = rvEl(
      'div',
      'review-metrics'
    );

    [
      ['Correct', String(stored.correct)],
      ['To review', String(incorrect)],
      [
        'Guideline',
        `${stored.passMark} / ${stored.total}`
      ]
    ].forEach(([label, number]) => {
      const tile = rvEl(
        'div',
        'review-metric'
      );

      tile.append(
        rvEl('strong', '', number),
        rvEl('span', '', label)
      );

      tiles.append(tile);
    });

    scoreCard.append(
      scoreLeft,
      tiles
    );

    panel.append(scoreCard);

    // ------------------------------------------
    // RESULTS BY TOPIC
    // ------------------------------------------

    const breakdown = rvEl(
      'section',
      'review-card'
    );

    breakdown.append(
      rvEl('h2', '', 'Results by topic'),
      rvEl(
        'p',
        'review-muted',
        'See which skills are secure and ' +
        'which need another look.'
      )
    );

    const areaGrid = rvEl(
      'div',
      'review-area-grid'
    );

    summaryStats().forEach(area => {
      if (!area.total) return;

      const row = rvEl(
        'div',
        'review-area-row'
      );

      row.append(
        rvEl(
          'strong',
          '',
          area.title
        ),
        rvEl(
          'span',
          '',
          `${area.correct} of ${area.total} correct`
        ),
        rvEl(
          'span',
          area.correct === area.total
            ? 'review-area-good'
            : 'review-area-needs',
          area.correct === area.total
            ? 'Reinforce'
            : 'Review recommended'
        )
      );

      areaGrid.append(row);
    });

    breakdown.append(areaGrid);

    // Confidence reflection
    const certainWrong =
      stored.answers.filter(
        a =>
          !a.correct &&
          a.confidence === 'certain'
      ).length;

    if (certainWrong) {
      breakdown.append(
        rvEl(
          'p',
          'review-note',
          `${certainWrong} incorrect answer(s) ` +
          'were marked “Certain”. Read those ' +
          'explanations to check your reasoning.'
        )
      );
    }

    panel.append(breakdown);

    // ------------------------------------------
    // EACH QUESTION'S RESULTS
    // ------------------------------------------

    const questions = rvEl(
      'section',
      'review-card'
    );

    questions.append(
      rvEl(
        'h2',
        '',
        'Question-by-question feedback'
      ),
      rvEl(
        'p',
        'review-muted',
        'Open any question to see the correct ' +
        'answer and what to remember.'
      )
    );

    const questionList = rvEl(
      'div',
      'review-question-list'
    );

    stored.answers.forEach((a, i) => {
      const item = quizItem(a);

      const area = REVIEW_AREAS.find(
        x =>
          x.id === areaFor(a, item)
      );

      const card = rvEl(
        'details',
        `review-question-row ${
          a.correct ? 'is-correct' : 'is-review'
        }`
      );

      const heading = rvEl(
        'summary',
        'review-question-summary'
      );

      heading.append(
        rvEl(
          'strong',
          '',
          `Question ${a.slot || i + 1}`
        ),
        rvEl(
          'span',
          'review-question-topic',
          area?.title || a.outcome || 'Quiz'
        ),
        rvEl(
          'span',
          'review-status',
          a.correct
            ? '✓ Correct'
            : '↻ Review'
        )
      );

      const body = rvEl(
        'div',
        'review-question-body'
      );

      body.append(
        rvEl(
          'p',
          'review-prompt',
          item?.prompt ||
          'Question wording unavailable; ' +
          'the saved outcome and result ' +
          'are still shown.'
        )
      );

      // The Quiz may optionally store
      // each student's selected response.
      if (
        Object.prototype.hasOwnProperty.call(
          a,
          'response'
        )
      ) {
        const own = answerName(
          item,
          a.response
        );

        if (own !== null) {
          body.append(
            rvEl(
              'p',
              '',
              `Your answer: ${own}`
            )
          );
        }
      }

      const expected = expectedName(item);

      if (expected) {
        body.append(
          rvEl(
            'p',
            'review-correct-answer',
            `Correct answer: ${expected}`
          )
        );
      }

      if (
        a.confidence &&
        a.confidence !== 'not-set'
      ) {
        body.append(
          rvEl(
            'p',
            'review-muted',
            'Confidence: ' +
            String(a.confidence).replaceAll(
              '-',
              ' '
            )
          )
        );
      }

      const explanation =
        a.explanation ||
        (
          a.misconception &&
          REVIEW_ERRORS[a.misconception]
        ) ||
        area?.explanation ||
        'Review the relevant lesson and ' +
        'try the skill again.';

      const advice = rvEl(
        'div',
        'review-callout'
      );

      advice.append(
        rvEl(
          'strong',
          '',
          a.correct
            ? 'Why it works'
            : 'What to review'
        ),
        rvEl(
          'p',
          '',
          explanation
        )
      );

      body.append(advice);

      const link = rvEl(
        'a',
        'review-text-link',
        area?.action || 'Review lesson'
      );

      link.href =
        area?.route || '#/practice';

      body.append(link);

      card.append(
        heading,
        body
      );

      questionList.append(card);
    });

    questions.append(questionList);
    panel.append(questions);
  }

  /* ==========================================
     TAB 2 — KEY IDEAS
     ========================================== */

  function renderConcepts() {
    const panel = panels[1];
    panel.replaceChildren();

    const weak = weakAreas();

    // Recommend areas linked to wrong answers.
    const ordered = [...REVIEW_AREAS].sort(
      (a, b) =>
        Number(weak.includes(b.id)) -
        Number(weak.includes(a.id))
    );

    const header = rvEl(
      'div',
      'review-card'
    );

    header.append(
      rvEl(
        'h2',
        '',
        'Review the important ideas'
      ),
      rvEl(
        'p',
        'review-muted',
        weak.length
          ? 'Topics linked to incorrect quiz ' +
            'answers are shown first. Expand ' +
            'a topic for an explanation and example.'
          : 'Explore the three concepts taught ' +
            'in BST Basics and DFS Introduction.'
      )
    );

    panel.append(header);

    ordered.forEach(area => {
      const recommended =
        weak.includes(area.id);

      const details = rvEl(
        'details',
        `review-concept ${
          recommended
            ? 'is-recommended'
            : ''
        }`
      );

      details.open = recommended;

      const summary = rvEl(
        'summary',
        'review-concept-summary'
      );

      summary.append(
        rvEl(
          'strong',
          '',
          area.title
        ),
        rvEl(
          'span',
          '',
          recommended
            ? 'Recommended review'
            : 'Review concept'
        )
      );

      const content = rvEl(
        'div',
        'review-concept-content'
      );

      const call = rvEl(
        'div',
        'review-callout'
      );

      call.append(
        rvEl(
          'strong',
          '',
          'Remember the rule'
        ),
        rvEl(
          'p',
          '',
          area.rule
        )
      );

      content.append(
        call,
        rvEl(
          'p',
          '',
          area.explanation
        )
      );

      const example = rvEl(
        'div',
        'review-example'
      );

      example.append(
        rvEl(
          'strong',
          '',
          'Worked example'
        ),
        rvEl(
          'p',
          '',
          area.example
        )
      );

      if (area.id !== 'dfs') {
        example.append(reviewTree());
      } else {
        const stack = rvEl(
          'div',
          'review-mini-stack'
        );

        stack.append(
          rvEl(
            'span',
            '',
            '21  ·  TOP'
          ),
          rvEl(
            'span',
            '',
            '68  ·  WAITING'
          )
        );

        example.append(stack);
      }

      content.append(example);

      const link = rvEl(
        'a',
        'review-button',
        area.action + ' →'
      );

      link.href = area.route;

      content.append(link);

      details.append(
        summary,
        content
      );

      panel.append(details);
    });
  }

  /* ==========================================
     TAB 3 — QUICK CHECK
     ========================================== */

  function renderCheck() {
    const panel = panels[2];
    panel.replaceChildren();

    const weak = weakAreas();

    const keys = weak.length
      ? weak
      : REVIEW_AREAS.map(a => a.id);

    const header = rvEl(
      'div',
      'review-card'
    );

    header.append(
      rvEl(
        'h2',
        '',
        'Quick check: apply what you reviewed'
      ),
      rvEl(
        'p',
        'review-muted',
        weak.length
          ? 'These short questions focus on ' +
            'the topics you missed in the quiz. ' +
            'Try again until you understand.'
          : 'Try these fresh questions to ' +
            'reinforce what you have learned. ' +
            'They do not change your quiz score.'
      )
    );

    panel.append(header);

    keys.forEach(key => {
      const area = REVIEW_AREAS.find(
        a => a.id === key
      );

      const question =
        REVIEW_CHECKS[key];

      const article = rvEl(
        'article',
        'review-card review-check-card'
      );

      article.append(
        rvEl(
          'span',
          'review-eyebrow',
          area.title
        ),
        rvEl(
          'h3',
          '',
          question.prompt
        )
      );

      const choices = rvEl(
        'div',
        'review-choices'
      );

      const feedback = rvEl(
        'div',
        'review-check-feedback'
      );

      feedback.setAttribute(
        'aria-live',
        'polite'
      );

      question.choices.forEach(
        (choice, i) => {
          const b = rvBtn(
            choice,
            'review-choice'
          );

          const saved =
            recheckState.get(key);

          if (saved?.correct) {
            b.disabled = true;
          }

          b.setAttribute(
            'aria-pressed',
            String(saved?.selected === i)
          );

          b.addEventListener('click', () => {
            const correct =
              i === question.correct;

            recheckState.set(key, {
              selected: i,
              correct
            });

            choices
              .querySelectorAll('button')
              .forEach(other => {
                other.setAttribute(
                  'aria-pressed',
                  String(other === b)
                );

                other.disabled = correct;
              });

            feedback.className =
              'review-check-feedback ' +
              (
                correct
                  ? 'is-correct'
                  : 'is-review'
              );

            feedback.textContent =
              (
                correct
                  ? 'Correct! '
                  : 'Not quite. '
              ) +
              question.explanation +
              (
                correct
                  ? ''
                  : ' Try another answer.'
              );
          });

          choices.append(b);
        }
      );

      const saved =
        recheckState.get(key);

      if (saved) {
        feedback.className =
          'review-check-feedback ' +
          (
            saved.correct
              ? 'is-correct'
              : 'is-review'
          );

        feedback.textContent =
          (
            saved.correct
              ? 'Correct! '
              : 'Not quite. '
          ) +
          question.explanation;
      }

      article.append(
        choices,
        feedback
      );

      panel.append(article);
    });
  }

  /* ==========================================
     TAB 4 — NEXT STEPS
     ========================================== */

  function renderNext() {
    const panel = panels[3];
    panel.replaceChildren();

    const weak = weakAreas();

    const card = rvEl(
      'div',
      'review-card'
    );

    card.append(
      rvEl(
        'h2',
        '',
        'Choose your next step'
      ),
      rvEl(
        'p',
        'review-muted',
        weak.length
          ? 'Revisit a recommended lesson, ' +
            'practise again, or continue to the ' +
            'learning summary.'
          : 'You can revisit any lesson, ' +
            'practise again, or continue to the ' +
            'learning summary.'
      )
    );

    const items = [
      ...REVIEW_AREAS
        .filter(a =>
          weak.includes(a.id)
        )
        .map(a => ({
          title: a.action,
          detail:
            a.title + ' · recommended',
          href: a.route
        })),
      {
        title: 'Practise with new trees',
        detail:
          'Return to independent practice',
        href: '#/practice'
      },
      {
        title: 'Retake the quiz',
        detail:
          'Start another quiz attempt',
        href: '#/quiz'
      },
      {
        title:
          'Continue to Learning Summary',
        detail:
          'Finish the learning sequence',
        href: '#/summary'
      }
    ];

    const links = rvEl(
      'div',
      'review-next-grid'
    );

    items.forEach(item => {
      const a = rvEl(
        'a',
        'review-next-link'
      );

      a.href = item.href;

      a.append(
        rvEl(
          'strong',
          '',
          item.title
        ),
        rvEl(
          'span',
          '',
          item.detail
        )
      );

      links.append(a);
    });

    card.append(links);
    panel.append(card);
  }

  /* ==========================================
     PAGE REFRESH
     ========================================== */

  function renderAll() {
    renderResults();
    renderConcepts();
    renderCheck();
    renderNext();
    switchTab(active);
  }

  // Display the saved score immediately.
  renderAll();

  // Load question wording and correct answers.
  // If the bank fails, the saved score still works.
  (async () => {
    try {
      const response = await fetch(
        '/data/quiz-bank.json',
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.items)) {
        throw new Error(
          'Invalid quiz-bank.json'
        );
      }

      if (destroyed) return;

      bank = new Map(
        data.items
          .filter(q => q.id)
          .map(q => [q.id, q])
      );

      // Update question details and recommendations.
      // Keep Quick Check selections unchanged.
      renderResults();
      renderConcepts();
      renderNext();

    } catch {
      // Saved quiz results remain available
      // even when the question bank can't load.
    }
  })();

  return () => {
    destroyed = true;
  };
}
