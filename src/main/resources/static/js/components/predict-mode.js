/**
 * Predict mode: before each step is revealed, the student clicks the node they think DFS visits
 * next. Wrong guesses climb the three-level hint ladder (ID document, section 10.4, figure 7).
 * This puts students at the "responding" level of the engagement taxonomy, which is where
 * visualisations start to improve learning.
 *
 * Status: implemented (ticket F-05). The pure function {@link checkPrediction} is tested in
 * src/test/js/predict-mode.test.js.
 * @module components/predict-mode
 */

/** Hint ladder wording (ID document, section 10.4). {answer} is replaced by the correct node. */
export const HINTS = Object.freeze({
  1: 'Look at the stack. Which node is on top?',
  2: 'DFS always takes the top node off the stack. The node pushed last is on top. Which one was that?',
  3: 'The next node is {answer}. It was on top of the stack, so it comes off first. That is why DFS explores the left side before the right.',
});

/**
 * @typedef {object} PredictionFeedback
 * @property {boolean} correct
 * @property {0|1|2|3} hintLevel - 0 when correct; otherwise the hint shown
 * @property {string} message - what to show the student
 * @property {boolean} reveal - true when the step should now be revealed (correct, or hint 3)
 */

/**
 * Checks one guess. Pure function, no DOM.
 *
 * Rules:
 *  - The correct answer is result.steps[stepIndex].node.
 *  - Correct guess: { correct: true, hintLevel: 0, reveal: true } and a message that confirms it
 *    and gives the reason, for example "Yes, 20 was on top of the stack."
 *  - Wrong guess: hintLevel = min(attempt, 3); message = HINTS[hintLevel] with {answer} replaced;
 *    reveal is true only at level 3.
 *
 * @param {import('../api.js').DfsResult} result
 * @param {number} stepIndex - 0-based index of the step being predicted
 * @param {number} guess - the value the student clicked
 * @param {number} attempt - 1 for the first try at this step, 2 for the second, ...
 * @returns {PredictionFeedback}
 */
export function checkPrediction(result, stepIndex, guess, attempt) {
  const answer = result.steps[stepIndex].node;
  if (guess === answer) {
    return { correct: true, hintLevel: 0, reveal: true, message: `Yes, ${answer} was on top of the stack.` };
  }
  const hintLevel = Math.min(Math.max(attempt, 1), 3);
  return {
    correct: false,
    hintLevel,
    reveal: hintLevel === 3,
    message: HINTS[hintLevel].replaceAll('{answer}', String(answer)),
  };
}

/** Short names for the three hint levels, shown before the hint text. */
const HINT_NAMES = Object.freeze({ 1: 'Nudge', 2: 'Rule', 3: 'Worked answer' });

/** How many answers shown by hint 3 in one run before the student is sent back to the example. */
const REPLAY_AFTER = 2;

export class PredictMode {
  /**
   * @param {object} parts
   * @param {import('./step-player.js').StepPlayer} parts.player - plays the steps
   * @param {import('./tree-view.js').TreeViewHandle} parts.tree - used to listen for node clicks
   * @param {HTMLElement} parts.feedback - where hints and confirmations are shown (use aria-live)
   * @param {string} [parts.replayHref] - link offered after two hint-3 reveals (default: the worked example)
   * @param {(summary: {hint3Reveals: number}) => void} [parts.onFinish] - called when the last step is revealed
   */
  constructor({ player, tree, feedback, replayHref = '#/worked-example', onFinish }) {
    this.player = player;
    this.tree = tree;
    this.feedback = feedback;
    this.replayHref = replayHref;
    this.onFinish = onFinish ?? (() => {});
    /** @type {import('../api.js').DfsResult|null} */
    this.result = null;
    /** 0-based index of the step the student is predicting. */
    this.stepIndex = 0;
    /** 1 for the first try at this step, 2 for the second, ... */
    this.attempt = 1;
    /** Steps revealed by hint 3 in this run. */
    this.hint3Reveals = 0;
    /** @type {Map<number, {group: Element, onClick: () => void, onKey: (e: KeyboardEvent) => void}>} */
    this.handlers = new Map();
  }

  /**
   * Starts (or restarts) predict mode for a result.
   *
   *  - loads the result into the player but does not advance;
   *  - makes every node clickable and keyboard-focusable (tabindex 0, Enter/Space to choose);
   *  - on a choice, calls checkPrediction; shows the message; if reveal, calls player.next();
   *  - counts hint-3 reveals; after two in one run, suggests replaying the worked example;
   *  - when the last step is revealed, shows a summary and stops listening.
   *
   * @param {import('../api.js').DfsResult} result
   */
  start(result) {
    this.stop();
    this.result = result;
    this.stepIndex = 0;
    this.attempt = 1;
    this.hint3Reveals = 0;
    this.player.load(result);
    this.#makeNodesClickable();
    this.#show('info', [this.#prompt()]);
  }

  /** Removes click handlers. Call when leaving the screen. */
  stop() {
    for (const [, { group, onClick, onKey }] of this.handlers) {
      group.removeEventListener('click', onClick);
      group.removeEventListener('keydown', onKey);
      group.removeAttribute('tabindex');
      group.removeAttribute('role');
      group.removeAttribute('aria-label');
      group.classList.remove('tree-node--clickable');
    }
    this.handlers.clear();
    // Hand the drawing back to screen readers as a picture (see #makeNodesClickable).
    this.#svg()?.setAttribute('role', 'img');
  }

  /** The <svg> the tree is drawn in, found through any node. */
  #svg() {
    const first = this.tree.values.length > 0 ? this.tree.nodeElement(this.tree.values[0]) : undefined;
    return first?.ownerSVGElement ?? null;
  }

  #makeNodesClickable() {
    // An element with role="img" hides its children from assistive technology, so while the
    // nodes are buttons the drawing is a plain group instead.
    this.#svg()?.setAttribute('role', 'group');
    for (const value of this.tree.values) {
      const group = this.tree.nodeElement(value);
      if (!group) continue;
      const onClick = () => this.#choose(value);
      const onKey = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.#choose(value);
        }
      };
      group.setAttribute('tabindex', '0');
      group.setAttribute('role', 'button');
      group.setAttribute('aria-label', `Node ${value}`);
      group.classList.add('tree-node--clickable');
      group.addEventListener('click', onClick);
      group.addEventListener('keydown', onKey);
      this.handlers.set(value, { group, onClick, onKey });
    }
  }

  /** The question for the step being predicted. */
  #prompt() {
    if (this.stepIndex === 0) return 'Which node does DFS visit first? Click it in the tree.';
    const previous = this.result.steps[this.stepIndex - 1].node;
    return `DFS just visited ${previous}. Which node will it visit next? Click it in the tree.`;
  }

  /**
   * Replaces the feedback area's content.
   * @param {'info'|'success'} kind
   * @param {(string|Node)[]} parts
   */
  #show(kind, parts) {
    this.feedback.className = `message message--${kind}`;
    this.feedback.replaceChildren(...parts.map((part) => {
      if (typeof part !== 'string') return part;
      const line = document.createElement('p');
      line.textContent = part;
      return line;
    }));
  }

  /** Handles one click on a node. */
  #choose(value) {
    const feedback = checkPrediction(this.result, this.stepIndex, value, this.attempt);

    if (!feedback.reveal) {
      this.attempt += 1;
      this.#show('info', [`Hint ${feedback.hintLevel} of 3 (${HINT_NAMES[feedback.hintLevel]}): ${feedback.message}`]);
      return;
    }

    if (!feedback.correct) this.hint3Reveals += 1;
    this.player.next();
    this.stepIndex += 1;
    this.attempt = 1;

    const lines = [feedback.correct ? feedback.message : `Hint 3 of 3 (${HINT_NAMES[3]}): ${feedback.message}`];
    if (this.stepIndex >= this.result.steps.length) {
      this.stop();
      lines.push(this.#summary());
      this.#show('success', lines);
      this.onFinish({ hint3Reveals: this.hint3Reveals });
      return;
    }
    if (this.hint3Reveals >= REPLAY_AFTER) {
      const link = document.createElement('a');
      link.href = this.replayHref;
      link.textContent = 'worked example';
      const replay = document.createElement('p');
      replay.append('You needed the answer twice. It may help to replay the ', link, ' first.');
      lines.push(replay);
    }
    lines.push(this.#prompt());
    this.#show(feedback.correct ? 'success' : 'info', lines);
  }

  /** The sentence shown when the last step has been revealed. */
  #summary() {
    const { result } = this;
    const outcome = result.target === null
      ? `The visit order is ${result.visitOrder.join(', ')}.`
      : result.found
        ? `You followed the whole search: ${result.target} was found after ${result.nodesVisited} visits.`
        : `You followed the whole search: ${result.target} is not in the tree (all ${result.nodesVisited} nodes visited).`;
    return this.hint3Reveals === 0
      ? `${outcome} You predicted every step without needing the worked answer.`
      : `${outcome} The worked answer was shown ${this.hint3Reveals} time${this.hint3Reveals === 1 ? '' : 's'}.`;
  }
}

