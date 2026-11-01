/**
 * Pieces shared by several screens.
 *
 * Status: implemented.
 * @module screens/common
 */

import { el, paragraph } from '../util.js';

/**
 * Draws a screen's heading and its `body` paragraphs from lesson.json.
 *
 * @param {{title: string, body?: string[]}} screen
 * @param {HTMLElement} container
 */
export function renderHeader(screen, container) {
  container.append(el('h1', {}, screen.title));
  for (const text of screen.body ?? []) {
    container.append(paragraph(text));
  }
}

/**
 * Shows an API error in a message box. A NOT_IMPLEMENTED error (a backlog ticket still open) is
 * shown as information rather than as an error, so the skeleton never looks broken.
 *
 * @param {HTMLElement} box - an element with class "message"
 * @param {Error & {code?: string}} error - usually an ApiError from js/api.js
 */
export function showError(box, error) {
  const notBuilt = error.code === 'NOT_IMPLEMENTED';
  box.className = `message ${notBuilt ? 'message--info' : 'message--error'}`;
  box.textContent = notBuilt ? `This part of the tutor is still being built. ${error.message}` : error.message;
}

/**
 * Empties a message box (it is hidden by CSS when empty).
 *
 * @param {HTMLElement} box
 */
export function clearMessage(box) {
  box.textContent = '';
}
