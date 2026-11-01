/**
 * Shows the DFS stack beside the tree, top at the top, so students can see why backtracking goes
 * where it does (misconception M2, ID document section 3.4).
 *
 * Status: SKELETON. Backlog ticket F-03. The placeholder below shows the stack as a line of text so
 * the step player can already be wired up. The finished panel should look like figure 2 of the SE
 * document: one box per value, top box highlighted orange, a base line under the bottom box.
 * The CSS classes it needs already exist in css/styles.css (section 5, "Stack panel").
 * @module components/stack-panel
 */

import { el } from '../util.js';

export class StackPanel {
  /**
   * @param {HTMLElement} container - an empty element to draw into
   */
  constructor(container) {
    this.container = container;
    this.clear();
  }

  /**
   * Shows the given stack contents.
   *
   * Finished behaviour (F-03):
   *  - Draw an <ol class="stack-panel__list"> with one <li class="stack-panel__item"> per value,
   *    top first; give the first item the extra class "stack-panel__item--top".
   *  - Draw <div class="stack-panel__base"> underneath.
   *  - Announce the change for screen readers, for example "30 is now on top of the stack" or
   *    "The stack is empty", using a visually hidden aria-live region.
   *  - For an empty array, show "The stack is empty." (class stack-panel__empty).
   *
   * @param {number[]} valuesTopFirst - the stack after a step, top first (DfsStep.stackAfter)
   */
  show(valuesTopFirst) {
    // TODO(F-03): replace this placeholder with the drawing described above.
    const text = valuesTopFirst.length === 0
      ? 'The stack is empty.'
      : `Top first: ${valuesTopFirst.join(', ')}`;
    this.container.replaceChildren(el('p', { class: 'stack-panel__empty' }, text));
  }

  /** Shows the panel before any search has run. */
  clear() {
    this.container.replaceChildren(el('p', { class: 'stack-panel__empty' }, 'Run a search to see the stack.'));
  }
}
