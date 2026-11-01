// Specification for checkPrediction in static/js/components/predict-mode.js (backlog ticket F-05).
// Skipped until the ticket is picked up: delete the `skip` option and make the tests pass.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { checkPrediction, HINTS } from '../../main/resources/static/js/components/predict-mode.js';

const SKIP = 'Backlog ticket F-05 (predict mode): remove this skip when you start the ticket';

/** The practice search for 55 on tree B (ID document, section 11.3), visit order only. */
const search55 = {
  order: 'PRE_ORDER', target: 55, found: true, nodesVisited: 7,
  visitOrder: [45, 25, 15, 35, 30, 65, 55],
  steps: [45, 25, 15, 35, 30, 65, 55].map((node, i) => ({ number: i + 1, node, stackAfter: [], explanation: '' })),
};

describe('checkPrediction', { skip: SKIP }, () => {
  test('a correct guess is confirmed and revealed', () => {
    const feedback = checkPrediction(search55, 1, 25, 1);
    assert.equal(feedback.correct, true);
    assert.equal(feedback.hintLevel, 0);
    assert.equal(feedback.reveal, true);
    assert.match(feedback.message, /25/);
  });

  test('wrong guesses climb the hint ladder and reveal at level 3', () => {
    const first = checkPrediction(search55, 1, 65, 1);
    assert.deepEqual([first.correct, first.hintLevel, first.reveal], [false, 1, false]);
    assert.equal(first.message, HINTS[1]);

    assert.equal(checkPrediction(search55, 1, 65, 2).hintLevel, 2);

    const third = checkPrediction(search55, 1, 65, 3);
    assert.deepEqual([third.hintLevel, third.reveal], [3, true]);
    assert.match(third.message, /The next node is 25/);
  });

  test('the ladder stops at level 3', () => {
    assert.equal(checkPrediction(search55, 1, 65, 7).hintLevel, 3);
  });
});
