
/**
 * COS212 Learning Companion — Welcome Page
 *
 * Plain JavaScript.
 * No Spring Boot or backend.
 *
 * Includes:
 * - Animated BST and DFS traversal
 * - Learning outcomes
 * - Six-stage learning journey
 * - Approximate total time: 65–90 minutes
 * - Navigation using existing hash routes
 */

const SKIP_ROUTE = '#/practice';
const SVG_NS = 'http://www.w3.org/2000/svg';

/* ==========================================
   ELEMENT HELPERS
   ========================================== */

function make(tag, className = '', text = '') {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  element.textContent = text;
  return element;
}

function svgNode(tag, attributes = {}) {
  const element = document.createElementNS(
    SVG_NS,
    tag
  );

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, String(value));
  });

  return element;
}

/* ==========================================
   ANIMATED BINARY SEARCH TREE
   ========================================== */

function createTree() {
  const svg = svgNode('svg', {
    class: 'welcome-tree',
    viewBox: '0 0 380 260',
    role: 'img',
    'aria-label':
      'Binary search tree. Root 50, children 30 and 70, ' +
      'and leaves 20, 40, 60 and 80.'
  });

  const nodes = [
    { value: 50, x: 190, y: 46 },
    { value: 30, x: 105, y: 127 },
    { value: 70, x: 275, y: 127 },
    { value: 20, x: 49, y: 218 },
    { value: 40, x: 151, y: 218 },
    { value: 60, x: 229, y: 218 },
    { value: 80, x: 331, y: 218 }
  ];

  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 5],
    [2, 6]
  ];

  const STEP = 0.5;

  // Draw edges first.
  edges.forEach(([parent, child]) => {
    const line = svgNode('line', {
      x1: nodes[parent].x,
      y1: nodes[parent].y,
      x2: nodes[child].x,
      y2: nodes[child].y,
      pathLength: 1,
      'data-child': child,
      class: 'welcome-tree__edge'
    });

    line.style.setProperty(
      '--reveal',
      `${Math.max(child * STEP - 0.3, 0)}s`
    );

    svg.appendChild(line);
  });

  // Create animated nodes.
  nodes.forEach((node, index) => {
    const group = svgNode('g', {
      class: 'welcome-tree__group'
    });

    group.style.setProperty(
      '--reveal',
      `${index * STEP}s`
    );

    const circle = svgNode('circle', {
      cx: node.x,
      cy: node.y,
      r: 25,
      class: 'welcome-tree__node'
    });

    const label = svgNode('text', {
      x: node.x,
      y: node.y,
      class: 'welcome-tree__label'
    });

    label.textContent = String(node.value);

    group.append(circle, label);
    svg.appendChild(group);
  });

  svg.dataset.duration = String(
    (nodes.length - 1) * STEP + 0.4
  );

  return svg;
}

/* ==========================================
   AUTOMATIC DFS ANIMATION
   ========================================== */

function animateTree(svg, orderLabel) {
  const reducedMotion =
    window.matchMedia &&
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

  const groups = [
    ...svg.querySelectorAll('.welcome-tree__group')
  ];

  const edges = [
    ...svg.querySelectorAll('.welcome-tree__edge')
  ];

  const values = groups.map(
    group => group.querySelector('text').textContent
  );

  // Pre-order: Root -> Left -> Right.
  const visitOrder = [0, 1, 3, 4, 2, 5, 6];

  const buildMs =
    (Number(svg.dataset.duration) || 4) * 1000;

  const PAUSE_MS = 700;
  const STEP_MS = 850;
  const HOLD_MS = 1600;
  const FADE_MS = 600;

  const timers = new Set();
  let stopped = false;

  function schedule(delay, callback) {
    const timer = window.setTimeout(() => {
      timers.delete(timer);

      if (!stopped && svg.isConnected) {
        callback();
      }
    }, delay);

    timers.add(timer);
  }

  function setLabel(text) {
    orderLabel.textContent = text;
  }

  function clearHighlights() {
    groups.forEach(group => {
      group.classList.remove(
        'is-current',
        'is-visited'
      );
    });

    edges.forEach(edge => {
      edge.classList.remove('is-visited');
    });
  }

  function visit(step, visitedValues) {
    if (step >= visitOrder.length) {
      setLabel(
        'Pre-order DFS: ' +
        visitedValues.join(' → ')
      );

      schedule(HOLD_MS, () => {
        svg.classList.add('is-fading');

        schedule(FADE_MS, restart);
      });

      return;
    }

    const index = visitOrder[step];

    groups.forEach(group => {
      group.classList.remove('is-current');
    });

    groups[index].classList.add(
      'is-current',
      'is-visited'
    );

    const edge = edges.find(
      item => Number(item.dataset.child) === index
    );

    if (edge) {
      edge.classList.add('is-visited');
    }

    visitedValues.push(values[index]);

    setLabel(
      'DFS visits: ' +
      visitedValues.join(' → ')
    );

    schedule(STEP_MS, () => {
      visit(step + 1, visitedValues);
    });
  }

  function cycle() {
    svg.classList.remove('is-fading');
    svg.classList.add('is-playing');

    setLabel('Building the tree…');

    schedule(buildMs + PAUSE_MS, () => {
      visit(0, []);
    });
  }

  function restart() {
    svg.classList.remove('is-playing');

    clearHighlights();

    // Restart the CSS build animation.
    void svg.getBoundingClientRect();

    cycle();
  }

  if (reducedMotion) {
    svg.classList.add('is-static');

    setLabel(
      'Pre-order: 50 → 30 → 20 → 40 → 70 → 60 → 80'
    );
  } else {
    schedule(0, cycle);
  }

  // Cleanup when the user leaves this screen.
  return () => {
    stopped = true;

    timers.forEach(timer => {
      window.clearTimeout(timer);
    });

    timers.clear();
  };
}

/* ==========================================
   LEARNING INFORMATION CHIPS
   ========================================== */

function makeChips() {
  const list = make('ul', 'welcome-chips');

  const chips = [
    'About 65–90 minutes',
    'Beginner-friendly',
    'Self-paced',
    'Not formally graded'
  ];

  chips.forEach(label => {
    list.appendChild(
      make('li', 'welcome-chip', label)
    );
  });

  return list;
}

/* ==========================================
   IMPORTANT INFORMATION NOTE
   ========================================== */

function makeNote() {
  const note = make('p', 'welcome-note');

  const icon = make(
    'span',
    'welcome-note__icon',
    'i'
  );

  icon.setAttribute('aria-hidden', 'true');

  note.append(
    icon,
    document.createTextNode(
      'Learn at your own pace. Activities are not ' +
      'formally graded. Your quiz results are saved ' +
      'temporarily in this browser tab so you can ' +
      'review your answers.'
    )
  );

  return note;
}

/* ==========================================
   LEARNING OUTCOMES
   ========================================== */

function makeOutcomes() {
  const section = make(
    'section',
    'welcome-outcomes'
  );

  section.appendChild(
    make(
      'h2',
      '',
      'By the end, you will be able to'
    )
  );

  const list = make(
    'ul',
    'welcome-outcomes__list'
  );

  const outcomes = [
    'Identify roots, parents, children and leaves in a binary search tree.',

    'Apply BST ordering rules to insert values and identify incorrect placements.',

    'Trace Depth-First Search using a stack and explain backtracking.',

    'Distinguish between Pre-order, In-order and Post-order traversals.',

    'Apply BST and DFS concepts to unfamiliar trees and review your quiz feedback.'
  ];

  outcomes.forEach(text => {
    list.appendChild(
      make('li', '', text)
    );
  });

  section.appendChild(list);

  return section;
}

/* ==========================================
   SIX-STAGE LEARNING JOURNEY
   ========================================== */

function makeJourney() {
  const section = make(
    'section',
    'welcome-objectives'
  );

  section.append(
    make(
      'span',
      'section-eyebrow',
      'YOUR LEARNING JOURNEY'
    ),

    make(
      'h2',
      '',
      'Six stages, at your own pace'
    ),

    make(
      'p',
      'welcome-journey-description',
      'Learn the concepts, explore different trees, ' +
      'practise your skills, test your understanding ' +
      'and finish with a summary.'
    )
  );

  const grid = make(
    'div',
    'welcome-objectives__grid'
  );

  const cards = [
    {
      number: '01',
      title: 'Learn',
      time: '15–20 min',
      description:
        'Learn BST nodes and insertion, DFS, ' +
        'the LIFO stack, backtracking and ' +
        'the three traversal orders.'
    },
    {
      number: '02',
      title: 'Explorer',
      time: '15–20 min',
      description:
        'Build a BST, run different traversals ' +
        'and click nodes in the correct order ' +
        'on a new tree.'
    },
    {
      number: '03',
      title: 'Practice',
      time: '15–20 min',
      description:
        'Repair invalid BSTs, trace DFS to ' +
        'find targets and solve traversal ' +
        'problems with new values.'
    },
    {
      number: '04',
      title: 'Quiz',
      time: '10–15 min',
      description:
        'Answer eight questions about BST ' +
        'rules, stack behaviour, searching ' +
        'and traversal sequences.'
    },
    {
      number: '05',
      title: 'Guided Review',
      time: '5–10 min',
      description:
        'See your quiz score, review incorrect ' +
        'answers and revisit concepts that ' +
        'need attention.'
    },
    {
      number: '06',
      title: 'Learning Summary',
      time: 'About 5 min',
      description:
        'Review the key ideas, compare traversal ' +
        'orders and choose what you want to ' +
        'revisit next.'
    }
  ];

  cards.forEach(item => {
    const card = make(
      'article',
      'welcome-card'
    );

    card.append(
      make(
        'span',
        'welcome-card__number',
        item.number
      ),
      make('h3', '', item.title),
      make('p', '', item.description),
      make(
        'span',
        'welcome-card__time',
        item.time
      )
    );

    grid.appendChild(card);
  });

  section.appendChild(grid);

  return section;
}

/* ==========================================
   MAIN WELCOME SCREEN
   ========================================== */

export function render(screen, container, ctx) {
  const page = make(
    'div',
    'welcome-page'
  );

  // ------------------------------------------
  // HERO TEXT
  // ------------------------------------------

  const hero = make(
    'section',
    'welcome-hero'
  );

  const content = make(
    'div',
    'welcome-hero__content'
  );

  content.append(
    make(
      'span',
      'welcome-eyebrow',
      'COS212 LEARNING COMPANION'
    ),

    make(
      'h1',
      'welcome-title',
      'Learn trees. Understand DFS.'
    ),

    make(
      'p',
      'welcome-description',
      'Understand Binary Search Trees and ' +
      'Depth-First Search through visual lessons, ' +
      'interactive exploration, hands-on practice ' +
      'and personalised quiz feedback.'
    ),

    makeChips()
  );

 
/* ==========================================
   HERO BUTTONS
   ========================================== */

const actions = make('div', 'welcome-actions');

// Primary button
const startButton = make(
  'button',
  'btn btn--primary welcome-start',
  'Start Learning'
);

startButton.type = 'button';

startButton.addEventListener('click', () => {
  if (typeof ctx?.goNext === 'function') {
    ctx.goNext();
  } else {
    window.location.hash = '#/concept-bst';
  }
});

// Practice button and explanation
const practiceOption = make(
  'div',
  'welcome-practice-option'
);

const practiceButton = make(
  'a',
  'btn btn--outline welcome-explore',
  'Go to Practice'
);

practiceButton.href = '#/practice';

const practiceText = make(
  'span',
  'welcome-practice-text',
  'Already know BSTs and DFS?'
);

// Text is BELOW the button
practiceOption.append(
  practiceButton,
  practiceText
);

actions.append(
  startButton,
  practiceOption
);

content.append(
  actions,
  makeNote()
);


  // ------------------------------------------
  // ANIMATED TREE
  // ------------------------------------------

  const visual = make(
    'div',
    'welcome-hero__illustration'
  );

  const tree = createTree();

  const dfsOrder = make(
    'p',
    'welcome-dfs-order'
  );

  dfsOrder.setAttribute(
    'aria-hidden',
    'true'
  );

  visual.append(
    make(
      'div',
      'welcome-visual-heading',
      'BINARY SEARCH TREE'
    ),

    tree,

    dfsOrder,

    make(
      'p',
      'welcome-visual-note',
      'DFS explores one branch deeply before ' +
      'returning to the next waiting branch.'
    )
  );

  hero.append(
    content,
    visual
  );

  // ------------------------------------------
  // BUILD THE PAGE
  // ------------------------------------------

  page.append(
    hero,
    makeOutcomes(),
    makeJourney()
  );

  container.appendChild(page);

  // Start animation after the page is mounted.
  const stopAnimation = animateTree(
    tree,
    dfsOrder
  );

  // Used by your existing app.js router.
  return () => {
    stopAnimation();
  };
}
