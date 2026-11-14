
/**
 * COS212 DFS Tutor — Learning Summary
 * Final page: concise recap, example, optional quiz score.
 * Plain JavaScript, no backend or progress bar.
 */

const SUMMARY_KEY = 'cos212-dfs-quiz-result';
const SVG_NS = 'http://www.w3.org/2000/svg';

const KEY_IDEAS = [
  {
    number: '01',
    title: 'Binary Search Trees',
    text:
      'Each node has at most two children. In a BST ' +
      'with unique keys, every value in the left subtree ' +
      'is smaller and every value in the right subtree ' +
      'is larger.'
  },
  {
    number: '02',
    title: 'Depth-First Search',
    text:
      'DFS explores a branch deeply before returning ' +
      'to another waiting branch. Reaching a leaf ' +
      'does not necessarily end the traversal.'
  },
  {
    number: '03',
    title: 'The Stack (LIFO)',
    text:
      'A stack removes the last item added first. ' +
      'For iterative left-first pre-order DFS, ' +
      'push the right child before the left child.'
  },
  {
    number: '04',
    title: 'Traversal Orders',
    text:
      'Pre-order visits the root first; in-order ' +
      'visits it between subtrees; post-order visits ' +
      'it last. In-order gives sorted values ' +
      'for a valid BST.'
  },
  {
    number: '05',
    title: 'DFS vs BST Lookup',
    text:
      'DFS follows a traversal order. BST lookup ' +
      'compares values to decide whether to move ' +
      'left or right; they are different ways ' +
      'of searching.'
  }
];

const TRAVERSALS = [
  {
    name: 'Pre-order',
    rule: 'Root → Left → Right',
    values: [50, 30, 20, 40, 70, 60, 80]
  },
  {
    name: 'In-order',
    rule: 'Left → Root → Right',
    values: [20, 30, 40, 50, 60, 70, 80]
  },
  {
    name: 'Post-order',
    rule: 'Left → Right → Root',
    values: [20, 40, 30, 60, 80, 70, 50]
  }
];

/* ==========================================
   DOM HELPERS
   ========================================== */

function el(tag, className = '', text = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;
}

function svgEl(tag, attrs = {}) {
  const element = document.createElementNS(
    SVG_NS,
    tag
  );

  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, String(value));
  }

  return element;
}

function link(
  text,
  href,
  className = 'summary-button'
) {
  const a = el('a', className, text);
  a.href = href;
  return a;
}

/* ==========================================
   READ QUIZ RESULTS
   ========================================== */

function getQuizResult() {
  try {
    const saved = JSON.parse(
      sessionStorage.getItem(SUMMARY_KEY) || 'null'
    );

    if (
      !saved ||
      !Array.isArray(saved.answers)
    ) {
      return null;
    }

    const answers = saved.answers.filter(
      answer =>
        answer &&
        typeof answer.correct === 'boolean'
    );

    if (answers.length === 0) {
      return null;
    }

    return {
      correct: answers.filter(
        answer => answer.correct
      ).length,

      total: answers.length,

      passMark:
        Number.isInteger(saved.passMark) &&
        saved.passMark >= 0
          ? saved.passMark
          : Math.ceil(answers.length * 0.75)
    };

  } catch {
    return null;
  }
}

/* ==========================================
   DRAW THE EXAMPLE BST
   ========================================== */

function makeTree() {
  const nodes = [
    [50, 270, 35],
    [30, 140, 110],
    [70, 400, 110],
    [20, 75, 210],
    [40, 205, 210],
    [60, 335, 210],
    [80, 465, 210]
  ];

  const edges = [
    [50, 30],
    [50, 70],
    [30, 20],
    [30, 40],
    [70, 60],
    [70, 80]
  ];

  const positions = new Map(
    nodes.map(([v, x, y]) => [
      v,
      { x, y }
    ])
  );

  const svg = svgEl('svg', {
    viewBox: '0 0 540 255',
    role: 'img',
    'aria-label':
      'Binary search tree with root 50. ' +
      'Children are 30 and 70, and leaves ' +
      'are 20, 40, 60 and 80.'
  });

  // Draw connections first.
  for (const [parent, child] of edges) {
    const from = positions.get(parent);
    const to = positions.get(child);

    svg.appendChild(
      svgEl('line', {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        class: 'summary-tree-edge'
      })
    );
  }

  // Draw nodes.
  for (const [value, x, y] of nodes) {
    const circle = svgEl('circle', {
      cx: x,
      cy: y,
      r: 24,
      class:
        value === 50
          ? 'summary-tree-root'
          : 'summary-tree-node'
    });

    const text = svgEl('text', {
      x,
      y: y + 5,
      class:
        value === 50
          ? 'summary-tree-label is-root'
          : 'summary-tree-label'
    });

    text.textContent = String(value);

    svg.append(
      circle,
      text
    );
  }

  return svg;
}

/* ==========================================
   MAIN SUMMARY PAGE
   ========================================== */

export function render(screen, container) {
  const page = el('main', 'summary-page');

  // ==========================================
  // 1. INTRODUCTION
  // ==========================================

  const intro = el(
    'header',
    'summary-intro'
  );

  intro.append(
    el(
      'span',
      'summary-eyebrow'
      
    ),

    el(
      'h1',
      '',
      'Learning Summary'
    ),

    el(
      'p',
      'summary-muted',
      'You have explored BSTs and Depth-First Search. ' +
      'Here are the main ideas to remember and ' +
      'where to go next.'
    )
  );

  // ==========================================
  // 2. WHAT YOU LEARNED
  // ==========================================

  const concepts = el(
    'section',
    'summary-card'
  );

  concepts.append(
    el(
      'h2',
      '',
      'What you learned'
    ),

    el(
      'p',
      'summary-muted',
      'Five takeaways from BST Basics, DFS Introduction, ' +
      'Explorer and Practice.'
    )
  );

  const conceptGrid = el(
    'div',
    'summary-key-grid'
  );

  KEY_IDEAS.forEach(idea => {
    const item = el(
      'article',
      'summary-key-item'
    );

    const heading = el(
      'div',
      'summary-key-heading'
    );

    heading.append(
      el(
        'span',
        'summary-key-number',
        idea.number
      ),

      el(
        'h3',
        '',
        idea.title
      )
    );

    item.append(
      heading,
      el('p', '', idea.text)
    );

    conceptGrid.appendChild(item);
  });

  concepts.appendChild(conceptGrid);

  // ==========================================
  // 3. ONE TREE, THREE TRAVERSALS
  // ==========================================

  const example = el(
    'section',
    'summary-card'
  );

  example.append(
    el(
      'h2',
      '',
      'One tree, three traversal orders'
    ),

    el(
      'p',
      'summary-muted',
      'Use this familiar BST to compare ' +
      'the sequences.'
    )
  );

  const comparison = el(
    'div',
    'summary-comparison'
  );

  const treeFrame = el(
    'div',
    'summary-tree-frame'
  );

  treeFrame.append(
    makeTree(),

    el(
      'p',
      'summary-tree-caption',
      'Example BST'
    )
  );

  const orderList = el(
    'div',
    'summary-orders'
  );

  TRAVERSALS.forEach(order => {
    const row = el(
      'div',
      'summary-order-row'
    );

    row.append(
      el(
        'strong',
        '',
        order.name
      ),

      el(
        'span',
        'summary-order-rule',
        order.rule
      ),

      el(
        'p',
        'summary-order-sequence',
        order.values.join(' → ')
      )
    );

    orderList.appendChild(row);
  });

  comparison.append(
    treeFrame,
    orderList
  );

  example.appendChild(comparison);

  // ==========================================
  // 4. IMPORTANT TAKEAWAY
  // ==========================================

  const takeaway = el(
    'aside',
    'summary-callout'
  );

  takeaway.append(
    el(
      'strong',
      '',
      'Remember'
    ),

    el(
      'p',
      '',
      'BST ordering tells you where a value belongs. ' +
      'DFS tells you how to explore nodes. ' +
      'The stack remembers which nodes are waiting.'
    )
  );

  // ==========================================
  // 5. OPTIONAL QUIZ RESULT
  // ==========================================

  const scoreSection = el(
    'section',
    'summary-card summary-quiz'
  );

  scoreSection.append(
    el(
      'h2',
      '',
      'Your latest quiz result'
    )
  );

  const result = getQuizResult();

  if (result) {
    const info = el(
      'div',
      'summary-quiz-line'
    );

    info.append(
      el(
        'strong',
        'summary-quiz-score',
        `${result.correct} / ${result.total}`
      ),

      el(
        'p',
        'summary-muted',
        result.correct >= result.passMark
          ? (
              'You met the readiness guideline ' +
              `(${result.passMark}/${result.total}).`
            )
          : (
              'You can revisit your feedback and ' +
              'try again. The guideline is ' +
              `${result.passMark}/${result.total}.`
            )
      )
    );

    scoreSection.appendChild(info);

  } else {
    scoreSection.append(
      el(
        'p',
        'summary-muted',
        'No quiz result is saved in this browser tab. ' +
        'You can still finish the lesson or take the quiz.'
      )
    );
  }

  scoreSection.append(
    link(
      'View quiz feedback →',
      '#/review',
      'summary-text-link'
    )
  );

  // ==========================================
  // 6. WHAT NEXT?
  // ==========================================

  const next = el(
    'section',
    'summary-card summary-next'
  );

  next.append(
    el(
      'h2',
      '',
      'What would you like to do next?'
    ),

    el(
      'p',
      'summary-muted',
      'You can revisit any lesson whenever ' +
      'you need practice.'
    )
  );

  const actions = el(
    'div',
    'summary-actions'
  );

  actions.append(
    link(
      'Explore DFS again',
      '#/worked-example'
    ),

    link(
      'Practise again',
      '#/practice'
    ),

    link(
      'Retake quiz',
      '#/quiz'
    )
  );

  next.appendChild(actions);

  // ==========================================
  // 7. FINAL NAVIGATION
  // ==========================================

  const navigation = el(
    'nav',
    'summary-navigation'
  );

  navigation.setAttribute(
    'aria-label',
    'Summary navigation'
  );

  navigation.append(
    link(
      '← Guided Review',
      '#/review'
    ),

    link(
      'Back to Welcome →',
      '#/hook',
      'summary-button summary-button--primary'
    )
  );

  // ==========================================
  // RENDER PAGE
  // ==========================================

  page.append(
    intro,
    concepts,
    example,
    takeaway,
    scoreSection,
    next,
    navigation
  );

  container.replaceChildren(page);

  return () => {};
}
