/**
 * Draws a binary search tree as SVG and lets other components colour its nodes.
 *
 * Layout rule: a node's column is its position in sorted order and its row is its depth. For a
 * BST this guarantees that left children are drawn to the left, right children to the right, and
 * nodes never overlap, without any clever spacing code.
 *
 * Node states (ID document, figure 4) are set with a `data-state` attribute; css/styles.css
 * decides how each state looks, so visual changes never need JavaScript changes.
 *
 * Status: implemented (basic). Backlog ticket F-01 adds the legend, better scaling for skewed
 * 15-node trees, and screen-reader descriptions of state changes.
 * @module components/tree-view
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/** The allowed node states. Anything else is a programming error. */
export const NODE_STATES = Object.freeze(['unvisited', 'current', 'visited', 'on-stack', 'found']);

/** Drawing constants, in SVG units. */
const RADIUS = 20;
const COLUMN_GAP = 52;
const ROW_GAP = 70;
const MARGIN = 24;

/**
 * @typedef {object} PlacedNode
 * @property {number} value
 * @property {number} depth - 0 for the root
 * @property {number|null} parent - parent's value, null for the root
 * @property {number} x - centre, in SVG units
 * @property {number} y - centre, in SVG units
 */

/**
 * Works out where each node goes. Pure function: no DOM, so it is unit-tested in Node.
 *
 * Note: this walks the tree in sorted order to place nodes. That is layout only. The DFS steps the
 * student sees must always come from the server (NFR-03), never from code like this.
 *
 * @param {import('../api.js').NodeView|null} root - the tree's root, or null for an empty tree
 * @returns {{nodes: PlacedNode[], width: number, height: number}} placed nodes in sorted order and
 *          the size of the drawing
 */
export function layoutTree(root) {
  /** @type {PlacedNode[]} */
  const nodes = [];
  let column = 0;
  let maxDepth = 0;

  const place = (node, depth, parent) => {
    if (!node) return;
    place(node.left, depth + 1, node.value);
    nodes.push({
      value: node.value,
      depth,
      parent,
      x: MARGIN + RADIUS + column * COLUMN_GAP,
      y: MARGIN + RADIUS + depth * ROW_GAP,
    });
    column += 1;
    maxDepth = Math.max(maxDepth, depth);
    place(node.right, depth + 1, node.value);
  };
  place(root, 0, null);

  if (nodes.length === 0) {
    return { nodes, width: 240, height: 80 };
  }
  return {
    nodes,
    width: 2 * (MARGIN + RADIUS) + (nodes.length - 1) * COLUMN_GAP,
    height: 2 * (MARGIN + RADIUS) + maxDepth * ROW_GAP,
  };
}

/**
 * Creates an SVG element with attributes.
 *
 * @param {string} tag
 * @param {Record<string, string|number>} attributes
 * @returns {SVGElement}
 */
function svgEl(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

/**
 * @typedef {object} TreeViewHandle
 * @property {number[]} values - every value in the drawing, in sorted order
 * @property {(value: number, state: string) => void} setState - sets one node's state
 * @property {(states: Map<number, string>) => void} setStates - sets every node at once; nodes not
 *           in the map become 'unvisited'
 * @property {() => void} resetStates - makes every node 'unvisited'
 * @property {(value: number) => SVGGElement|undefined} nodeElement - the <g> for a value, for click
 *           handlers in predict mode and tree-click quiz questions
 */

/**
 * Draws a tree into an <svg> element, replacing whatever was there.
 *
 * @param {SVGSVGElement} svg - the target element
 * @param {import('../api.js').TreeView} treeView - the tree from the API
 * @returns {TreeViewHandle} functions to change node states afterwards
 */
export function renderTree(svg, treeView) {
  const { nodes, width, height } = layoutTree(treeView.root);
  const byValue = new Map(nodes.map((node) => [node.value, node]));
  /** @type {Map<number, SVGGElement>} */
  const groups = new Map();

  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', nodes.length === 0
    ? 'An empty tree'
    : `A binary search tree with ${nodes.length} nodes. The root is ${treeView.root.value}.`);

  if (nodes.length === 0) {
    const text = svgEl('text', { x: width / 2, y: height / 2, class: 'tree-empty' });
    text.textContent = 'The tree is empty.';
    svg.append(text);
  }

  // Edges first, so the circles are drawn on top of the lines.
  for (const node of nodes) {
    if (node.parent === null) continue;
    const parent = byValue.get(node.parent);
    svg.append(svgEl('line', { class: 'tree-edge', x1: parent.x, y1: parent.y, x2: node.x, y2: node.y }));
  }

  for (const node of nodes) {
    const group = svgEl('g', { class: 'tree-node', 'data-value': node.value, 'data-state': 'unvisited' });
    const title = svgEl('title');
    title.textContent = `${node.value}, not yet visited`;
    const value = svgEl('text', { class: 'tree-node__value', x: node.x, y: node.y });
    value.textContent = String(node.value);
    const markX = node.x + RADIUS * 0.75;
    const markY = node.y - RADIUS * 0.75;
    const mark = svgEl('text', { class: 'tree-node__mark', x: markX, y: markY });
    mark.textContent = '✓';
    group.append(
      title,
      svgEl('circle', { cx: node.x, cy: node.y, r: RADIUS }),
      value,
      svgEl('circle', { class: 'tree-node__mark-bg', cx: markX, cy: markY, r: 7 }),
      mark,
    );
    svg.append(group);
    groups.set(node.value, group);
  }

  const describe = {
    unvisited: 'not yet visited',
    current: 'current node',
    visited: 'visited',
    'on-stack': 'waiting on the stack',
    found: 'found',
  };

  const setState = (nodeValue, state) => {
    if (!NODE_STATES.includes(state)) {
      throw new Error(`Unknown node state "${state}". Use one of: ${NODE_STATES.join(', ')}`);
    }
    const group = groups.get(nodeValue);
    if (!group) return;
    group.dataset.state = state;
    group.querySelector('title').textContent = `${nodeValue}, ${describe[state]}`;
  };

  return {
    values: nodes.map((node) => node.value),
    setState,
    setStates(states) {
      for (const nodeValue of groups.keys()) {
        setState(nodeValue, states.get(nodeValue) ?? 'unvisited');
      }
    },
    resetStates() {
      for (const nodeValue of groups.keys()) setState(nodeValue, 'unvisited');
    },
    nodeElement: (nodeValue) => groups.get(nodeValue),
  };
}
