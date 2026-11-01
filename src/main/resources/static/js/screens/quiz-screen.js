/**
 * Screen type "quiz": the six-question readiness quiz (Gagné event 8), then either the summary or
 * the guided review.
 *
 * Status: SKELETON. Three tickets build this screen:
 *  - F-06 quiz engine (js/quiz/quiz-engine.js): choosing items, grading, scoring, review plan.
 *  - F-07 quiz UI (this file): one question at a time; choice items as buttons (or clickable tree
 *    nodes when item.presentation is "tree-click"); order items by drag-and-drop with a typed
 *    alternative; the confidence rating (guessing / fairly sure / certain) after each answer; the
 *    feedback panel (wireframe: ID document, figure 6). Block the global Next button with
 *    ctx.setNextEnabled(false) until the quiz is finished.
 *  - F-08 guided review: when scoreQuiz(...).passed is false, offer the review built from
 *    planReview(...), then a new attempt with selectItems(bank, seenIds). Always offer
 *    "Continue to summary anyway".
 * Keep the list of seen item ids in sessionStorage so a page refresh does not reset it.
 * @module screens/quiz-screen
 */

import { loadData } from '../api.js';
import { placeholder } from '../util.js';
import { renderHeader } from './common.js';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 */
export function render(screen, container) {
  renderHeader(screen, container);
  const note = placeholder('F-07', 'One question at a time, with a confidence rating and feedback after each answer.');
  container.append(note);

  // Proves the quiz bank loads and parses; remove when the real screen is built.
  loadData('quiz-bank')
    .then((bank) => note.append(` The quiz bank is loaded: ${bank.items.length} items, pass mark ${bank.passMark}.`))
    .catch((error) => note.append(` The quiz bank could not be loaded: ${error.message}`));
}
