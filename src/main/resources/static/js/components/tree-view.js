/**
 * Draws a binary search tree as SVG, lets other components set node states, and can make nodes
 * clickable (predict mode, quiz questions, ordering tasks).
 *
 * Layout rule: a node's column is its position in sorted order and its row is its depth. For a
 * BST this guarantees that left children are drawn to the left, right children to the right, and
 * nodes never overlap, without any clever spacing code.
 *
 * Node states (ID document, figure 4) are set with a `data-state` attribute; css/styles.css
 * decides how each state looks. Each state has its own shape or mark, never colour alone:
 *   current ● solid dark   visited ✓ tick   on-stack ◌ dashed outline   found ★ star
 *
 * Status: implemented.
 * @module components/tree-view
 */

import { el } from '../util.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** The allowed node states. Anything else is a programming error. */
export const NODE_STATES = Object.freeze(['unvisited', 'current', 'visited', 'on-stack', 'found']);

/** The mark drawn beside a node in each state ('' = none). */
const MARKS = { unvisited: '', current: '', visited: '✓', 'on-stack': '', found: '★' };

/** Words for screen readers and tooltips. */
const DESCRIBE = {
  unvisited: 'not yet visited',
  current: 'current node',
  visited: 'visited',
  'on-stack': 'waiting on the stack',
  found: 'found',
};

/** Drawing constants, in SVG units. */
const RADIUS = 20;
const COLUMN_GAP = 52;
const ROW_GAP = 70;
const MARGIN = 24;
/** Extra space on each side when nodes carry labels such as "ROOT". */
const LABEL_SPACE = 70;

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
 * @property {number|null} rootValue - the root's value, or null for an empty tree
 * @property {(value: number, state: string) => void} setState - sets one node's state
 * @property {(states: Map<number, string>) => void} setStates - sets every node at once; nodes not
 *           in the map become 'unvisited'
 * @property {() => void} resetStates - makes every node 'unvisited'
 * @property {(onChoose: (value: number) => void, label?: string) => () => void} makeClickable -
 *           turns every node into a button (mouse, Enter or Space); returns a function that undoes it
 * @property {(value: number) => SVGGElement|undefined} nodeElement - the <g> for a value
 */

/**
 * Draws a tree into an <svg> element, replacing whatever was there.
 *
 * @param {SVGSVGElement} svg - the target element
 * @param {import('../api.js').TreeView} treeView - the tree from the API
 * @param {{labels?: Record<string, string>}} [options] - labels: text to show beside some nodes,
 *        for example { "50": "root", "30": "left child" } (lesson 1)
 * @returns {TreeViewHandle} functions to change node states afterwards
 */
export function renderTree(svg, treeView, { labels = {} } = {}) {
  const { nodes, width, height } = layoutTree(treeView.root);
  const byValue = new Map(nodes.map((node) => [node.value, node]));
  /** @type {Map<number, SVGGElement>} */
  const groups = new Map();
  const hasLabels = Object.keys(labels).length > 0;
  const pad = hasLabels ? LABEL_SPACE : 0;

  svg.replaceChildren();
  svg.setAttribute('viewBox', `${-pad} 0 ${width + 2 * pad} ${height}`);
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
    title.textContent = `${node.value}, ${DESCRIBE.unvisited}`;
    const value = svgEl('text', { class: 'tree-node__value', x: node.x, y: node.y });
    value.textContent = String(node.value);
    const mark = svgEl('text', { class: 'tree-node__mark', x: node.x + RADIUS + 6, y: node.y - RADIUS + 2 });
    group.append(title, svgEl('circle', { class: 'tree-node__circle', cx: node.x, cy: node.y, r: RADIUS }), value, mark);
    svg.append(group);
    groups.set(node.value, group);

    const label = labels[String(node.value)];
    if (label) {
      // Left children get their label on the left, everything else on the right.
      const onLeft = node.parent !== null && node.value < node.parent;
      const text = svgEl('text', {
        class: 'tree-label',
        x: onLeft ? node.x - RADIUS - 8 : node.x + RADIUS + 8,
        y: node.y - RADIUS - 4,
        'text-anchor': onLeft ? 'end' : 'start',
      });
      text.textContent = label;
      svg.append(text);
    }
  }

  const setState = (nodeValue, state) => {
    if (!NODE_STATES.includes(state)) {
      throw new Error(`Unknown node state "${state}". Use one of: ${NODE_STATES.join(', ')}`);
    }
    const group = groups.get(nodeValue);
    if (!group) return;
    group.dataset.state = state;
    group.querySelector('.tree-node__mark').textContent = MARKS[state];
    group.querySelector('title').textContent = `${nodeValue}, ${DESCRIBE[state]}`;
    if (group.getAttribute('role') === 'button') {
      group.setAttribute('aria-label', `Node ${nodeValue}, ${DESCRIBE[state]}`);
    }
  };

  return {
    values: nodes.map((node) => node.value),
    rootValue: treeView.root ? treeView.root.value : null,
    setState,
    setStates(states) {
      for (const nodeValue of groups.keys()) {
        setState(nodeValue, states.get(nodeValue) ?? 'unvisited');
      }
    },
    resetStates() {
      for (const nodeValue of groups.keys()) setState(nodeValue, 'unvisited');
    },
    makeClickable(onChoose) {
      const undo = [];
      for (const [nodeValue, group] of groups) {
        group.setAttribute('role', 'button');
        group.setAttribute('tabindex', '0');
        group.setAttribute('aria-label', `Node ${nodeValue}, ${DESCRIBE[group.dataset.state]}`);
        const onClick = () => onChoose(nodeValue);
        const onKey = (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onChoose(nodeValue);
          }
        };
        group.addEventListener('click', onClick);
        group.addEventListener('keydown', onKey);
        undo.push(() => {
          group.removeEventListener('click', onClick);
          group.removeEventListener('keydown', onKey);
          group.removeAttribute('role');
          group.removeAttribute('tabindex');
          group.removeAttribute('aria-label');
        });
      }
      return () => undo.forEach((fn) => fn());
    },
    nodeElement: (nodeValue) => groups.get(nodeValue),
  };
}

/**
 * The key to the node states, shown under every tree that changes state.
 *
 * @returns {HTMLUListElement}
 */
export function treeLegend() {
  const item = (state, symbol, text) => el('li', {},
    el('span', { class: `legend__swatch legend__swatch--${state}`, 'aria-hidden': 'true' }, symbol), text);
  return el('ul', { class: 'legend', 'aria-label': 'Key' },
    item('current', '', 'Current'),
    item('visited', '✓', 'Visited'),
    item('on-stack', '', 'On stack'),
    item('found', '★', 'Found'));
}
