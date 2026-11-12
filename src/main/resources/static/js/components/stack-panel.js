/**
 * Shows the DFS stack beside the tree, top at the top, so students can see why backtracking goes
 * where it does (misconception M2, ID document section 3.4).
 *
 * Status: implemented (ticket F-03). Looks like figure 2 of the SE document: one box per value,
 * top box highlighted orange, a base line under the bottom box. The CSS classes it uses are in
 * css/styles.css (section 5, "Stack panel").
 * @module components/stack-panel
 */

import { el } from '../util.js';

export class StackPanel {
  /**
   * @param {HTMLElement} container - an empty element to draw into
   */
  constructor(container) {
    this.container = container;
    // The drawing is replaced on every change, but the live region is created once and only its
    // text changes: screen readers announce text changes inside a region that stays in the page,
    // and may stay silent when the whole region is removed and added again.
    this.view = el('div');
    this.announcer = el('div', { class: 'visually-hidden', role: 'status', 'aria-live': 'polite' });
    container.replaceChildren(this.view, this.announcer);
    this.clear();
  }

  /**
   * Shows the given stack contents.
   *
   * Draws an <ol class="stack-panel__list"> with one <li class="stack-panel__item"> per value,
   * top first, the first with the extra class "stack-panel__item--top", and a
   * <div class="stack-panel__base"> underneath. An empty stack shows "The stack is empty."
   * (class stack-panel__empty). Each change is announced to screen readers, for example
   * "30 is now on top of the stack" or "The stack is empty".
   *
   * @param {number[]} valuesTopFirst - the stack after a step, top first (DfsStep.stackAfter)
   */
  show(valuesTopFirst) {
    if (valuesTopFirst.length === 0) {
      this.view.replaceChildren(el('p', { class: 'stack-panel__empty' }, 'The stack is empty.'));
      this.announcer.textContent = 'The stack is empty';
      return;
    }
    const list = el('ol', { class: 'stack-panel__list', 'aria-label': 'DFS stack, top first' },
      ...valuesTopFirst.map((value, position) => el('li', {
        class: position === 0 ? 'stack-panel__item stack-panel__item--top' : 'stack-panel__item',
      }, String(value))));
    this.view.replaceChildren(list, el('div', { class: 'stack-panel__base' }));
    this.announcer.textContent = `${valuesTopFirst[0]} is now on top of the stack`;
  }

  /** Shows the panel before any search has run. */
  clear() {
    this.view.replaceChildren(el('p', { class: 'stack-panel__empty' }, 'Run a search to see the stack.'));
    this.announcer.textContent = '';
  }
}

