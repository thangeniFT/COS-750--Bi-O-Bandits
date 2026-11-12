/**
 * Screen type "practice": guided practice on tree B (Gagné events 6 and 7).
 *
 * lesson.json fields: tree ("B"), target (55), orderTask ("IN_ORDER").
 *
 * Status: Practice 1 is implemented (ticket F-05); Practice 2 is still a backlog ticket.
 *  - Practice 1: draws tree B, fetches api.search(target, values) and runs PredictMode
 *    (js/components/predict-mode.js) so the student predicts every step by clicking nodes. The
 *    student can start again at any time with "Start again".
 *  - Practice 2, backlog ticket F-07 (shares the ordering widget with the quiz): the student puts the
 *    nodes of tree B in in-order, by dragging or by typing "15, 25, ..." (use parseNumberList from
 *    util.js). Check the answer against api.traverse(orderTask, values).visitOrder, never against a
 *    list written in JavaScript.
 * @module screens/practice-screen
 */


import { api } from '../api.js';
import { PredictMode } from '../components/predict-mode.js';
import { StackPanel } from '../components/stack-panel.js';
import { StepPlayer } from '../components/step-player.js';
import { renderTree } from '../components/tree-view.js';
import { el, placeholder } from '../util.js';
import { clearMessage, renderHeader, showError } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {{trees: Record<string, {values: number[]}>}} ctx
 * @returns {() => void} clean-up function that stops predict mode
 */

export function render(screen, container, ctx) {
  renderHeader(screen, container);
 
  const values = ctx.trees[screen.tree]?.values;

  // --- Page structure (same layout as the explorer screens) -------------------------------
  const svg = document.createElementNS(SVG_NS, 'svg');
  const stackBox = el('div');
  const explanation = el('div', { class: 'explanation', 'aria-live': 'polite' }, 'Loading the practice search\u2026');
  const status = el('span', { class: 'step-status' });
  const feedback = el('div', { class: 'message', 'aria-live': 'polite' });
  const message = el('div', { class: 'message', role: 'alert' });
  const stack = new StackPanel(stackBox);

  /** @type {PredictMode|null} */
  let predict = null;
  /** @type {import('../api.js').DfsResult|null} */
  let result = null;

  const restartBtn = el('button', {
    type: 'button',
    class: 'btn',
    disabled: true,
    onclick: () => { if (predict && result) predict.start(result); },
  }, 'Start again');

  container.append(
    el('div', { class: 'explorer' },
      el('div', { class: 'panel explorer__tree' }, el('p', { class: 'panel__title' }, 'Tree'), svg),
      el('div', { class: 'panel' }, el('p', { class: 'panel__title' }, 'Stack (top first)'), stackBox),
      el('div', { class: 'explorer__below' },
        feedback,
        explanation,
        el('div', { class: 'form-row' }, restartBtn, status),
        message)),
    // TODO(F-07): Practice 2 (ordering task).
    placeholder('F-07', `Put the nodes of tree ${screen.tree} in ${screen.orderTask.replace('_', '-').toLowerCase()}.`));

  // --- Practice 1: predict every step -----------------------------------------------------
  (async () => {
    try {
      const view = await api.preview(values);
      const tree = renderTree(svg, view);
      const player = new StepPlayer({ tree, stack, explanation, status, rootValue: view.root?.value ?? null });
      predict = new PredictMode({ player, tree, feedback });
      // The search runs on the server (NFR-03); the screen only plays the steps back.
      result = await api.search(screen.target, values);
      clearMessage(message);
      predict.start(result);
      restartBtn.disabled = false;
    } catch (error) {
      explanation.textContent = '';
      showError(message, error);
    }
  })();

  return () => predict?.stop();
}

