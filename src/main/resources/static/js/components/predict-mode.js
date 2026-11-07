/**
 * Predict mode: before each step is revealed, the student chooses the node they think DFS visits
 * next, either with the A/B/C buttons or by clicking a node on the tree. Wrong guesses (or the
 * "Get a hint" button) climb the three-level hint ladder: nudge, rule, worked answer (ID document,
 * section 10.4, figure 7). This puts students at the "responding" level of the engagement
 * taxonomy, which is where visualisations start to improve learning.
 *
 * The screen draws the question and the buttons; this class keeps the state and decides what
 * happens. Everything it knows about DFS comes from the server's DfsResult.
 *
 * Status: implemented (backlog ticket F-05).
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
 * @param {number|null} guess - the value chosen, or null for "just give me a hint"
 * @param {number} attempt - 1 for the first try at this step, 2 for the second, ...
 * @returns {PredictionFeedback}
 */
export function checkPrediction(result, stepIndex, guess, attempt) {
  const answer = result.steps[stepIndex].node;
  if (guess === answer) {
    return { correct: true, hintLevel: 0, reveal: true, message: `Yes, ${answer} was on top of the stack, so DFS visits it next.` };
  }
  const hintLevel = /** @type {1|2|3} */ (Math.min(Math.max(attempt, 1), 3));
  return {
    correct: false,
    hintLevel,
    reveal: hintLevel === 3,
    message: HINTS[hintLevel].replace('{answer}', String(answer)),
  };
}

/**
 * Chooses the answer options for one prediction: the correct node plus up to two tempting wrong
 * ones, in ascending order so the position gives nothing away. Pure function, no DOM.
 *
 * Distractors, in order of preference:
 *  1. other nodes waiting on the stack (taking the wrong end of the stack, misconception M5);
 *  2. nodes not reached yet (jumping across the tree, M1);
 *  3. nodes already visited, most recent first ("going back up", M2).
 *
 * @param {import('../api.js').DfsResult} result
 * @param {number} stepIndex - the step being predicted (at least 1)
 * @param {number[]} allValues - every value in the tree
 * @returns {number[]} two or three values, sorted
 */
export function predictionOptions(result, stepIndex, allValues) {
  const answer = result.steps[stepIndex].node;
  const visited = result.steps.slice(0, stepIndex).map((s) => s.node);
  const waiting = result.steps[stepIndex - 1].stackAfter;
  const notReached = allValues.filter((v) => !visited.includes(v) && !waiting.includes(v));
  const candidates = [...waiting, ...notReached, ...[...visited].reverse()];
  const distractors = [...new Set(candidates.filter((v) => v !== answer))].slice(0, 2);
  return [answer, ...distractors].sort((a, b) => a - b);
}

export class PredictMode {
  /**
   * @param {object} parts
   * @param {import('./step-player.js').StepPlayer} parts.player - plays the steps
   * @param {import('./tree-view.js').TreeViewHandle} parts.tree - nodes become clickable answers
   * @param {(question: {stepIndex: number, justVisited: number, options: number[]}) => void} parts.onQuestion
   *        - called when a new prediction is needed; the screen draws the question and buttons
   * @param {(feedback: PredictionFeedback & {guess: number|null}) => void} parts.onFeedback
   *        - called after every guess or hint
   * @param {(summary: {steps: number, hintsUsed: number, revealed: number}) => void} parts.onFinish
   *        - called when the last step has been revealed
   */
  constructor({ player, tree, onQuestion, onFeedback, onFinish }) {
    this.player = player;
    this.tree = tree;
    this.onQuestion = onQuestion;
    this.onFeedback = onFeedback;
    this.onFinish = onFinish;
    this.undoClicks = () => {};
    this.reset();
  }

  /** Clears the counters for a new run. */
  reset() {
    /** Next attempt number for the current step (1 = first try). */
    this.attempt = 1;
    this.hintsUsed = 0;
    /** How many steps were given away by hint 3. After two, suggest the worked example. */
    this.revealed = 0;
    this.finished = false;
  }

  /**
   * Starts predict mode: shows the root as already visited, then asks for step 2.
   * @param {import('../api.js').DfsResult} result
   */
  start(result) {
    this.reset();
    this.player.load(result);
    this.player.next();
    this.undoClicks();
    this.undoClicks = this.tree.makeClickable((value) => this.guess(value));
    this.ask();
  }

  /** The step the student is predicting now. */
  get stepIndex() {
    return this.player.index + 1;
  }

  /** Asks for the next step, or finishes. */
  ask() {
    const { result } = this.player;
    if (!this.player.canNext) {
      this.finished = true;
      this.undoClicks();
      this.onFinish({ steps: result.steps.length - 1, hintsUsed: this.hintsUsed, revealed: this.revealed });
      return;
    }
    this.attempt = 1;
    this.onQuestion({
      stepIndex: this.stepIndex,
      justVisited: result.steps[this.player.index].node,
      options: predictionOptions(result, this.stepIndex, this.tree.values),
    });
  }

  /**
   * Handles a choice (button or tree click).
   * @param {number|null} value - the node chosen, or null when the student asks for a hint
   */
  guess(value) {
    if (this.finished) return;
    const feedback = checkPrediction(this.player.result, this.stepIndex, value, this.attempt);
    if (!feedback.correct) {
      this.attempt += 1;
      this.hintsUsed += 1;
      if (feedback.reveal) this.revealed += 1;
    }
    this.onFeedback({ ...feedback, guess: value });
    if (feedback.reveal) {
      this.player.next();
      this.ask();
    }
  }

  /** "Get a hint": climbs one rung of the ladder without guessing. */
  hint() {
    this.guess(null);
  }

  /** Removes click handlers. Call when leaving the screen. */
  stop() {
    this.undoClicks();
  }
}
