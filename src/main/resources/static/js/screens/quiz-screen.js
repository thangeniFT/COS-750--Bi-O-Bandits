
/**
 * COS212 DFS Tutor — Readiness Quiz
 * Page 6
 *
 * Learning design:
 * - Gagne: elicit performance and provide feedback
 * - Mayer: segmenting and signalling
 * - Retrieval practice and metacognition
 *
 * First attempt: Variant A
 * First retry: Variant B
 *
 * Questions loaded from data/quiz-bank.json.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

const TREES = {
  A: {
    nodes: [
      [50, 300, 42],
      [30, 155, 136],
      [70, 445, 136],
      [20, 75, 252],
      [40, 235, 252],
      [60, 365, 252],
      [80, 525, 252]
    ],
    edges: [
      [50, 30],
      [50, 70],
      [30, 20],
      [30, 40],
      [70, 60],
      [70, 80]
    ]
  },

  B: {
    nodes: [
      [45, 300, 42],
      [25, 153, 136],
      [65, 447, 136],
      [15, 75, 252],
      [35, 235, 252],
      [55, 397, 252],
      [30, 185, 350]
    ],
    edges: [
      [45, 25],
      [45, 65],
      [25, 15],
      [25, 35],
      [35, 30],
      [65, 55]
    ]
  }
};

function node(tag, className = '', value = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = value;
  return element;
}

function svgNode(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }

  return element;
}

/* ==========================================
   TREE DIAGRAMS
   ========================================== */

function treeFigure(treeKey, highlight = {}) {
  const tree = TREES[treeKey];

  const wrapper = node('figure', 'quiz-tree');
  const caption = node('figcaption', '', `Tree ${treeKey}`);

  const svg = svgNode('svg', {
    viewBox: treeKey === 'B'
      ? '0 0 600 410'
      : '0 0 600 320',
    role: 'img',
    'aria-label':
      `Tree ${treeKey} with nodes ` +
      tree.nodes.map(n => n[0]).join(', ')
  });

  const positions = new Map(
    tree.nodes.map(([value, x, y]) => [
      value,
      { x, y }
    ])
  );

  // Draw connections behind nodes.
  tree.edges.forEach(([parentValue, childValue]) => {
    const parent = positions.get(parentValue);
    const child = positions.get(childValue);

    svg.appendChild(
      svgNode('line', {
        x1: parent.x,
        y1: parent.y,
        x2: child.x,
        y2: child.y,
        class: 'quiz-tree-edge'
      })
    );
  });

  tree.nodes.forEach(([value, x, y]) => {
    const current = Number(highlight.current) === value;

    const visited = (
      highlight.visited || []
    ).includes(value);

    const className = current
      ? 'quiz-tree-node is-current'
      : visited
        ? 'quiz-tree-node is-visited'
        : 'quiz-tree-node';

    const group = svgNode('g', {
      class: className
    });

    const circle = svgNode('circle', {
      cx: x,
      cy: y,
      r: 26
    });

    const valueText = svgNode('text', {
      x,
      y,
      class: 'quiz-tree-value'
    });

    valueText.textContent = String(value);

    group.append(circle, valueText);

    // Labels give non-colour cues.
    if (current || visited) {
      const state = svgNode('text', {
        x,
        y: y + 43,
        class: 'quiz-tree-state'
      });

      state.textContent = current ? 'NOW' : '✓';
      group.appendChild(state);
    }

    svg.appendChild(group);
  });

  wrapper.append(caption, svg);

  return wrapper;
}

/* ==========================================
   ANSWER VALIDATION
   ========================================== */

function normalizeOrder(text) {
  const raw = text.trim();

  // Accept whole numbers separated by spaces,
  // commas, semicolons or arrows.
  if (
    !raw ||
    !/^\s*\d+(?:\s*(?:,|;|→|\s)\s*\d+)*\s*$/.test(raw)
  ) {
    return null;
  }

  return raw
    .split(/[\s,;→]+/)
    .filter(Boolean)
    .map(Number);
}

function arraysEqual(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((value, index) => value === b[index])
  );
}

function feedbackFor(item, submitted) {
  if (item.type === 'choice') {
    const selected = item.options.find(
      option => option.id === submitted
    );

    return {
      correct: selected?.correct === true,
      explanation:
        selected?.feedback ||
        'Review the concept before continuing.',
      misconception:
        selected?.misconception || null
    };
  }

  // Traversal-order question.
  if (arraysEqual(submitted, item.answer)) {
    return {
      correct: true,
      explanation: item.correctFeedback,
      misconception: null
    };
  }

  // Match common incorrect traversals.
  const rule = (item.rules || []).find(rule =>
    arraysEqual(submitted, rule.match)
  );

  if (rule) {
    return {
      correct: false,
      explanation: rule.feedback,
      misconception: rule.misconception || null
    };
  }

  // Custom feedback: identify first mistake.
  const mismatch = item.answer.findIndex(
    (value, index) => submitted?.[index] !== value
  );

  const position = mismatch < 0
    ? item.answer.length + 1
    : mismatch + 1;

  const expected = item.answer[mismatch] ?? '—';

  const explanation = (
    item.fallbackFeedback ||
    'Review the traversal order.'
  )
    .replaceAll('{position}', String(position))
    .replaceAll('{expected}', String(expected));

  return {
    correct: false,
    explanation,
    misconception: null
  };
}

/* ==========================================
   MAIN QUIZ SCREEN
   ========================================== */

export function render(screen, container) {
  const page = node('main', 'quiz-page');

  const state = {
    bank: null,
    attempt: 0,
    items: [],
    index: 0,
    answers: [],
    chosen: null,
    confidence: null
  };

  let destroyed = false;

  // Measure sticky navigation height.
  const header = document.querySelector('.app-header');

  let headerObserver = null;

  if (header) {
    const measure = () => {
      document.documentElement.style.setProperty(
        '--app-header-height',
        `${Math.ceil(header.getBoundingClientRect().height)}px`
      );
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      headerObserver = new ResizeObserver(measure);
      headerObserver.observe(header);
    }
  }

  // ========================================
  // STICKY PROGRESS
  // ========================================

  const progress = node('div', 'lesson-progress');

  const progressHeading = node(
    'div',
    'lesson-progress__header'
  );

  const progressTitle = node(
    'strong',
    '',
    'READINESS QUIZ'
  );

  const progressText = node(
    'span',
    '',
    'Question 0 of 0'
  );

  progressHeading.append(
    progressTitle,
    progressText
  );

  const progressTrack = node(
    'div',
    'lesson-progress__track'
  );

  progressTrack.setAttribute('role', 'progressbar');

  progressTrack.setAttribute(
    'aria-label',
    'Completed quiz questions'
  );

  progressTrack.setAttribute('aria-valuemin', '0');
  progressTrack.setAttribute('aria-valuemax', '7');
  progressTrack.setAttribute('aria-valuenow', '0');

  const progressFill = node(
    'div',
    'lesson-progress__fill'
  );

  progressTrack.appendChild(progressFill);

  progress.append(
    progressHeading,
    progressTrack
  );

  // ========================================
  // INTRODUCTION
  // ========================================

  const intro = node(
    'header',
    'quiz-intro quiz-card'
  );

  intro.append(
    node(
      'span',
      'quiz-eyebrow',
      'PAGE 6 / CHECK YOUR READINESS'
    ),
    node('h1', '', 'Readiness Quiz'),
    node(
      'p',
      'quiz-lead',
      'Answer one question at a time, ' +
      'then indicate how confident you feel. ' +
      'You will receive feedback immediately.'
    ),
    node(
      'p',
      'quiz-muted',
      'This quiz is for learning, not marks. ' +
      'You can review explanations and retry ' +
      'with different questions.'
    )
  );

  // ========================================
  // QUIZ AND RESULT CONTAINERS
  // ========================================

  const stage = node(
    'section',
    'quiz-card quiz-stage'
  );

  const results = node(
    'section',
    'quiz-card quiz-results'
  );

  results.hidden = true;

  // Navigation
  const navigation = node(
    'nav',
    'quiz-navigation'
  );

  navigation.setAttribute(
    'aria-label',
    'Quiz navigation'
  );

  const back = node(
    'a',
    'quiz-nav-back',
    '← Practice'
  );

  back.href = '#/practice';

  const reviewLink = node(
    'a',
    'quiz-nav-next',
    'Next Lesson →'
  );

  reviewLink.href = '#/review';

  navigation.append(back, reviewLink);

  page.append(
    progress,
    intro,
    stage,
    results,
    navigation
  );

  container.appendChild(page);

  // ========================================
  // UPDATE PROGRESS
  // ========================================

  function updateProgress() {
    const total = state.items.length;
    const done = state.answers.length;

    progressText.textContent =
      `Question ${done} of ${total}`;

    progressFill.style.width = total
      ? `${(done / total) * 100}%`
      : '0%';

    progressTrack.setAttribute(
      'aria-valuemax',
      String(total)
    );

    progressTrack.setAttribute(
      'aria-valuenow',
      String(done)
    );
  }

  // ========================================
  // START AN ATTEMPT
  // ========================================

  function startAttempt(attempt) {
    state.attempt = attempt;
    state.index = 0;
    state.answers = [];
    state.chosen = null;
    state.confidence = null;

    const variant = attempt % 2 === 0 ? 'A' : 'B';

    // Group questions by slot.
    const bySlot = new Map();

    state.bank.items.forEach(item => {
      if (!bySlot.has(item.slot)) {
        bySlot.set(item.slot, []);
      }

      bySlot.get(item.slot).push(item);
    });

    // Choose one question per slot.
    state.items = [...bySlot.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, versions]) => {
        return versions.find(
          item => item.variant === variant
        ) || versions[0];
      });

    results.hidden = true;
    stage.hidden = false;

    renderQuestion();
  }

  // ========================================
  // RENDER ONE QUESTION
  // ========================================

  function renderQuestion() {
    stage.replaceChildren();

    state.chosen = null;
    state.confidence = null;

    updateProgress();

    const item = state.items[state.index];

    if (!item) {
      renderResults();
      return;
    }

    stage.append(
      node(
        'span',
        'quiz-eyebrow',
        `QUESTION ${state.index + 1} OF ` +
        `${state.items.length} · ${item.outcome}`
      ),
      node(
        'h2',
        'quiz-question',
        item.prompt
      )
    );

    // Show relevant tree.
    if (item.tree && TREES[item.tree]) {
      stage.appendChild(
        treeFigure(item.tree, item.highlight)
      );
    }

    const form = node('form', 'quiz-answer-form');

    const feedback = node(
      'div',
      'quiz-feedback'
    );

    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');

    const confidenceLabel = node(
      'p',
      'quiz-subheading',
      'How confident are you?'
    );

    const confidenceGroup = node(
      'div',
      'quiz-confidence'
    );

    confidenceGroup.setAttribute('role', 'group');
    confidenceGroup.setAttribute(
      'aria-label',
      'Confidence in your answer'
    );

    const confidenceHelp = node(
      'p',
      'quiz-muted',
      'Choose your confidence after selecting an answer.'
    );

    const checkButton = node(
      'button',
      'quiz-button quiz-button--primary',
      'Check answer'
    );

    checkButton.type = 'submit';
    checkButton.disabled = true;

    const nextButton = node(
      'button',
      'quiz-button',
      'Next question →'
    );

    nextButton.type = 'button';
    nextButton.hidden = true;

    const controls = node(
      'div',
      'quiz-actions'
    );

    controls.append(checkButton, nextButton);

    let locked = false;

    function refreshCheckButton() {
      checkButton.disabled =
        locked ||
        state.chosen === null ||
        state.confidence === null;
    }

    // ----------------------------------------
    // MULTIPLE CHOICE
    // ----------------------------------------

    if (item.type === 'choice') {
      const choices = node(
        'div',
        'quiz-choices'
      );

      item.options.forEach(option => {
        const button = node(
          'button',
          'quiz-choice',
          option.text
        );

        button.type = 'button';
        button.setAttribute(
          'aria-pressed',
          'false'
        );

        button.addEventListener('click', () => {
          if (locked) return;

          state.chosen = option.id;

          choices.querySelectorAll('button')
            .forEach(other => {
              other.setAttribute(
                'aria-pressed',
                String(other === button)
              );
            });

          refreshCheckButton();
        });

        choices.appendChild(button);
      });

      const unsure = node(
        'button',
        'quiz-choice quiz-choice--unsure',
        'Not sure'
      );

      unsure.type = 'button';
      unsure.setAttribute('aria-pressed', 'false');

      unsure.addEventListener('click', () => {
        if (locked) return;

        state.chosen = '__unsure__';

        choices.querySelectorAll('button')
          .forEach(other => {
            other.setAttribute(
              'aria-pressed',
              String(other === unsure)
            );
          });

        refreshCheckButton();
      });

      choices.appendChild(unsure);
      form.appendChild(choices);
    }

    // ----------------------------------------
    // TRAVERSAL ORDER INPUT
    // ----------------------------------------

    if (item.type === 'order') {
      const label = node(
        'label',
        'quiz-order-label',
        'Type the node values in visiting order'
      );

      const input = node(
        'input',
        'quiz-order-input'
      );

      input.type = 'text';
      input.autocomplete = 'off';
      input.placeholder = 'e.g. 50, 30, 20, ...';

      input.setAttribute(
        'aria-describedby',
        'quiz-order-help'
      );

      const help = node(
        'p',
        'quiz-muted',
        'Separate values using commas or spaces.'
      );

      help.id = 'quiz-order-help';

      input.addEventListener('input', () => {
        if (locked) return;

        state.chosen = input.value.trim()
          ? input.value
          : null;

        refreshCheckButton();
      });

      label.appendChild(input);
      form.append(label, help);
    }

    // ----------------------------------------
    // CONFIDENCE RATINGS
    // ----------------------------------------

    const confidenceNames = {
      guessing: 'Guessing',
      'fairly-sure': 'Fairly sure',
      certain: 'Certain'
    };

    state.bank.confidenceLevels.forEach(level => {
      const button = node(
        'button',
        'quiz-confidence-button',
        confidenceNames[level] || level
      );

      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');

      button.addEventListener('click', () => {
        if (locked) return;

        state.confidence = level;

        confidenceGroup.querySelectorAll('button')
          .forEach(other => {
            other.setAttribute(
              'aria-pressed',
              String(other === button)
            );
          });

        refreshCheckButton();
      });

      confidenceGroup.appendChild(button);
    });

    form.append(
      confidenceLabel,
      confidenceGroup,
      confidenceHelp,
      feedback,
      controls
    );

    // ----------------------------------------
    // CHECK ANSWER
    // ----------------------------------------

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (
        locked ||
        state.chosen === null ||
        state.confidence === null
      ) {
        return;
      }

      const submitted = item.type === 'order'
        ? normalizeOrder(state.chosen)
        : state.chosen;

      let evaluation;

      if (state.chosen === '__unsure__') {
        evaluation = {
          correct: false,
          explanation:
            'Choosing Not sure is useful feedback. ' +
            'Review the concept, then continue.',
          misconception: null
        };
      } else if (item.type === 'order' && !submitted) {
        evaluation = {
          correct: false,
          explanation:
            'Use whole numbers separated by commas ' +
            'or spaces. Compare the sequence with ' +
            'the worked example in Guided Review.',
          misconception: null
        };
      } else {
        evaluation = feedbackFor(item, submitted);
      }

      state.answers.push({
        id: item.id,
        slot: item.slot,
        outcome: item.outcome,
        correct: evaluation.correct,
        confidence: state.confidence,
        misconception: evaluation.misconception,
        response: submitted
      });

      locked = true;

      form.querySelectorAll('input, button')
        .forEach(element => {
          if (element !== nextButton) {
            element.disabled = true;
          }
        });

      feedback.className = evaluation.correct
        ? 'quiz-feedback is-correct'
        : 'quiz-feedback is-review';

      feedback.replaceChildren(
        node(
          'strong',
          '',
          evaluation.correct
            ? '✓ Correct'
            : 'Review this idea'
        ),
        node('p', '', evaluation.explanation)
      );

      if (!evaluation.correct && item.type === 'order') {
        feedback.appendChild(
          node(
            'p',
            'quiz-muted',
            `Worked order: ${item.answer.join(' → ')}`
          )
        );
      }

      if (
        state.confidence === 'certain' &&
        !evaluation.correct
      ) {
        feedback.appendChild(
          node(
            'p',
            'quiz-calibration',
            'You felt certain, but this concept needs ' +
            'review. Compare your reasoning with ' +
            'the explanation above.'
          )
        );
      }

      checkButton.hidden = true;
      nextButton.hidden = false;

      nextButton.textContent =
        state.index === state.items.length - 1
          ? 'See my results →'
          : 'Next question →';

      updateProgress();
    });

    nextButton.addEventListener('click', () => {
      if (!locked) return;

      state.index++;

      if (state.index === state.items.length) {
        renderResults();
      } else {
        renderQuestion();
      }
    });

    stage.appendChild(form);
  }

  // ========================================
  // RESULTS AND GUIDED REVIEW
  // ========================================

  function renderResults() {
    stage.hidden = true;
    results.hidden = false;
    results.replaceChildren();

    updateProgress();

    const total = state.answers.length;

    const correct = state.answers.filter(
      answer => answer.correct
    ).length;

    const pass = correct >= state.bank.passMark;

/*
 * Pass formative quiz results to Guided Review.
 *
 * sessionStorage keeps results in this browser tab
 * while students navigate between lesson screens.
 */

try {
  const reviewData = {
    version: 1,
    attempt: state.attempt,
    correct,
    total,
    passMark: state.bank.passMark,
    answers: state.answers.map(answer => ({
      id: answer.id,
      slot: answer.slot,
      outcome: answer.outcome,
      correct: answer.correct,
      confidence: answer.confidence,
      misconception: answer.misconception
    }))
  };

  sessionStorage.setItem(
    'cos212-dfs-quiz-result',
    JSON.stringify(reviewData)
  );
} catch (error) {
  console.warn(
    'Quiz results could not be stored for Guided Review.',
    error
  );
}


    const wrong = state.answers.filter(
      answer => !answer.correct
    );

    const certainWrong = wrong.filter(
      answer => answer.confidence === 'certain'
    ).length;

    results.append(
      node(
        'span',
        'quiz-eyebrow',
        'YOUR FORMATIVE FEEDBACK'
      ),
      node(
        'h2',
        '',
        pass
          ? "You're ready to continue"
          : 'Review a few ideas first'
      ),
      node(
        'p',
        'quiz-score',
        `${correct} of ${total} questions correct`
      ),
      node(
        'p',
        'quiz-muted',
        `Readiness guideline: ` +
        `${state.bank.passMark} of ${total}. ` +
        'This is not a recorded grade.'
      )
    );

    const resultList = node(
      'div',
      'quiz-result-list'
    );

    state.answers.forEach(answer => {
      const row = node(
        'div',
        answer.correct
          ? 'quiz-result-row is-correct'
          : 'quiz-result-row is-review'
      );

      row.append(
        node(
          'strong',
          '',
          `${answer.correct ? '✓' : '↻'} ` +
          `Question ${answer.slot}`
        ),
        node(
          'span',
          '',
          `${answer.outcome} · ` +
          answer.confidence.replace('-', ' ')
        )
      );

      resultList.appendChild(row);
    });

    results.appendChild(resultList);

    const guide = node(
      'div',
      'quiz-guidance'
    );

    if (wrong.length) {
      const outcomes = [
        ...new Set(
          wrong.map(answer => answer.outcome)
        )
      ].join(', ');

      guide.append(
        node(
          'h3',
          '',
          'Review these learning outcomes'
        ),
        node(
          'p',
          '',
          `${outcomes}. Open Guided Review ` +
          'for explanations and examples.'
        )
      );
    } else {
      guide.append(
        node('h3', '', 'Excellent understanding'),
        node(
          'p',
          '',
          'You correctly answered every question. ' +
          'Review is still available to reinforce ' +
          'the concepts.'
        )
      );
    }

    if (certainWrong > 0) {
      guide.appendChild(
        node(
          'p',
          '',
          `${certainWrong} incorrect ` +
          `${certainWrong === 1 ? 'answer was' : 'answers were'} ` +
          'marked Certain. Review these explanations ' +
          'to improve confidence calibration.'
        )
      );
    }

    const misconceptionCodes = [
      ...new Set(
        wrong
          .map(answer => answer.misconception)
          .filter(Boolean)
      )
    ];

    if (misconceptionCodes.length) {
      guide.appendChild(
        node(
          'p',
          'quiz-muted',
          'Misconceptions to review: ' +
          misconceptionCodes.join(', ')
        )
      );
    }

    results.appendChild(guide);

    const actions = node(
      'div',
      'quiz-actions'
    );

    const retry = node(
      'button',
      'quiz-button quiz-button--primary',
      'Retry with new questions →'
    );

    retry.type = 'button';

    retry.addEventListener('click', () => {
      startAttempt(state.attempt + 1);
    });

    const review = node(
      'a',
      'quiz-button',
      'Open Guided Review →'
    );

    review.href = '#/review';

    actions.append(retry, review);
    results.appendChild(actions);
  }

  // ========================================
  // LOAD QUESTION BANK
  // ========================================

  async function loadBank() {
    try {
      const response = await fetch(
        '/data/quiz-bank.json',
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (
        !Array.isArray(data.items) ||
        data.items.length === 0 ||
        !Array.isArray(data.confidenceLevels)
      ) {
        throw new Error('Invalid quiz bank');
      }

      if (destroyed) return;

      state.bank = data;
      startAttempt(0);
    } catch (error) {
      if (destroyed) return;

      stage.replaceChildren(
        node('h2', '', 'Quiz could not load'),
        node(
          'p',
          '',
          'Check /data/quiz-bank.json. ' + error.message
        )
      );
    }
  }

  stage.appendChild(
    node('p', '', 'Loading quiz questions…')
  );

  loadBank();

  return () => {
    destroyed = true;
    headerObserver?.disconnect();
  };
}
