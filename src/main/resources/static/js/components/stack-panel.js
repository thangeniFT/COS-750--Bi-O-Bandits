/**
 * Shows the DFS stack beside the tree, top first, so students can see why backtracking goes where
 * it does (misconception M2, ID document section 3.4). Wireframe 04: one row per value, the top
 * row labelled NEXT and the others PENDING.
 *
 * For a traversal the "stack" is the path of recursive calls from the root, so the screen can ask
 * for plain rows without the NEXT/PENDING tags.
 *
 * Status: implemented.
 * @module components/stack-panel
 */

import { el } from '../util.js';

export class StackPanel {
  /**
   * @param {HTMLElement} container - an empty element to draw into
   * @param {{emptyText?: string}} [options] - emptyText: what to show before anything has run
   */
  constructor(container, { emptyText = 'Press Search to see the stack.' } = {}) {
    this.container = container;
    this.emptyText = emptyText;
    this.list = el('div');
    // Polite live region: announces "60 is now on top" without interrupting the student.
    this.announcer = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });
    container.replaceChildren(this.list, this.announcer);
    this.clear();
  }

  /**
   * Shows the given stack contents.
   *
   * @param {number[]} valuesTopFirst - the stack after a step, top first (DfsStep.stackAfter)
   * @param {{tags?: boolean}} [options] - tags: false hides NEXT/PENDING (traversal paths)
   */
  show(valuesTopFirst, { tags = true } = {}) {
    if (valuesTopFirst.length === 0) {
      this.list.replaceChildren(el('p', { class: 'stack-panel__empty' }, 'The stack is empty.'));
      this.announcer.textContent = 'The stack is empty.';
      return;
    }
    this.list.replaceChildren(el('ol', { class: 'stack-panel__list', 'aria-label': 'Stack, top first' },
      ...valuesTopFirst.map((value, i) => el('li', { class: `stack-panel__item${i === 0 ? ' stack-panel__item--top' : ''}` },
        el('span', { class: 'stack-panel__value' }, String(value)),
        tags && el('span', { class: 'stack-panel__tag' }, i === 0 ? 'NEXT' : 'PENDING')))));
    this.announcer.textContent = `${valuesTopFirst[0]} is on top of the stack.`;
  }

  /** Shows the panel before anything has run. */
  clear() {
    this.list.replaceChildren(el('p', { class: 'stack-panel__empty' }, this.emptyText));
    this.announcer.textContent = '';
  }
}
