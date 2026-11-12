/**
 * Screen type "explorer": a tree with controls to run DFS and play it back. Used for the BST
 * screen, "three orders", the worked example and the sandbox.
 *
 * lesson.json fields:
 *  - tree:      "A" or "B" (a fixed tree from data/trees.json, built with POST /api/tree/preview),
 *               or "sandbox" (the shared tree that insert/reset change)
 *  - mode:      "search", "traverse", "both" or "none" - which DFS controls to show
 *  - target:    default search target (search modes)
 *  - order:     default traversal order (traverse modes)
 *  - allowEdit: true to show insert / reset controls (sandbox only)
 *  - afterRun:  optional text revealed after a run (for example "It is sorted!")
 * A fixed tree in "search" mode runs the search automatically, so the worked example starts ready
 * for the student to press "Next step".
 *
 * Status: implemented as a walking skeleton. Drawing, insert, reset and calling the DFS endpoints
 * all work. Playback depends on the step player (F-02) and stack panel (F-03); the polished
 * controls and result summary are ticket F-04.
 * @module screens/explorer-screen
 */

import { api } from '../api.js';
import { StackPanel } from '../components/stack-panel.js';
import { StepPlayer } from '../components/step-player.js';
import { renderTree } from '../components/tree-view.js';
import { el, formatText, parseWholeNumber } from '../util.js';
import { clearMessage, renderHeader, showError } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {any} screen - the screen object from lesson.json (fields above)
 * @param {HTMLElement} container
 * @param {{trees: Record<string, {values: number[]}>}} ctx
 */
export function render(screen, container, ctx) {
  renderHeader(screen, container);

  /** Insertion order for a fixed tree, or undefined for the sandbox. */
  const values = screen.tree === 'sandbox' ? undefined : ctx.trees[screen.tree]?.values;
  const mode = screen.mode ?? 'none';

  // --- Page structure ---------------------------------------------------------------------
  const svg = document.createElementNS(SVG_NS, 'svg');
  const stackBox = el('div');
  const explanation = el('div', { class: 'explanation', 'aria-live': 'polite' },
    mode === 'none' ? 'Insert a value to see where it goes.' : 'Run DFS to see each step here.');
  const status = el('span', { class: 'step-status' });
  const message = el('div', { class: 'message', role: 'alert' });
  const afterRun = el('div', { class: 'message message--success', 'aria-live': 'polite' });

  const stack = new StackPanel(stackBox);
  /** @type {StepPlayer|null} */
  let player = null;

  // --- Step controls (work once F-02 is done) ---------------------------------------------
  const backBtn = el('button', { type: 'button', class: 'btn', onclick: () => { player?.back(); updateStepButtons(); } }, 'Previous step');
  const nextBtn = el('button', { type: 'button', class: 'btn btn--primary', onclick: () => { player?.next(); updateStepButtons(); } }, 'Next step');
  const restartBtn = el('button', { type: 'button', class: 'btn', onclick: () => { player?.restart(); updateStepButtons(); } }, 'Restart');

 /**
   * Shows which nodes have been visited up to and including step `index`.
   * @param {number} index - 0-based step index, or -1 before the first step
   */
  function showVisited(index) {
    const visited = player?.result ? player.result.visitOrder.slice(0, index + 1) : [];
    visitedLine.textContent = visited.length > 0 ? `Visited: ${visited.join(' \u2192 ')}` : 'Visited: none yet';
  }

  
  /** Enables the step buttons only when there is somewhere to go. */
  function updateStepButtons() {
    backBtn.disabled = !player?.canBack;
    nextBtn.disabled = !player?.canNext;
    restartBtn.disabled = !player?.canBack;
  }

  /**
   * Draws a tree and creates a fresh step player for it.
   * @param {import('../api.js').TreeView} view
   */
  function drawTree(view) {
    const tree = renderTree(svg, view);
    player = new StepPlayer({ tree, stack, explanation, status,  onStep: showVisited, rootValue: view.root?.value ?? null });
    stack.clear();
    visitedLine.textContent = '';
    updateStepButtons();
  }

  /**
   * Runs an API call that returns a DfsResult and loads it into the player.
   * @param {() => Promise<import('../api.js').DfsResult>} call
   */
  async function runDfs(call) {
    clearMessage(message);
    afterRun.textContent = '';
    try {
      const result = await call();
      player.load(result);
      if (screen.afterRun) afterRun.innerHTML = formatText(screen.afterRun);
    } catch (error) {
      showError(message, error);
    }
    updateStepButtons();
  }

  // --- DFS controls -----------------------------------------------------------------------
  const controls = [];

  if (mode === 'search' || mode === 'both') {
    const input = el('input', { type: 'number', id: `target-${screen.id}`, min: 0, max: 99, value: screen.target ?? '' });
    const runSearch = () => {
      const parsed = parseWholeNumber(input.value);
      if (!parsed.ok) {
        showError(message, parsed);
        return;
      }
      runDfs(() => api.search(parsed.value, values));
    };
    controls.push(el('form', { class: 'form-row', novalidate: true, onsubmit: (event) => { event.preventDefault(); runSearch(); } },
      el('label', { for: input.id }, 'Search for'),
      input,
      el('button', { type: 'submit', class: 'btn btn--primary' }, 'Run DFS search')));
  }

  if (mode === 'traverse' || mode === 'both') {
    const select = el('select', { id: `order-${screen.id}` },
      ...['PRE_ORDER', 'IN_ORDER', 'POST_ORDER'].map((order) => el('option', {
        value: order,
        selected: order === (screen.order ?? 'PRE_ORDER'),
      }, order.replace('_', '-').toLowerCase())));
    controls.push(el('form', { class: 'form-row', novalidate: true, onsubmit: (event) => { event.preventDefault(); runDfs(() => api.traverse(select.value, values)); } },
      el('label', { for: select.id }, 'Traversal order'),
      select,
      el('button', { type: 'submit', class: 'btn btn--primary' }, 'Run traversal')));
  }

  if (screen.allowEdit) {
    const input = el('input', { type: 'number', id: `insert-${screen.id}`, min: 0, max: 99 });
    const insert = async () => {
      clearMessage(message);
      const parsed = parseWholeNumber(input.value);
      if (!parsed.ok) {
        showError(message, parsed);
        return;
      }
      try {
        drawTree(await api.insert(parsed.value));
        explanation.textContent = `${parsed.value} was inserted.`;
        input.value = '';
      } catch (error) {
        showError(message, error);
      }
    };
    const reset = async () => {
      clearMessage(message);
      try {
        drawTree(await api.reset());
        explanation.textContent = 'The tree is back to the example tree.';
      } catch (error) {
        showError(message, error);
      }
    };
    controls.push(el('form', { class: 'form-row', novalidate: true, onsubmit: (event) => { event.preventDefault(); insert(); } },
      el('label', { for: input.id }, 'Insert a value'),
      input,
      el('button', { type: 'submit', class: 'btn' }, 'Insert'),
      el('button', { type: 'button', class: 'btn', onclick: reset }, 'Reset tree')));
  }

  const showStepControls = mode !== 'none';
  container.append(el('div', { class: 'explorer' },
    el('div', { class: 'panel explorer__tree' }, el('p', { class: 'panel__title' }, 'Tree'), svg),
    el('div', { class: 'panel' }, el('p', { class: 'panel__title' }, 'Stack (top first)'), stackBox),
    el('div', { class: 'explorer__below' },
      explanation,
      showStepControls && el('div', { class: 'form-row' }, backBtn, nextBtn, restartBtn, status),
      message,
      afterRun,
      ...controls)));

  // --- Keyboard shortcuts: left/right arrows step back and forward ------------------------
  /** @param {KeyboardEvent} event */
  const onKeydown = (event) => {
    if (!showStepControls || !player) return;
    if (event.target instanceof Element && event.target.closest('input, select, textarea')) return;
    if (event.key === 'ArrowRight') {
      player.next();
    } else if (event.key === 'ArrowLeft') {
      player.back();
    } else {
      return;
    }
    updateStepButtons();
  };
  document.addEventListener('keydown', onKeydown);


  // --- Initial load -----------------------------------------------------------------------
  (async () => {
    try {
      drawTree(values ? await api.preview(values) : await api.getTree());
      if (mode === 'search' && values && screen.target !== undefined) {
        await runDfs(() => api.search(screen.target, values));
      }
    } catch (error) {
      showError(message, error);
    }
  })();
  return () => document.removeEventListener('keydown', onKeydown);
}
