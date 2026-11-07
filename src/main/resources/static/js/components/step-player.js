/**
 * Plays a DFS result back one step at a time: sets node states on the tree, updates the stack
 * panel, the visit-order line and the explanation. Used by the explorer, the lesson figures, the
 * animated preview on the home screen, and predict mode.
 *
 * The player never works out DFS itself. Everything comes from the DfsResult sent by the server
 * (NFR-03). Its only logic is turning "we are at step i" into node states, in {@link stateForStep}.
 *
 * Status: implemented (backlog ticket F-02).
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
  if (index < 0) {
    if (rootValue !== null && rootValue !== undefined) states.set(rootValue, 'on-stack');
    return states;
  }
  const step = result.steps[index];
  // Lowest precedence first, so later lines overwrite earlier ones.
  for (const value of step.stackAfter) states.set(value, 'on-stack');
  for (let i = 0; i < index; i++) states.set(result.steps[i].node, 'visited');
  const isLast = index === result.steps.length - 1;
  states.set(step.node, isLast && result.found ? 'found' : 'current');
  return states;
}

/**
 * The sentence added after the last step, so the student knows the run is over.
 *
 * @param {import('../api.js').DfsResult} result
 * @returns {string}
 */
export function endSummary(result) {
  if (result.target === null) return `Done: all ${result.nodesVisited} nodes written down.`;
  return result.found
    ? `Found ${result.target} after ${result.nodesVisited} visits.`
    : `${result.target} is not in the tree: all ${result.nodesVisited} nodes were visited.`;
}

export class StepPlayer {
  /**
   * @param {object} parts - the page elements the player controls (all optional except tree)
   * @param {import('./tree-view.js').TreeViewHandle} parts.tree - the drawn tree
   * @param {import('./stack-panel.js').StackPanel} [parts.stack] - the stack panel
   * @param {HTMLElement} [parts.explanation] - where the step's sentence goes (should be aria-live)
   * @param {HTMLElement} [parts.status] - short status such as "Step 2 of 6"
   * @param {HTMLElement} [parts.visited] - the "Visited: 50 → 30" line
   * @param {string} [parts.startText] - what the explanation says before step 1
   * @param {(index: number) => void} [parts.onStep] - called after every move
   */
  constructor({ tree, stack, explanation, status, visited, startText = 'Press Next step to begin.', onStep }) {
    this.tree = tree;
    this.stack = stack ?? null;
    this.explanation = explanation ?? null;
    this.status = status ?? null;
    this.visited = visited ?? null;
    this.startText = startText;
    this.onStep = onStep ?? (() => {});
    /** @type {import('../api.js').DfsResult|null} */
    this.result = null;
    /** Current step index; -1 means "before the first step". */
    this.index = -1;
    /** Stops a running {@link StepPlayer#play}, if any. */
    this.stopPlaying = () => {};
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

  /** True after the last step has been shown. */
  get atEnd() {
    return this.result !== null && this.index === this.stepCount - 1;
  }

  /**
   * Loads a new result and shows the start position (before step 1).
   * @param {import('../api.js').DfsResult} result
   */
  load(result) {
    this.stopPlaying();
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

  /** Shows the previous step, or the start position. The display is exactly what it was before. */
  back() {
    if (!this.canBack) return;
    this.index -= 1;
    this.render();
  }

  /** Goes back to the start position. */
  restart() {
    if (!this.result) return;
    this.index = -1;
    this.render();
  }

  /** Forgets the result and resets the display (for example after the tree changes). */
  clear() {
    this.stopPlaying();
    this.result = null;
    this.index = -1;
    this.tree.resetStates();
    this.stack?.clear();
    if (this.explanation) this.explanation.textContent = '';
    if (this.status) this.status.textContent = '';
    if (this.visited) this.visited.textContent = '';
  }

  /**
   * Plays the steps automatically (home preview, lesson figures).
   *
   * @param {{interval?: number, loop?: boolean, onEnd?: () => void}} [options] - interval in ms;
   *        loop: start again after a pause at the end
   * @returns {() => void} a function that stops playing
   */
  play({ interval = 1000, loop = false, onEnd } = {}) {
    this.stopPlaying();
    let pauseTicks = 0;
    const timer = setInterval(() => {
      if (this.canNext) {
        this.next();
      } else if (loop) {
        // Hold the last frame for two ticks, then start again.
        pauseTicks += 1;
        if (pauseTicks > 2) {
          pauseTicks = 0;
          this.restart();
        }
      } else {
        this.stopPlaying();
        onEnd?.();
      }
    }, interval);
    this.stopPlaying = () => {
      clearInterval(timer);
      this.stopPlaying = () => {};
    };
    return () => this.stopPlaying();
  }

  /** Draws the current position on every part it controls. */
  render() {
    const { result, index } = this;
    if (!result) return;
    const root = this.tree.rootValue;
    const isTraversal = result.target === null;

    this.tree.setStates(stateForStep(result, index, root));

    if (this.stack) {
      const contents = index === -1 ? (root === null ? [] : [root]) : result.steps[index].stackAfter;
      this.stack.show(contents, { tags: !isTraversal });
    }

    if (this.explanation) {
      if (index === -1) {
        this.explanation.textContent = this.startText;
      } else {
        const step = result.steps[index];
        const end = this.atEnd ? ` ${endSummary(result)}` : '';
        this.explanation.textContent = `Step ${step.number}: ${step.explanation}${end}`;
      }
    }

    if (this.status) {
      this.status.textContent = `Step ${index + 1} of ${this.stepCount}`;
    }

    if (this.visited) {
      const seen = result.visitOrder.slice(0, index + 1);
      const label = isTraversal ? 'Visit order' : 'Visited';
      this.visited.textContent = seen.length ? `${label}: ${seen.join(' → ')}` : `${label}: none yet`;
    }

    this.onStep(index);
  }
}
