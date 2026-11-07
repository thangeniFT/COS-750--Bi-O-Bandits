
/**
 * Welcome screen — Figma Page 1.
 * Uses the existing app.js screen navigation context.
 */

function make(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  return element;
}

function createTree() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');

  svg.setAttribute('viewBox', '0 0 380 260');
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    'Animated binary search tree with root 50, children 30 and 70, and leaves 20, 40, 60 and 80'
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

  function svgNode(tag, attributes = {}) {
    const element = document.createElementNS(ns, tag);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });

    return element;
  }

  // Draw each branch, timed with its child node.
  edges.forEach(([parent, child]) => {
    const line = svgNode('line', {
      x1: nodes[parent].x,
      y1: nodes[parent].y,
      x2: nodes[child].x,
      y2: nodes[child].y,
      class: 'welcome-tree__edge'
    });

    line.style.setProperty('--reveal', `${child * 0.55}s`);
    svg.appendChild(line);
  });

  // Draw the nodes and their values.
  nodes.forEach((node, index) => {
    const group = svgNode('g', {
      class: 'welcome-tree__group'
    });

    group.style.setProperty('--reveal', `${index * 0.55}s`);

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

  return svg;
}

export function render(screen, container, ctx) {
  const page = make('div', 'welcome-page');

  // Hero section
  const hero = make('section', 'welcome-hero');
  const content = make('div', 'welcome-hero__content');

  content.append(
    make('span', 'welcome-eyebrow', 'COS212 LEARNING COMPANION'),
    make('h1', 'welcome-title', 'Learn trees. Understand DFS.'),
    make(
      'p',
      'welcome-description',
      'Learn Binary Search Trees and Depth-First Search ' +
      'through simple explanations, animated examples ' +
      'and hands-on practice.'
    )
  );

  const actions = make('div', 'welcome-actions');

  const startButton = make(
    'button',
    'btn btn--primary welcome-start',
    'Start Learning'
  );

  startButton.type = 'button';
  startButton.addEventListener('click', ctx.goNext);

  const exploreButton = make(
    'a',
    'btn btn--outline welcome-explore',
    'Explore DFS'
  );

  exploreButton.href = '#/worked-example';

  actions.append(startButton, exploreButton);
  content.appendChild(actions);

  // Animated tree preview
  const visual = make('div', 'welcome-hero__illustration');

  const visualHeading = make(
    'div',
    'welcome-visual-heading',
    'BINARY SEARCH TREE'
  );

  visual.append(visualHeading, createTree());

  const visualNote = make(
    'p',
    'welcome-visual-note',
    'A simple tree made of connected nodes'
  );

  visual.appendChild(visualNote);
  hero.append(content, visual);

  // Learning objective cards
  const objectives = make('section', 'welcome-objectives');

  objectives.append(
    make('span', 'section-eyebrow', 'YOUR LEARNING JOURNEY'),
    make('h2', '', "What you'll learn")
  );

  const grid = make('div', 'welcome-objectives__grid');

  const cards = [
    {
      number: '01',
      title: 'Binary Search Trees',
      description:
        'Discover roots, parents, children, leaves and how values are organised.'
    },
    {
      number: '02',
      title: 'Depth-First Search',
      description:
        'Watch DFS explore a tree step by step using a stack and backtracking.'
    },
    {
      number: '03',
      title: 'Practise & Assess',
      description:
        'Try guided activities, test your knowledge and receive helpful feedback.'
    }
  ];

  cards.forEach((item) => {
    const card = make('article', 'welcome-card');

    card.append(
      make('span', 'welcome-card__number', item.number),
      make('h3', '', item.title),
      make('p', '', item.description)
    );

    grid.appendChild(card);
  });

  objectives.appendChild(grid);
  page.append(hero, objectives);
  container.appendChild(page);
}
