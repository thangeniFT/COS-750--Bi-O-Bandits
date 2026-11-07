/**
 * Ordering widget: the student builds a list of node values, for example "put tree B in in-order".
 * Two ways to answer, so it works for everyone (ID document, section 7.1):
 *  - click (or Enter/Space on) the nodes of the tree in order;
 *  - or type the values: "15, 25, 30".
 * Used by practice task 2 and by order questions in the quiz.
 *
 * The widget does not know the right answer. The screen passes a check function, and the right
 * answer always comes from the server or the quiz bank, never from JavaScript.
 *
 * Status: implemented.
 * @module components/order-input
 */

import { el, parseNumberList } from '../util.js';

/**
 * @param {object} options
 * @param {import('./tree-view.js').TreeViewHandle} options.tree - the drawn tree; its nodes become clickable
 * @param {string} [options.submitLabel] - text on the check button
 * @param {(values: number[]) => void} options.onSubmit - called with the student's list
 * @param {(values: number[]) => void} [options.onChange] - called whenever the list changes
 * @returns {{element: HTMLElement, values: () => number[], lock: () => void, destroy: () => void}}
 */
export function createOrderInput({ tree, submitLabel = 'Check my order', onSubmit, onChange }) {
  /** @type {number[]} */
  let values = [];
  let locked = false;
  const id = `order-${Math.random().toString(36).slice(2, 8)}`;

  const chips = el('div', { class: 'order-input__chips', 'aria-live': 'polite', 'aria-label': 'Your order so far' });
  const message = el('div', { class: 'message', role: 'alert' });
  const typed = el('input', { id, type: 'text', inputmode: 'numeric', placeholder: 'or type them: 15, 25, 30', autocomplete: 'off' });
  const undoBtn = el('button', { type: 'button', class: 'btn btn--small btn--quiet', onclick: () => { values.pop(); update(); } }, 'Undo');
  const clearBtn = el('button', { type: 'button', class: 'btn btn--small btn--quiet', onclick: () => { values = []; update(); } }, 'Clear');
  const submitBtn = el('button', { type: 'button', class: 'btn btn--primary', onclick: submit }, submitLabel);

  /** Redraws the chips and button states. */
  function update() {
    chips.replaceChildren(...(values.length
      ? values.map((v) => el('span', { class: 'order-input__chip' }, String(v)))
      : [el('span', { class: 'order-input__empty' }, 'Click the nodes in order, or type them below.')]));
    undoBtn.disabled = locked || values.length === 0;
    clearBtn.disabled = locked || values.length === 0;
    submitBtn.disabled = locked || (values.length === 0 && typed.value.trim() === '');
    message.textContent = '';
    onChange?.([...values]);
  }

  /** Adds a clicked node, ignoring repeats. */
  function add(value) {
    if (locked) return;
    if (values.includes(value)) {
      message.className = 'message message--info';
      message.textContent = `${value} is already in your list. Use Undo to change it.`;
      return;
    }
    values.push(value);
    update();
  }

  /** Uses the typed list if there is one, then hands the values to the screen. */
  function submit() {
    if (typed.value.trim() !== '') {
      const parsed = parseNumberList(typed.value);
      if (!parsed.ok) {
        message.className = 'message message--error';
        message.textContent = parsed.message;
        return;
      }
      values = parsed.values;
      typed.value = '';
      update();
    }
    if (values.length === 0) return;
    onSubmit([...values]);
  }

  typed.addEventListener('input', () => { submitBtn.disabled = locked || (values.length === 0 && typed.value.trim() === ''); });
  typed.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); submit(); } });

  const undoClicks = tree.makeClickable(add);
  const element = el('div', { class: 'order-input' },
    el('p', { class: 'card__label' }, 'Your order'),
    chips,
    el('div', { class: 'order-input__row' },
      el('label', { for: id, class: 'visually-hidden' }, 'Type the values in order'),
      typed, undoBtn, clearBtn),
    message,
    el('div', { class: 'order-input__row', style: 'margin-top:12px' }, submitBtn));
  update();

  return {
    element,
    values: () => [...values],
    lock() {
      locked = true;
      typed.disabled = true;
      undoClicks();
      update();
    },
    destroy: undoClicks,
  };
}
