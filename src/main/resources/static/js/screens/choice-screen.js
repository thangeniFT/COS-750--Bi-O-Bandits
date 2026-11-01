/**
 * Screen type "choice": an ungraded question whose purpose is to make the student think before the
 * explanation (the maze hook, Gagné event 1). Any choice reveals the same follow-up text.
 *
 * lesson.json fields: title, body, options (array of strings), reveal (text shown after a choice).
 *
 * Status: implemented.
 * @module screens/choice-screen
 */

import { el, formatText } from '../util.js';
import { renderHeader } from './common.js';

/**
 * @param {{title: string, body: string[], options: string[], reveal: string}} screen
 * @param {HTMLElement} container
 */
export function render(screen, container) {
  renderHeader(screen, container);

  const reveal = el('div', { class: 'message message--info', 'aria-live': 'polite' });
  const buttons = screen.options.map((option) => el('button', {
    type: 'button',
    class: 'btn',
    'aria-pressed': 'false',
    onclick: (event) => {
      for (const button of buttons) button.setAttribute('aria-pressed', 'false');
      event.currentTarget.setAttribute('aria-pressed', 'true');
      reveal.innerHTML = formatText(screen.reveal);
    },
  }, option));

  container.append(el('div', { class: 'choices', role: 'group', 'aria-label': 'Choose a strategy' }, ...buttons), reveal);
}
