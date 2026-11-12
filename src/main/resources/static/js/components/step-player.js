/**
 * Plays a DFS result back one step at a time: highlights nodes, updates the stack panel and shows
 * the explanation for the current step. This is the heart of the worked example (FR-06, FR-07,
 * FR-08) and is reused by predict mode.
 *
 * The player never works out DFS itself. Everything comes from the DfsResult sent by the server
 * (NFR-03). Its only logic is turning "we are at step i" into node states, in {@link stateForStep}.
 *
 * Status: implemented (ticket F-02). The behaviour of {@link stateForStep} and of the player's
 * next/back/restart is covered by src/test/js/step-player.test.js.
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
  /** @type {Map<number, 'current'|'visited'|'on-stack'|'found'>} */
  const states = new Map();

  if (index === -1) {
    if (rootValue !== null && rootValue !== undefined) states.set(rootValue, 'on-stack');
    return states;
  }

  // Lowest precedence first, so each later rule overwrites the one before it.
  for (const value of result.steps[index].stackAfter) states.set(value, 'on-stack');
  for (let i = 0; i < index; i++) states.set(result.steps[i].node, 'visited');

  const isLastStep = index === result.steps.length - 1;
  states.set(result.steps[index].node, isLastStep && result.found ? 'found' : 'current');
  return states;
}

export class StepPlayer {
  /**
   * @param {object} parts - the page elements the player controls
   * @param {import('./tree-view.js').TreeViewHandle} parts.tree - the drawn tree
   * @param {import('./stack-panel.js').StackPanel} parts.stack - the stack panel
   * @param {HTMLElement} parts.explanation - where the step's sentence goes (should be aria-live)
   * @param {HTMLElement} parts.status - short status such as "Step 2 of 6"
   * @param {(index: number) => void} [parts.onStep] - called after every move, for the visited line
   * @param {number|null} [parts.rootValue] - the tree's root value (view.root?.value); shown on the
   *        stack before the first step
   */
  constructor({ tree, stack, explanation, status, onStep, rootValue }) {
    this.tree = tree;
    this.stack = stack;
    this.explanation = explanation;
    this.status = status;
    this.onStep = onStep ?? (() => {});
    this.rootValue = rootValue ?? null;
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
   * @param {import('../api.js').DfsResult} result
   */
  load(result) {
    this.result = result;
    this.index = -1;
    this.render();
  }

  /** Shows the next step. Does nothing at the last step. */
  next() {
    if (!this.canNext) return;
    this.index += 1;
    this.render();
  }

  /**
   * Shows the previous step, or the start position. Because render() draws everything from
   * `index` alone, the display is exactly what it was before (acceptance check "Step backwards"
   * in the SE document).
   */
  back() {
    if (!this.canBack) return;
    this.index -= 1;
    this.render();
  }

  /** Goes back to the start position. */
  restart() {
    if (this.result === null) return;
    this.index = -1;
    this.render();
  }

  /** Draws the current position: node states, stack, explanation and status. */
  render() {
    const { result, index } = this;
    if (result === null) return;

    this.tree.setStates(stateForStep(result, index, this.rootValue));
    this.stack.show(index === -1 ? (this.rootValue === null ? [] : [this.rootValue]) : result.steps[index].stackAfter);

    if (index === -1) {
      this.explanation.textContent = 'Press Next to start.';
    } else {
      let text = result.steps[index].explanation;
      if (index === this.stepCount - 1 && result.target !== null) {
        text += result.found
          ? ` Found after ${result.nodesVisited} visits.`
          : ` Not in the tree: all ${result.nodesVisited} nodes visited.`;
      }
      this.explanation.textContent = text;
    }
    this.status.textContent = `Step ${index + 1} of ${this.stepCount}`;
    this.onStep(index);
  }
}

