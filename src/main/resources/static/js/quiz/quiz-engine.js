/**
 * @module quiz/quiz-engine
 */

/** Default number of correct answers (out of 6) needed to skip the guided review. */
export const PASS_MARK = 4;

/** Confidence options, from least to most sure (ID document, section 10.2). */
export const CONFIDENCE = Object.freeze(['guessing', 'fairly-sure', 'certain']);

/**
 * @typedef {object} ChoiceOption
 * @property {string} id
 * @property {string} text
 * @property {boolean} [correct]
 * @property {string} [misconception] - M1..M5
 * @property {string} feedback
 */

/**
 * @typedef {object} OrderRule
 * @property {number[]} match - a known wrong answer
 * @property {string} [misconception]
 * @property {string} feedback
 */

/**
 * @typedef {object} QuizItem
 * @property {string} id - for example "3A"
 * @property {number} slot - 1..6
 * @property {string} outcome - LO1..LO5
 * @property {string} variant - "A", "B", ...
 * @property {'choice'|'order'} type
 * @property {string|null} tree - "A", "B" or null
 * @property {string} prompt
 * @property {ChoiceOption[]} [options] - choice items only
 * @property {number[]} [answer] - order items only
 * @property {string} [correctFeedback] - order items only
 * @property {OrderRule[]} [rules] - order items only
 * @property {string} [fallbackFeedback] - order items only; may contain {position} and {expected}
 */

/**
 * @typedef {object} GradeResult
 * @property {boolean} correct
 * @property {string} feedback - from the bank; show it as it is (it may contain *italic* markers)
 * @property {string|null} misconception - M1..M5, or null
 */

/**
 * @typedef {object} QuizResponse
 * @property {QuizItem} item
 * @property {string|number[]} answer
 * @property {'guessing'|'fairly-sure'|'certain'} confidence
 * @property {GradeResult} result
 */

/**
 * Chooses one item per slot for a quiz attempt.
 *
 * Rules:
 *  - Return exactly one item for each slot in the bank, sorted by slot number.
 *  - Within a slot, items are tried in variant order (A, B, C, ...). Pick the first one whose id is
 *    not in `seenIds`.
 *  - If every variant of a slot has been seen, pick variant A again.
 *
 * @param {{items: QuizItem[]}} bank - the parsed data/quiz-bank.json
 * @param {string[]} [seenIds] - ids already shown to this student in earlier attempts
 * @returns {QuizItem[]}
 */
export function selectItems(bank, seenIds = []) {
  const seen = new Set(seenIds);

  const bySlot = new Map();
  for (const item of bank.items) {
    if (!bySlot.has(item.slot)) bySlot.set(item.slot, []);
    bySlot.get(item.slot).push(item);
  }

  return [...bySlot.keys()]
    .sort((a, b) => a - b)
    .map((slot) => {
      // Copy before sorting so the bank itself is not reordered.
      const variants = [...bySlot.get(slot)].sort((a, b) => a.variant.localeCompare(b.variant));
      return variants.find((item) => !seen.has(item.id)) ?? variants[0];
    });
}

/**
 * Grades one answer using the rules in the bank.
 *
 * Choice items (`answer` is an option id):
 *  - Return { correct: option.correct === true, feedback: option.feedback,
 *    misconception: option.misconception ?? null }.
 *  - Throw an Error if no option has that id (it means a bug in the screen, not a student error).
 *
 * Order items (`answer` is an array of numbers):
 *  - If it equals item.answer exactly: { correct: true, feedback: item.correctFeedback, misconception: null }.
 *  - Otherwise, if it equals the `match` of a rule (first matching rule wins): that rule's feedback
 *    and misconception, with correct = false.
 *  - Otherwise: item.fallbackFeedback with {position} replaced by the 1-based position of the first
 *    value that differs from item.answer, and {expected} by the value that should be there; if the
 *    answer is shorter than item.answer, the first missing position counts as the difference.
 *    misconception is null.
 *
 * @param {QuizItem} item
 * @param {string|number[]} answer
 * @returns {GradeResult}
 */
export function gradeAnswer(item, answer) {
  // TODO(F-06)
  throw new Error('gradeAnswer is not implemented yet (backlog ticket F-06).');
}

/**
 * Totals a finished attempt.
 *
 * @param {QuizResponse[]} responses
 * @param {number} [passMark] - defaults to {@link PASS_MARK}; use bank.passMark when available
 * @returns {{correct: number, total: number, passed: boolean}} passed is correct >= passMark
 */
export function scoreQuiz(responses, passMark = PASS_MARK) {
  // TODO(F-06)
  throw new Error('scoreQuiz is not implemented yet (backlog ticket F-06).');
}

/**
 * Decides what to review after an attempt (ID document, section 10.5).
 *
 * Rules:
 *  - `review`: every wrong answer, ordered so that the most confident mistakes come first
 *    ('certain', then 'fairly-sure', then 'guessing'); ties are broken by slot number.
 *    A confident wrong answer suggests a firmly held misconception, so it is reviewed first.
 *  - `worthALook`: every correct answer given while 'guessing', ordered by slot. These are shown on
 *    the summary screen, because the student may have been lucky.
 *
 * @param {QuizResponse[]} responses
 * @returns {{
 *   review: {itemId: string, slot: number, outcome: string, confidence: string, misconception: string|null}[],
 *   worthALook: {itemId: string, slot: number, outcome: string}[]
 * }}
 */
export function planReview(responses) {
  // TODO(F-06)
  throw new Error('planReview is not implemented yet (backlog ticket F-06).');
}
