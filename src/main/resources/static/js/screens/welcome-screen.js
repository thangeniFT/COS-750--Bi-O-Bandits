/**
 * Welcome screen — Figma Page 1.
 * Uses the existing app.js screen navigation context.
 */

// Change this to match the route your router uses for the practice screen.
const SKIP_ROUTE = '#/practice';

function make(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

/* ---------- Animated tree ---------- */

function createTree() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');

  svg.setAttribute('class', 'welcome-tree');
  svg.setAttribute('viewBox', '0 0 380 260');
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    'Binary search tree with root 50, children 30 and 70, and leaves 20, 40, 60 and 80'
  );

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
    [0, 1], [0, 2],
    [1, 3], [1, 4],
    [2, 5], [2, 6]
  ];

  const STEP = 0.5; // seconds between each node appearing

  function svgNode(tag, attributes = {}) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });
    return element;
  }

  // Branches: each one draws just before its child node appears.
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

    line.style.setProperty('--reveal', `${Math.max(child * STEP - 0.3, 0)}s`);
    svg.appendChild(line);
  });

  // Nodes and their values.
  nodes.forEach((node, index) => {
    const group = svgNode('g', { class: 'welcome-tree__group' });
    group.style.setProperty('--reveal', `${index * STEP}s`);

    const circle = svgNode('circle', {
      cx: node.x,
      cy: node.y,
      r: 25,
      class: 'welcome-tree__node'
    });

    const text = svgNode('text', {
      x: node.x,
      y: node.y,
      class: 'welcome-tree__label'
    });
    text.textContent = String(node.value);

    group.append(circle, text);
    svg.appendChild(group);
  });

  // Time for the whole tree to finish building (last node delay + its fade-in).
  svg.dataset.duration = String((nodes.length - 1) * STEP + 0.4);

  return svg;
}

/**
 * Loops forever: build the tree -> highlight DFS (pre-order) -> fade out -> repeat.
 * Stops by itself if the welcome screen is removed from the page.
 * Skipped when the user prefers reduced motion (the tree then stays static).
 */
function loopTree(svg, orderLabel) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const buildSeconds = Number(svg.dataset.duration) || 4;
  const PAUSE_MS = 700;     // pause between "built" and "DFS starts"
  const DFS_STEP_MS = 850;  // time spent on each visited node
  const HOLD_MS = 1600;     // how long the finished DFS stays visible
  const FADE_MS = 600;      // matches the 0.5s opacity transition

  // Node indices in the order DFS (pre-order) visits them: 50,30,20,40,70,60,80
  const DFS_ORDER = [0, 1, 3, 4, 2, 5, 6];

  const groups = Array.from(svg.querySelectorAll('.welcome-tree__group'));
  const edges = Array.from(svg.querySelectorAll('.welcome-tree__edge'));
  const values = groups.map((g) => g.querySelector('text').textContent);

  function clearHighlights() {
    groups.forEach((g) => g.classList.remove('is-visited', 'is-current'));
    edges.forEach((e) => e.classList.remove('is-visited'));
  }

  function setLabel(text) {
    if (orderLabel) orderLabel.textContent = text;
  }

  function later(ms, fn) {
    setTimeout(() => {
      if (svg.isConnected) fn(); // screen was left, stop looping
    }, ms);
  }

  function visit(step, visitedValues) {
    if (step >= DFS_ORDER.length) {
      // Finished: hold, fade out, then rebuild.
      later(HOLD_MS, () => {
        svg.classList.add('is-fading');
        later(FADE_MS, restart);
      });
      return;
    }

    const index = DFS_ORDER[step];

    groups.forEach((g) => g.classList.remove('is-current'));
    groups[index].classList.add('is-visited', 'is-current');

    // Light up the branch we just walked down.
    const edge = edges.find((e) => Number(e.dataset.child) === index);
    if (edge) edge.classList.add('is-visited');

    visitedValues.push(values[index]);
    setLabel('DFS visits: ' + visitedValues.join(' \u2192 '));

    later(DFS_STEP_MS, () => visit(step + 1, visitedValues));
  }

  function restart() {
    svg.classList.remove('is-playing');
    clearHighlights();
    void svg.getBoundingClientRect(); // force reflow so animations restart
    cycle();
  }

  function cycle() {
    svg.classList.remove('is-fading');
    svg.classList.add('is-playing');
    setLabel('Building the tree\u2026');

    // 1) wait for the build to finish, 2) pause, 3) start DFS.
    later(buildSeconds * 1000 + PAUSE_MS, () => visit(0, []));
  }

  // Wait a tick so the svg has been added to the page before starting.
  setTimeout(() => {
    if (svg.isConnected) cycle();
  }, 0);
}

/* ---------- Small building blocks ---------- */

function makeChips() {
  const list = make('ul', 'welcome-chips');
  ['About 30 minutes', 'No prior knowledge needed', 'Not graded'].forEach((label) => {
    list.appendChild(make('li', 'welcome-chip', label));
  });
  return list;
}

function makeNote() {
  const note = make('p', 'welcome-note');
  const icon = make('span', 'welcome-note__icon', 'i');
  icon.setAttribute('aria-hidden', 'true');

  note.append(
    icon,
    document.createTextNode(
      'Not marked. Nothing you do here is recorded, so use it to find out what you already know.'
    )
  );
  return note;
}

function makeOutcomes() {
  const section = make('section', 'welcome-outcomes');
  section.appendChild(make('h2', '', 'By the end you will be able to'));

  const list = make('ul', 'welcome-outcomes__list');
  [
    'Identify the root, parent, child and leaf nodes of a binary search tree',
    'Trace a depth-first search by hand, step by step',
    'Predict the order in which DFS visits the nodes'
  ].forEach((text) => list.appendChild(make('li', '', text)));

  section.appendChild(list);
  return section;
}

function makeJourney() {
  const section = make('section', 'welcome-objectives');

  section.append(
    make('span', 'section-eyebrow', 'YOUR LEARNING JOURNEY'),
    make('h2', '', 'Four steps, at your own pace')
  );

  const grid = make('div', 'welcome-objectives__grid');

  const cards = [
    {
      number: '01',
      title: 'Learn',
      time: '~8 min',
      description:
        'Discover roots, parents, children, leaves and how a binary search tree organises values.'
    },
    {
      number: '02',
      title: 'Explorer',
      time: '~10 min',
      description:
        'Watch DFS visit a tree step by step, using a stack and backtracking.'
    },
    {
      number: '03',
      title: 'Practice',
      time: '~8 min',
      description: 'Try guided activities with hints and instant feedback.'
    },
    {
      number: '04',
      title: 'Quiz',
      time: '~5 min',
      description:
        'Check what you know. Your result points you to anything worth revisiting.'
    }
  ];

  cards.forEach((item) => {
    const card = make('article', 'welcome-card');
    card.append(
      make('span', 'welcome-card__number', item.number),
      make('h3', '', item.title),
      make('p', '', item.description),
      make('span', 'welcome-card__time', item.time)
    );
    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

/* ---------- Screen entry point ---------- */

export function render(screen, container, ctx) {
  const page = make('div', 'welcome-page');

  // Hero: text side
  const hero = make('section', 'welcome-hero');
  const content = make('div', 'welcome-hero__content');

  content.append(
    make('span', 'welcome-eyebrow', 'COS212 LEARNING COMPANION'),
    make('h1', 'welcome-title', 'Learn trees. Understand DFS.'),
    make(
      'p',
      'welcome-description',
      'Learn Binary Search Trees and Depth-First Search through simple ' +
        'explanations, animated examples and hands-on practice.'
    ),
    makeChips()
  );

  const actions = make('div', 'welcome-actions');

  const startButton = make('button', 'btn btn--primary welcome-start', 'Start Learning');
  startButton.type = 'button';
  startButton.addEventListener('click', ctx.goNext);

  const skipButton = make('a', 'btn btn--outline welcome-explore', 'Skip to practice');
  skipButton.href = SKIP_ROUTE;

  actions.append(startButton, skipButton);
  content.append(actions, makeNote());

  // Hero: animated tree
  const visual = make('div', 'welcome-hero__illustration');
  const tree = createTree();
  const dfsOrder = make('p', 'welcome-dfs-order');
  dfsOrder.setAttribute('aria-hidden', 'true'); // decorative; the note below explains DFS in words

  visual.append(
    make('div', 'welcome-visual-heading', 'BINARY SEARCH TREE'),
    tree,
    dfsOrder,
    make(
      'p',
      'welcome-visual-note',
      'A tree is connected nodes. DFS explores as far down one branch as it can before backing up.'
    )
  );

  hero.append(content, visual);

  page.append(hero, makeOutcomes(), makeJourney());
  container.appendChild(page);

  loopTree(tree, dfsOrder);
}