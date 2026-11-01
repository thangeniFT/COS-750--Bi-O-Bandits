/**
 * Screen type "practice": guided practice on tree B (Gagné events 6 and 7).
 *
 * lesson.json fields: tree ("B"), target (55), orderTask ("IN_ORDER").
 *
 * Status: SKELETON. Two parts, two tickets:
 *  - Practice 1, backlog ticket F-05: draw tree B, fetch api.search(target, values), and run
 *    PredictMode (js/components/predict-mode.js) so the student predicts every step. The expected
 *    steps are in the ID document, section 11.3.
 *  - Practice 2, backlog ticket F-07 (shares the ordering widget with the quiz): the student puts the
 *    nodes of tree B in in-order, by dragging or by typing "15, 25, ..." (use parseNumberList from
 *    util.js). Check the answer against api.traverse(orderTask, values).visitOrder, never against a
 *    list written in JavaScript.
 * @module screens/practice-screen
 */

import { placeholder } from '../util.js';
import { renderHeader } from './common.js';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 */
export function render(screen, container) {
  renderHeader(screen, container);
  // TODO(F-05): Practice 1 (predict mode). TODO(F-07): Practice 2 (ordering task).
  container.append(
    placeholder('F-05', `Predict each step of a DFS search for ${screen.target} on tree ${screen.tree}, with hints.`),
    placeholder('F-07', `Put the nodes of tree ${screen.tree} in ${screen.orderTask.replace('_', '-').toLowerCase()}.`));
}
