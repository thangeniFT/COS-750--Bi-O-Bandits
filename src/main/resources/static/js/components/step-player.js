/**
 * Plays a DFS result back one step at a time: highlights nodes, updates the stack panel and shows
 * the explanation for the current step. This is the heart of the worked example (FR-06, FR-07,
 * FR-08) and is reused by predict mode.
 *
 * The player never works out DFS itself. Everything comes from the DfsResult sent by the server
 * (NFR-03). Its only logic is turning "we are at step i" into node states, in {@link stateForStep}.
 *
 * Status: SKELETON. Backlog ticket F-02. {@link StepPlayer#load} currently shows a text summary so
 * the explorer screen works end to end; next/back/restart do nothing yet. The expected behaviour of
 * {@link stateForStep} is already written as tests in src/test/js/step-player.test.js (skipped).
 * @module components/step-player
 */

/**
 * Works out the state of every node at a given point in the playback. Pure function, no DOM.
 *
 * Rules, in order of precedence (highest first):
 *  1. The node visited at step `index` is 'current', or 'found' if this is the last step of a
 *     successful search.
 *  2. Nodes visited at earlier steps are 'visited'.
 *  3. Nodes in steps[index].stackAfter are 'on-stack'.
 *  4. Everything else is left out of the map (the tree view treats missing nodes as 'unvisited').
 *
 * Before the first step (`index === -1`) only the root is shown, as 'on-stack', because step 0 of
 * the algorithm pushes the root. Pass the root value in `rootValue` for this case.
 *
 * @example
 *   // Search for 60 on tree A, after step 2 (index 1, node 30 visited):
 *   stateForStep(result, 1, 50)
 *   // => Map { 50 => 'visited', 30 => 'current', 20 => 'on-stack', 40 => 'on-stack', 70 => 'on-stack' }
 *
 * @param {import('../api.js').DfsResult} result - the result from the server
 * @param {number} index - 0-based step index, or -1 for "before the first step"
 * @param {number|null} rootValue - the tree's root value, used only when index is -1
 * @returns {Map<number, 'current'|'visited'|'on-stack'|'found'>}
 */
export function stateForStep(result, index, rootValue) {
  // TODO(F-02): implement the rules above, then remove { skip } from step-player.test.js.
  throw new Error('stateForStep is not implemented yet (backlog ticket F-02).');
}

export class StepPlayer {
  /**
   * @param {object} parts - the page elements the player controls
   * @param {import('./tree-view.js').TreeViewHandle} parts.tree - the drawn tree
   * @param {import('./stack-panel.js').StackPanel} parts.stack - the stack panel
   * @param {HTMLElement} parts.explanation - where the step's sentence goes (should be aria-live)
   * @param {HTMLElement} parts.status - short status such as "Step 2 of 6"
   * @param {(index: number) => void} [parts.onStep] - called after every move, for predict mode
   */
  constructor({ tree, stack, explanation, status, onStep }) {
    this.tree = tree;
    this.stack = stack;
    this.explanation = explanation;
    this.status = status;
    this.onStep = onStep ?? (() => {});
    /** @type {import('../api.js').DfsResult|null} */
    this.result = null;
    /** Current step index; -1 means "before the first step". */
    this.index = -1;
  }

  /** Number of steps in the loaded result (0 if nothing is loaded). */
  get stepCount() {
    return this.result ? this.result.steps.length : 0;
  }

  /** True when there is a next step to show. */
  get canNext() {
    return this.result !== null && this.index < this.stepCount - 1;
  }

  /** True when there is a previous step (or the start position) to go back to. */
  get canBack() {
    return this.index > -1;
  }

  /**
   * Loads a new result and shows the start position (before step 1).
   *
   * Finished behaviour (F-02): store the result, set index to -1 and call render().
   *
   * @param {import('../api.js').DfsResult} result
   */
  load(result) {
    this.result = result;
    this.index = -1;
    // TODO(F-02): replace this placeholder with this.render().
    const outcome = result.target === null
      ? `${result.order.replace('_', '-').toLowerCase()} visit order`
      : (result.found ? `found ${result.target}` : `${result.target} not found`);
    this.explanation.textContent =
      `${outcome}: ${result.visitOrder.join(', ')} (${result.nodesVisited} nodes visited). `
      + 'Step-by-step playback is not built yet (F-02).';
    this.status.textContent = '';
  }

  /**
   * Shows the next step. Does nothing at the last step.
   * Finished behaviour (F-02): if canNext, increment index and render().
   */
  next() {
    // TODO(F-02)
  }

  /**
   * Shows the previous step, or the start position. The display must be exactly what it was
   * before (acceptance check "Step backwards" in the SE document).
   * Finished behaviour (F-02): if canBack, decrement index and render().
   */
  back() {
    // TODO(F-02)
  }

  /** Goes back to the start position. Finished behaviour (F-02): index = -1, render(). */
  restart() {
    // TODO(F-02)
  }

  /**
   * Draws the current position.
   *
   * Finished behaviour (F-02):
   *  - tree.setStates(stateForStep(result, index, rootValue))
   *  - stack.show(index === -1 ? [root] : result.steps[index].stackAfter)
   *  - explanation: "Press Next to start." at -1, otherwise steps[index].explanation; after the last
   *    step of a search, add "Found after N visits." or "Not in the tree: all N nodes visited."
   *  - status: "Step i of n"
   *  - call onStep(index)
   */
  render() {
    // TODO(F-02)
  }
}
