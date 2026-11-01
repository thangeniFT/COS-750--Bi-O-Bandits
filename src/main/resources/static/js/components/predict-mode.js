/**
 * Predict mode: before each step is revealed, the student clicks the node they think DFS visits
 * next. Wrong guesses climb the three-level hint ladder (ID document, section 10.4, figure 7).
 * This puts students at the "responding" level of the engagement taxonomy, which is where
 * visualisations start to improve learning.
 *
 * Status: SKELETON. Backlog ticket F-05 (depends on F-02, the step player). The pure function
 * {@link checkPrediction} has tests waiting in src/test/js/predict-mode.test.js (skipped).
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
  // TODO(F-05): implement the rules above, then remove { skip } from predict-mode.test.js.
  throw new Error('checkPrediction is not implemented yet (backlog ticket F-05).');
}

export class PredictMode {
  /**
   * @param {object} parts
   * @param {import('./step-player.js').StepPlayer} parts.player - plays the steps
   * @param {import('./tree-view.js').TreeViewHandle} parts.tree - used to listen for node clicks
   * @param {HTMLElement} parts.feedback - where hints and confirmations are shown
   */
  constructor({ player, tree, feedback }) {
    this.player = player;
    this.tree = tree;
    this.feedback = feedback;
  }

  /**
   * Starts predict mode for a result.
   *
   * Finished behaviour (F-05):
   *  - load the result into the player but do not advance;
   *  - make every node clickable and keyboard-focusable (tabindex 0, Enter/Space to choose);
   *  - on a choice, call checkPrediction; show the message; if reveal, call player.next();
   *  - count hint-3 reveals; after two in one run, suggest replaying the worked example;
   *  - when the last step is revealed, show a summary and let the screen continue.
   *
   * @param {import('../api.js').DfsResult} result
   */
  start(result) {
    // TODO(F-05)
    throw new Error('PredictMode is not implemented yet (backlog ticket F-05).');
  }

  /** Removes click handlers. Call when leaving the screen. */
  stop() {
    // TODO(F-05)
  }
}
