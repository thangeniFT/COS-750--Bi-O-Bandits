
/**
 * COS212 DFS Tutor — Applied Readiness Quiz
 * Three topic tabs, one question at a time.
 * Compatible with Guided Review.
 */

const QUIZ_NS = 'http://www.w3.org/2000/svg';

const QUIZ_TREES = {
  A: [67, 33, 86, 15, 52, 74, 96, 45],
  B: [59, 26, 82, 13, 41, 72, 93, 36]
};

const QUIZ_SECTIONS = [
  { id: 'bst', name: 'BST Skills' },
  { id: 'dfs', name: 'DFS & Stack' },
  { id: 'traversal', name: 'Traversal Orders' }
];

function qEl(tag, cls = '', text = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  e.textContent = text;
  return e;
}

function qButton(text, cls = 'quiz-button') {
  const b = qEl('button', cls, text);
  b.type = 'button';
  return b;
}

function qSvg(tag, props = {}) {
  const e = document.createElementNS(QUIZ_NS, tag);

  Object.entries(props).forEach(([k, v]) => {
    e.setAttribute(k, String(v));
  });

  return e;
}

/* ==========================================
   TREE HELPERS
   ========================================== */

function qTree(values) {
  let root = null;

  for (const value of values) {
    if (!root) {
      root = {
        value,
        left: null,
        right: null,
        parent: null
      };
      continue;
    }

    let node = root;

    while (node) {
      const side = value < node.value
        ? 'left'
        : 'right';

      if (!node[side]) {
        node[side] = {
          value,
          left: null,
          right: null,
          parent: node
        };
        break;
      }

      node = node[side];
    }
  }

  return root;
}

function qEntries(root) {
  const arr = [];

  function visit(n, depth = 0) {
    if (!n) return;

    visit(n.left, depth + 1);
    arr.push({ n, depth });
    visit(n.right, depth + 1);
  }

  visit(root);
  return arr;
}

function qParseOrder(text) {
  const raw = text.trim();

  if (
    !raw ||
    !/^\d+(?:[\s,;→]+\d+)*$/.test(raw)
  ) {
    return null;
  }

  return raw
    .split(/[\s,;→]+/)
    .map(Number);
}

function qSame(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((v, i) => v === b[i])
  );
}

/* ==========================================
   ANSWER EVALUATION
   ========================================== */

function qEvaluate(item, submitted) {
  if (submitted === '__unsure__') {
    return {
      correct: false,
      explanation:
        'Review the explanation below, then try the ' +
        'alternate quiz on your next attempt.',
      misconception: null
    };
  }

  if (item.type === 'choice') {
    const selected = (item.options || []).find(
      opt => opt.id === submitted
    );

    return {
      correct: selected?.correct === true,
      explanation:
        selected?.feedback ||
        'Review the concept and compare the available choices.',
      misconception:
        selected?.misconception || null
    };
  }

  if (!Array.isArray(submitted)) {
    return {
      correct: false,
      explanation:
        'Enter whole numbers separated by commas, ' +
        'spaces or arrows.',
      misconception: null
    };
  }

  if (qSame(submitted, item.answer)) {
    return {
      correct: true,
      explanation: item.correctFeedback,
      misconception: null
    };
  }

  const known = (item.rules || []).find(
    rule => qSame(rule.match, submitted)
  );

  if (known) {
    return {
      correct: false,
      explanation: known.feedback,
      misconception: known.misconception || null
    };
  }

  const first = item.answer.findIndex(
    (v, i) => submitted[i] !== v
  );

  const pos = first === -1
    ? item.answer.length + 1
    : first + 1;

  const expected = item.answer[first] ?? '—';

  return {
    correct: false,
    explanation:
      (
        item.fallbackFeedback ||
        'Review the traversal rule.'
      )
        .replaceAll('{position}', String(pos))
        .replaceAll('{expected}', String(expected)),
    misconception: null
  };
}

/* ==========================================
   INTERACTIVE TREE
   ========================================== */

function qFigure(
  key,
  highlight = {},
  onPick = null,
  draft = []
) {
  const root = qTree(QUIZ_TREES[key]);
  const entries = qEntries(root);

  const maxDepth = Math.max(
    ...entries.map(e => e.depth)
  );

  const width = 680;
  const height = Math.max(
    335,
    115 + maxDepth * 92
  );

  const positions = new Map();

  entries.forEach(({ n, depth }, i) => {
    positions.set(n, {
      x: 53 + i * (width - 106) /
        (entries.length - 1),
      y: 48 + depth * 92
    });
  });

  const figure = qEl('figure', 'quiz-tree');

  const caption = qEl(
    'figcaption',
    '',
    `Tree ${key} · ${entries.length} nodes`
  );

  const svg = qSvg('svg', {
    viewBox: `0 0 ${width} ${height}`,
    'aria-label':
      `Tree ${key}. Select a node when the ` +
      'question asks you to.',
    role: onPick ? 'group' : 'img'
  });

  // Tree edges
  entries.forEach(({ n }) => {
    if (!n.parent) return;

    const a = positions.get(n.parent);
    const b = positions.get(n);

    svg.appendChild(
      qSvg('line', {
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y,
        class: 'quiz-tree-edge'
      })
    );
  });

  // Tree nodes
  entries.forEach(({ n }) => {
    const { x, y } = positions.get(n);

    const classes = ['quiz-tree-node'];

    if (
      Number(highlight.current) === n.value
    ) {
      classes.push('is-current');
    } else if (
      (highlight.visited || []).includes(n.value)
    ) {
      classes.push('is-visited');
    }

    if (draft.includes(n.value)) {
      classes.push('is-draft');
    }

    if (highlight.selected === n.value) {
      classes.push('is-selected');
    }

    const attrs = {
      class: classes.join(' '),
      'data-value': n.value,
      'aria-label': `Node ${n.value}`
    };

    if (onPick) {
      attrs.role = 'button';
      attrs.tabindex = 0;
    }

    const group = qSvg('g', attrs);

    const circle = qSvg('circle', {
      cx: x,
      cy: y,
      r: 25
    });

    const value = qSvg('text', {
      x,
      y,
      class: 'quiz-tree-value'
    });

    value.textContent = String(n.value);

    group.append(circle, value);

    const index = draft.indexOf(n.value);

    if (
      index >= 0 ||
      Number(highlight.current) === n.value
    ) {
      const tag = qSvg('text', {
        x,
        y: y + 43,
        class: 'quiz-tree-state'
      });

      tag.textContent = index >= 0
        ? `#${index + 1}`
        : 'NOW';

      group.appendChild(tag);
    }

    if (onPick) {
      group.addEventListener(
        'click',
        () => onPick(n.value)
      );

      group.addEventListener(
        'keydown',
        e => {
          if (
            e.key === 'Enter' ||
            e.key === ' '
          ) {
            e.preventDefault();
            onPick(n.value);
          }
        }
      );
    }

    svg.appendChild(group);
  });

  // Legend inside the bordered tree card
  const legend = qEl('div', 'quiz-legend');

  [
    ['Not selected', 'normal'],
    ['Current', 'current'],
    ['Visited / draft', 'visited']
  ].forEach(([name, cls]) => {
    const item = qEl(
      'span',
      'quiz-legend-item'
    );

    item.append(
      qEl(
        'span',
        `quiz-legend-dot ${cls}`
      ),
      document.createTextNode(name)
    );

    legend.appendChild(item);
  });

  figure.append(caption, svg, legend);

  return figure;
}

/* ==========================================
   MAIN QUIZ SCREEN
   ========================================== */

export function render(screen, container) {
  const page = qEl('main', 'quiz-page');

  const state = {
    bank: null,
    attempt: 0,
    items: [],
    index: 0,
    responses: new Map(),
    drafts: new Map(),
    confidences: new Map()
  };

  let destroyed = false;

  // ------------------------------------------
  // INTRODUCTION
  // ------------------------------------------

  const intro = qEl(
    'header',
    'quiz-intro'
  );

  intro.append(
    qEl('h1', '', 'Readiness Quiz'),
    qEl(
      'p',
      'quiz-muted',
      'Apply BST rules, trace DFS with a stack, ' +
      'and solve traversal questions on new trees. ' +
      'Check each answer for feedback. Confidence ' +
      'is optional; your answers are not graded.'
    )
  );

  // ------------------------------------------
  // TOPIC TABS
  // ------------------------------------------

  const tabBar = qEl('div', 'quiz-tabs');

  tabBar.setAttribute('role', 'tablist');

  tabBar.setAttribute(
    'aria-label',
    'Quiz topics'
  );

  const tabButtons = QUIZ_SECTIONS.map(section => {
    const b = qButton(
      section.name,
      'quiz-tab'
    );

    b.setAttribute('role', 'tab');
    b.dataset.section = section.id;

    b.addEventListener('click', () => {
      goSection(section.id);
    });

    tabBar.appendChild(b);

    return b;
  });

  const resultsTab = qButton(
    'My Results',
    'quiz-tab quiz-results-tab'
  );

  resultsTab.setAttribute('role', 'tab');
  resultsTab.disabled = true;

  resultsTab.addEventListener(
    'click',
    () => showResults()
  );

  tabBar.appendChild(resultsTab);

  tabBar.addEventListener('keydown', event => {
    const buttons = [
      ...tabBar.querySelectorAll(
        'button:not(:disabled)'
      )
    ];

    const current = buttons.indexOf(
      document.activeElement
    );

    if (current < 0) return;

    let next = null;

    if (event.key === 'ArrowRight') {
      next = (current + 1) % buttons.length;
    }

    if (event.key === 'ArrowLeft') {
      next =
        (current + buttons.length - 1) %
        buttons.length;
    }

    if (event.key === 'Home') next = 0;

    if (event.key === 'End') {
      next = buttons.length - 1;
    }

    if (next !== null) {
      event.preventDefault();
      buttons[next].click();
      buttons[next].focus();
    }
  });

  // ------------------------------------------
  // CONTENT AREAS
  // ------------------------------------------

  const stage = qEl(
    'section',
    'quiz-card quiz-stage'
  );

  const results = qEl(
    'section',
    'quiz-card quiz-results'
  );

  results.hidden = true;

  const nav = qEl(
    'nav',
    'quiz-navigation'
  );

  nav.setAttribute(
    'aria-label',
    'Quiz page navigation'
  );

  const back = qEl(
    'a',
    'quiz-nav-back',
    '← Practice'
  );

  back.href = '#/practice';

  const review = qEl(
    'a',
    'quiz-nav-next',
    'Guided Review →'
  );

  review.href = '#/review';

  nav.append(back, review);

  page.append(
    intro,
    tabBar,
    stage,
    results,
    nav
  );

  container.replaceChildren(page);

  function sectionOf(item) {
    return item.section || (
      item.slot <= 2
        ? 'bst'
        : item.slot <= 5
          ? 'dfs'
          : 'traversal'
    );
  }

  const isFinished = () =>
    state.responses.size === state.items.length;

  // ------------------------------------------
  // TAB STATUS
  // ------------------------------------------

  function updateTabs(resultsMode = false) {
    const item = state.items[state.index];

    const active = resultsMode
      ? 'results'
      : item
        ? sectionOf(item)
        : 'bst';

    tabButtons.forEach(b => {
      const id = b.dataset.section;

      const questions = state.items.filter(
        q => sectionOf(q) === id
      );

      const complete =
        questions.length &&
        questions.every(
          q => state.responses.has(q.slot)
        );

      b.classList.toggle(
        'is-done',
        Boolean(complete)
      );

      b.classList.toggle(
        'is-active',
        active === id
      );

      b.setAttribute(
        'aria-selected',
        String(active === id)
      );
    });

    resultsTab.disabled = !isFinished();

    resultsTab.classList.toggle(
      'is-active',
      active === 'results'
    );

    resultsTab.setAttribute(
      'aria-selected',
      String(active === 'results')
    );
  }

  function goSection(section) {
    if (!state.items.length) return;

    const firstUnanswered =
      state.items.findIndex(
        q =>
          sectionOf(q) === section &&
          !state.responses.has(q.slot)
      );

    const first = state.items.findIndex(
      q => sectionOf(q) === section
    );

    state.index = firstUnanswered !== -1
      ? firstUnanswered
      : first;

    if (state.index < 0) return;

    results.hidden = true;
    stage.hidden = false;

    renderQuestion();
  }

  // ------------------------------------------
  // START / RETRY QUIZ
  // ------------------------------------------

  function startAttempt(attempt) {
    state.attempt = attempt;
    state.index = 0;

    state.responses.clear();
    state.drafts.clear();
    state.confidences.clear();

    const variant = attempt % 2 === 0
      ? 'A'
      : 'B';

    const slots = new Map();

    state.bank.items.forEach(item => {
      if (!slots.has(item.slot)) {
        slots.set(item.slot, []);
      }

      slots.get(item.slot).push(item);
    });

    state.items = [...slots.entries()]
      .sort(
        (a, b) => Number(a[0]) - Number(b[0])
      )
      .map(([, versions]) =>
        versions.find(
          q => q.variant === variant
        ) || versions[0]
      );

    results.hidden = true;
    stage.hidden = false;

    renderQuestion();
  }

  /* ==========================================
     RENDER A QUESTION
     ========================================== */

  function renderQuestion() {
    stage.replaceChildren();

    results.hidden = true;
    stage.hidden = false;

    updateTabs();

    const item = state.items[state.index];
    if (!item) return;

    const saved = state.responses.get(item.slot);

    const section = QUIZ_SECTIONS.find(
      s => s.id === sectionOf(item)
    );

    const header = qEl(
      'div',
      'quiz-question-header'
    );

    header.append(
      qEl(
        'span',
        'quiz-eyebrow',
        section?.name || item.outcome
      ),
      qEl(
        'span',
        'quiz-counter',
        `Question ${state.index + 1} of ` +
        `${state.items.length}`
      )
    );

    stage.append(
      header,
      qEl(
        'h2',
        'quiz-question',
        item.prompt
      )
    );

    const workspace = qEl(
      'div',
      'quiz-workspace'
    );

    const treeHost = qEl(
      'div',
      'quiz-tree-host'
    );

    const answerPanel = qEl(
      'div',
      'quiz-answer-panel'
    );

    const form = qEl(
      'form',
      'quiz-answer-form'
    );

    const feedback = qEl(
      'div',
      'quiz-feedback'
    );

    feedback.setAttribute(
      'aria-live',
      'polite'
    );

    let working = state.drafts.has(item.slot)
      ? state.drafts.get(item.slot)
      : null;

    const isChoice = item.type === 'choice';

    const isTreeChoice =
      isChoice &&
      item.presentation === 'tree-click' &&
      Boolean(item.tree);

    const choiceList = qEl(
      'div',
      'quiz-choices'
    );

    const responseInput = qEl(
      'input',
      'quiz-order-input'
    );

    const draftTrail = qEl(
      'div',
      'quiz-draft-trail'
    );

    const confidenceGroup = qEl(
      'div',
      'quiz-confidence'
    );

    const check = qButton(
      'Check answer',
      'quiz-button quiz-button--primary'
    );

    check.type = 'submit';

    const next = qButton(
      'Next question →',
      'quiz-button quiz-button--primary'
    );

    const previous = qButton(
      '← Previous',
      'quiz-button'
    );

    const actions = qEl(
      'div',
      'quiz-actions'
    );

    actions.append(
      previous,
      check,
      next
    );

    next.hidden = true;
    previous.disabled = state.index === 0;

    function updateCheck() {
      if (state.responses.has(item.slot)) {
        return;
      }

      check.disabled =
        working === null ||
        (
          typeof working === 'string' &&
          !working.trim()
        );
    }

    // ----------------------------------------
    // TREE UPDATE
    // ----------------------------------------

    function drawFigure() {
      if (
        !item.tree ||
        !QUIZ_TREES[item.tree]
      ) {
        return;
      }

      const draft = !isChoice
        ? (
            qParseOrder(responseInput.value) ||
            []
          )
        : [];

      const selected =
        isTreeChoice &&
        working !== null &&
        working !== '__unsure__'
          ? Number(working)
          : null;

      const highlight = {
        ...(item.highlight || {}),
        selected
      };

      treeHost.replaceChildren(
        qFigure(
          item.tree,
          highlight,
          state.responses.has(item.slot)
            ? null
            : isTreeChoice
              ? selectChoice
              : !isChoice
                ? addNode
                : null,
          draft
        )
      );
    }

    // ----------------------------------------
    // MULTIPLE CHOICE
    // ----------------------------------------

    function selectChoice(id) {
      if (
        state.responses.has(item.slot)
      ) {
        return;
      }

      working = String(id);

      state.drafts.set(
        item.slot,
        working
      );

      choiceList.querySelectorAll('button')
        .forEach(b => {
          b.setAttribute(
            'aria-pressed',
            String(b.dataset.id === working)
          );
        });

      updateCheck();

      if (isTreeChoice) {
        drawFigure();
      }
    }

    // ----------------------------------------
    // TRAVERSAL DRAFT
    // ----------------------------------------

    function renderDraft() {
      draftTrail.replaceChildren();

      const parsed = qParseOrder(
        responseInput.value
      );

      if (!parsed || !parsed.length) {
        draftTrail.textContent =
          'Your sequence will appear here.';
        return;
      }

      parsed.forEach((v, i) => {
        draftTrail.appendChild(
          qEl(
            'span',
            'quiz-draft-chip',
            String(v)
          )
        );

        if (i !== parsed.length - 1) {
          draftTrail.appendChild(
            qEl('span', '', '→')
          );
        }
      });
    }

    function setInput(v) {
      responseInput.value = v;

      working = v.trim()
        ? v
        : null;

      if (working === null) {
        state.drafts.delete(item.slot);
      } else {
        state.drafts.set(
          item.slot,
          working
        );
      }

      renderDraft();
      updateCheck();
      drawFigure();
    }

    function addNode(value) {
      if (
        state.responses.has(item.slot)
      ) {
        return;
      }

      const parsed = qParseOrder(
        responseInput.value
      );

      if (
        responseInput.value.trim() &&
        !parsed
      ) {
        return;
      }

      const list = parsed || [];

      if (list.includes(value)) return;

      setInput(
        [...list, value].join(', ')
      );
    }

    // ----------------------------------------
    // BUILD ANSWER AREA
    // ----------------------------------------

    if (isChoice) {
      if (isTreeChoice) {
        answerPanel.appendChild(
          qEl(
            'p',
            'quiz-muted',
            'Select your answer directly on the tree.'
          )
        );
      }

      if (!isTreeChoice) {
        (item.options || []).forEach(opt => {
          const b = qButton(
            opt.text,
            'quiz-choice'
          );

          b.dataset.id = opt.id;

          b.setAttribute(
            'aria-pressed',
            String(working === opt.id)
          );

          b.disabled = Boolean(saved);

          b.addEventListener(
            'click',
            () => selectChoice(opt.id)
          );

          choiceList.appendChild(b);
        });
      }

      const unsure = qButton(
        'Not sure',
        'quiz-choice quiz-choice--unsure'
      );

      unsure.dataset.id = '__unsure__';
      unsure.disabled = Boolean(saved);

      unsure.setAttribute(
        'aria-pressed',
        String(working === '__unsure__')
      );

      unsure.addEventListener(
        'click',
        () => selectChoice('__unsure__')
      );

      choiceList.appendChild(unsure);
      answerPanel.appendChild(choiceList);

    } else {
      const label = qEl(
        'label',
        'quiz-order-label',
        'Build the sequence by clicking nodes ' +
        'or typing their values'
      );

      responseInput.type = 'text';

      responseInput.placeholder =
        'e.g. 67, 33, 15, ...';

      responseInput.autocomplete = 'off';

      responseInput.value =
        typeof working === 'string'
          ? working
          : '';

      responseInput.disabled = Boolean(saved);

      responseInput.addEventListener(
        'input',
        () => setInput(responseInput.value)
      );

      label.appendChild(responseInput);

      const editing = qEl(
        'div',
        'quiz-edit-actions'
      );

      const undo = qButton(
        'Undo last',
        'quiz-button quiz-button--small'
      );

      const clear = qButton(
        'Clear',
        'quiz-button quiz-button--small'
      );

      undo.disabled = Boolean(saved);
      clear.disabled = Boolean(saved);

      undo.addEventListener('click', () => {
        const values = qParseOrder(
          responseInput.value
        );

        if (values) {
          setInput(
            values.slice(0, -1).join(', ')
          );
        }
      });

      clear.addEventListener(
        'click',
        () => setInput('')
      );

      editing.append(undo, clear);

      answerPanel.append(
        label,
        qEl(
          'p',
          'quiz-muted',
          'Each node is visited once. Use commas, ' +
          'spaces or arrows.'
        ),
        draftTrail,
        editing
      );

      renderDraft();
    }

    // ----------------------------------------
    // TREE + RESPONSE LAYOUT
    // ----------------------------------------

    if (
      item.tree &&
      QUIZ_TREES[item.tree]
    ) {
      workspace.classList.add(
        'has-tree'
      );

      workspace.append(
        treeHost,
        answerPanel
      );

      drawFigure();

    } else {
      workspace.append(answerPanel);
    }

    form.appendChild(workspace);

    // ----------------------------------------
    // OPTIONAL CONFIDENCE
    // ----------------------------------------

    const confidenceTitle = qEl(
      'p',
      'quiz-subheading',
      'How confident are you? (optional)'
    );

    const levels = [
      ['guessing', 'Guessing'],
      ['fairly-sure', 'Fairly sure'],
      ['certain', 'Certain']
    ];

    levels.forEach(([value, text]) => {
      const b = qButton(
        text,
        'quiz-confidence-button'
      );

      b.setAttribute(
        'aria-pressed',
        String(
          state.confidences.get(item.slot) ===
          value
        )
      );

      b.disabled = Boolean(saved);

      b.addEventListener('click', () => {
        state.confidences.set(
          item.slot,
          value
        );

        confidenceGroup
          .querySelectorAll('button')
          .forEach(other => {
            other.setAttribute(
              'aria-pressed',
              String(other === b)
            );
          });
      });

      confidenceGroup.appendChild(b);
    });

    form.append(
      confidenceTitle,
      confidenceGroup,
      feedback,
      actions
    );

    stage.appendChild(form);

    updateCheck();

    // ----------------------------------------
    // SHOW FEEDBACK
    // ----------------------------------------

    function showFeedback(response) {
      feedback.className =
        `quiz-feedback ${
          response.correct
            ? 'is-correct'
            : 'is-review'
        }`;

      feedback.replaceChildren(
        qEl(
          'strong',
          '',
          response.correct
            ? '✓ Correct'
            : 'Review this idea'
        ),
        qEl(
          'p',
          '',
          response.explanation
        )
      );

      if (
        !response.correct &&
        item.type === 'order'
      ) {
        feedback.appendChild(
          qEl(
            'p',
            'quiz-worked-order',
            'Correct sequence: ' +
            item.answer.join(' → ')
          )
        );
      }

      if (
        !response.correct &&
        response.confidence === 'certain'
      ) {
        feedback.appendChild(
          qEl(
            'p',
            'quiz-calibration',
            'You selected Certain. Use the ' +
            'explanation to check your reasoning.'
          )
        );
      }

      form.querySelectorAll(
        'input, button'
      ).forEach(b => {
        if (
          b !== previous &&
          b !== next
        ) {
          b.disabled = true;
        }
      });

      check.hidden = true;
      next.hidden = false;

      next.textContent =
        state.index === state.items.length - 1
          ? (
              isFinished()
                ? 'See results →'
                : 'Find unanswered →'
            )
          : 'Next question →';

      updateTabs();
    }

    if (saved) {
      showFeedback(saved);
    } else {
      check.hidden = false;
    }

    // ----------------------------------------
    // SUBMIT ANSWER
    // ----------------------------------------

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (
        state.responses.has(item.slot) ||
        working === null
      ) {
        return;
      }

      const submitted =
        item.type === 'order'
          ? qParseOrder(working)
          : working;

      const evaluation = qEvaluate(
        item,
        submitted
      );

      const response = {
        id: item.id,
        slot: item.slot,
        outcome: item.outcome,
        section: sectionOf(item),
        correct: evaluation.correct,
        explanation: evaluation.explanation,
        misconception: evaluation.misconception,
        confidence:
          state.confidences.get(item.slot) ||
          'not-set',
        response: submitted
      };

      state.responses.set(
        item.slot,
        response
      );

      showFeedback(response);
    });

    // ----------------------------------------
    // QUESTION NAVIGATION
    // ----------------------------------------

    function moveTo(index) {
      state.index = index;
      renderQuestion();
    }

    previous.addEventListener('click', () => {
      if (state.index > 0) {
        moveTo(state.index - 1);
      }
    });

    next.addEventListener('click', () => {
      if (
        state.index <
        state.items.length - 1
      ) {
        moveTo(state.index + 1);
      } else if (isFinished()) {
        showResults();
      } else {
        const first = state.items.findIndex(
          q => !state.responses.has(q.slot)
        );

        moveTo(first);
      }
    });
  }

  /* ==========================================
     RESULTS
     ========================================== */

  function showResults() {
    if (!isFinished()) return;

    stage.hidden = true;
    results.hidden = false;
    results.replaceChildren();

    updateTabs(true);

    const answers = state.items.map(
      q => state.responses.get(q.slot)
    );

    const correct = answers.filter(
      a => a.correct
    ).length;

    const pass =
      correct >= state.bank.passMark;

    const weak = answers.filter(
      a => !a.correct
    );

    const confidentWrong = weak.filter(
      a => a.confidence === 'certain'
    ).length;

    // Preserve Guided Review integration.
    try {
      sessionStorage.setItem(
        'cos212-dfs-quiz-result',
        JSON.stringify({
          version: 1,
          attempt: state.attempt,
          correct,
          total: answers.length,
          passMark: state.bank.passMark,
          answers: answers.map(a => ({
            id: a.id,
            slot: a.slot,
            outcome: a.outcome,
            correct: a.correct,
            confidence: a.confidence,
            misconception: a.misconception
          }))
        })
      );
    } catch (e) {
      console.warn(
        'Could not store quiz results for Guided Review.',
        e
      );
    }

    results.append(
      qEl(
        'span',
        'quiz-eyebrow',
        'YOUR RESULTS'
      ),
      qEl(
        'h2',
        '',
        pass
          ? 'Ready for Guided Review'
          : 'A few ideas to strengthen'
      ),
      qEl(
        'p',
        'quiz-score',
        `${correct} / ${answers.length} correct`
      ),
      qEl(
        'p',
        'quiz-muted',
        `Readiness guideline: ${state.bank.passMark} ` +
        `out of ${answers.length}. This is formative, ` +
        'not a recorded grade.'
      )
    );

    const list = qEl(
      'div',
      'quiz-result-list'
    );

    state.items.forEach((item, i) => {
      const a = state.responses.get(
        item.slot
      );

      const row = qEl(
        'details',
        `quiz-result-row ${
          a.correct
            ? 'is-correct'
            : 'is-review'
        }`
      );

      const topic = QUIZ_SECTIONS.find(
        s => s.id === sectionOf(item)
      );

      const summary = qEl(
        'summary',
        '',
        `${a.correct ? '✓' : '↻'} ` +
        `Question ${i + 1} · ` +
        `${topic?.name || item.outcome}`
      );

      row.append(
        summary,
        qEl('p', '', item.prompt),
        qEl('p', '', a.explanation)
      );

      list.appendChild(row);
    });

    results.appendChild(list);

    const guide = qEl(
      'div',
      'quiz-guidance'
    );

    const weakSections = [
      ...new Set(
        weak.map(a => a.section)
      )
    ];

    guide.append(
      qEl(
        'h3',
        '',
        weak.length
          ? 'Where to review'
          : 'Your next step'
      ),
      qEl(
        'p',
        '',
        weak.length
          ? (
              'Review: ' +
              weakSections.map(id =>
                QUIZ_SECTIONS.find(
                  s => s.id === id
                )?.name || id
              ).join(', ') +
              '. The explanations above show ' +
              'what to revisit.'
            )
          : (
              'You answered every question correctly. ' +
              'Continue to Guided Review to reinforce ' +
              'the concepts.'
            )
      )
    );

    if (confidentWrong) {
      guide.appendChild(
        qEl(
          'p',
          '',
          `${confidentWrong} incorrect answer(s) ` +
          'were marked Certain. Revisit those explanations.'
        )
      );
    }

    results.appendChild(guide);

    const actions = qEl(
      'div',
      'quiz-actions'
    );

    const retry = qButton(
      'Retry with alternate questions →',
      'quiz-button quiz-button--primary'
    );

    retry.addEventListener('click', () => {
      startAttempt(state.attempt + 1);
    });

    const reviewAction = qEl(
      'a',
      'quiz-button',
      'Open Guided Review →'
    );

    reviewAction.href = '#/review';

    actions.append(
      retry,
      reviewAction
    );

    results.appendChild(actions);
  }

  /* ==========================================
     LOAD QUESTION BANK
     ========================================== */

  async function loadBank() {
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

      const bank = await response.json();

      if (
        !Array.isArray(bank.items) ||
        !bank.items.length ||
        !Number.isInteger(bank.passMark)
      ) {
        throw new Error(
          'Invalid quiz bank'
        );
      }

      if (destroyed) return;

      state.bank = bank;
      startAttempt(0);

    } catch (e) {
      if (destroyed) return;

      stage.replaceChildren(
        qEl(
          'h2',
          '',
          'Quiz could not load'
        ),
        qEl(
          'p',
          'quiz-muted',
          'Check /data/quiz-bank.json. ' +
          e.message
        )
      );
    }
  }

  stage.appendChild(
    qEl(
      'p',
      'quiz-muted',
      'Loading questions…'
    )
  );

  loadBank();

  return () => {
    destroyed = true;
  };
}
