/**
 * Screen type "warmup": two quick prerequisite questions (Gagné event 3). A wrong answer opens the
 * matching refresher card before the student continues.
 *
 * lesson.json fields: questions[] (id, prompt, options[] {id, text, correct?}, refresher),
 * refreshers { trees, stacks }.
 *
 * Status: SKELETON. Backlog ticket F-09.
 * Finished behaviour:
 *  - Show both questions as single-choice button groups (same look as the quiz).
 *  - Correct: short confirmation. Wrong: show refreshers[question.refresher] in a message box,
 *    plus a "Got it" button; the student may answer again but does not have to.
 *  - Question w1 should show three small tree pictures (a tree, a cycle, two separate pieces)
 *    instead of the text descriptions in lesson.json; draw them as inline SVG.
 *  - Next stays enabled throughout: the warm-up is a check, not a gate.
 * @module screens/warmup-screen
 */

import { placeholder } from '../util.js';
import { renderHeader } from './common.js';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 */
export function render(screen, container) {
  renderHeader(screen, container);
  // TODO(F-09): replace the placeholder with the behaviour described above.
  container.append(placeholder('F-09',
    `${screen.questions.length} warm-up questions with refresher cards. The content is ready in data/lesson.json.`));
}
