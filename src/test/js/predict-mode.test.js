// Specification for checkPrediction in static/js/components/predict-mode.js (backlog ticket F-05).
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { checkPrediction, HINTS, predictionOptions } from '../../main/resources/static/js/components/predict-mode.js';


/** The practice search for 55 on tree B (ID document, section 11.3), visit order only. */
const search55 = {
  order: 'PRE_ORDER', target: 55, found: true, nodesVisited: 7,
  visitOrder: [45, 25, 15, 35, 30, 65, 55],
  steps: [45, 25, 15, 35, 30, 65, 55].map((node, i) => ({ number: i + 1, node, stackAfter: [], explanation: '' })),
};

describe('checkPrediction', () => {
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

describe('predictionOptions', () => {
  // Tree B search for 55 with the real stacks (ID document, section 11.3).
  const stacks = [[25, 65], [15, 35, 65], [35, 65], [30, 65], [65], [55], []];
  const real = { ...search55, steps: search55.steps.map((s, i) => ({ ...s, stackAfter: stacks[i] })) };
  const treeB = [15, 25, 30, 35, 45, 55, 65];

  test('the correct node is always offered, with two others, in ascending order', () => {
    for (let step = 1; step < real.steps.length; step++) {
      const options = predictionOptions(real, step, treeB);
      assert.ok(options.includes(real.steps[step].node), `step ${step}`);
      assert.equal(options.length, 3, `step ${step}`);
      assert.deepEqual(options, [...options].sort((a, b) => a - b));
    }
  });

  test('nodes waiting on the stack are the first distractors (the wrong end of the stack)', () => {
    // After visiting 45 the stack is [25, 65]: 65 is the tempting wrong answer.
    assert.ok(predictionOptions(real, 1, treeB).includes(65));
  });
});

