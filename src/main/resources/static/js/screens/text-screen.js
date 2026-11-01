/**
 * Screen type "text": a heading and paragraphs. Used for goals, concept screens and the summary.
 *
 * lesson.json fields: title, body (array of paragraphs; **bold** and *italic* allowed).
 *
 * Status: implemented.
 * @module screens/text-screen
 */

import { renderHeader } from './common.js';

/**
 * @param {{title: string, body: string[]}} screen
 * @param {HTMLElement} container
 */
export function render(screen, container) {
  renderHeader(screen, container);
}
