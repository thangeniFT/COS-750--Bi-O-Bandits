// Specification for stateForStep in static/js/components/step-player.js (backlog ticket F-02).
// Skipped until the ticket is picked up: delete the `skip` option and make the tests pass.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { stateForStep } from '../../main/resources/static/js/components/step-player.js';

const SKIP = 'Backlog ticket F-02 (step player): remove this skip when you start the ticket';

/** Builds a DfsResult like the server's, from (node, stackAfter) pairs. */
const result = (order, target, found, pairs) => ({
  order,
  target,
  found,
  visitOrder: pairs.map(([node]) => node),
  nodesVisited: pairs.length,
  steps: pairs.map(([node, stackAfter], i) => ({ number: i + 1, node, stackAfter, explanation: '' })),
});

/** The search for 60 on tree A (SE document, table 1). */
const search60 = result('PRE_ORDER', 60, true, [
  [50, [30, 70]], [30, [20, 40, 70]], [20, [40, 70]], [40, [70]], [70, [60, 80]], [60, [80]],
]);

/** The search for 65 (not found) on tree A. */
const search65 = result('PRE_ORDER', 65, false, [
  [50, [30, 70]], [30, [20, 40, 70]], [20, [40, 70]], [40, [70]], [70, [60, 80]], [60, [80]], [80, []],
]);

/** In-order traversal of tree A: stackAfter is the path from the root, top first. */
const inOrder = result('IN_ORDER', null, false, [
  [20, [20, 30, 50]], [30, [30, 50]], [40, [40, 30, 50]], [50, [50]], [60, [60, 70, 50]], [70, [70, 50]], [80, [80, 70, 50]],
]);

const asObject = (map) => Object.fromEntries([...map.entries()].sort(([a], [b]) => a - b));

describe('stateForStep', { skip: SKIP }, () => {
  test('before the first step only the root is shown, waiting on the stack', () => {
    assert.deepEqual(asObject(stateForStep(search60, -1, 50)), { 50: 'on-stack' });
  });

  test('after step 2 of the search for 60 (the documented example)', () => {
    assert.deepEqual(asObject(stateForStep(search60, 1, 50)),
      { 20: 'on-stack', 30: 'current', 40: 'on-stack', 50: 'visited', 70: 'on-stack' });
  });

  test('the last step of a successful search shows the target as found', () => {
    assert.deepEqual(asObject(stateForStep(search60, 5, 50)),
      { 20: 'visited', 30: 'visited', 40: 'visited', 50: 'visited', 60: 'found', 70: 'visited', 80: 'on-stack' });
  });

  test('the last step of an unsuccessful search is just the current node', () => {
    assert.equal(stateForStep(search65, 6, 50).get(80), 'current');
  });

  test('in a traversal, ancestors not yet recorded are on the stack; recorded ones are visited', () => {
    assert.deepEqual(asObject(stateForStep(inOrder, 0, 50)), { 20: 'current', 30: 'on-stack', 50: 'on-stack' });
    assert.deepEqual(asObject(stateForStep(inOrder, 2, 50)), { 20: 'visited', 30: 'visited', 40: 'current', 50: 'on-stack' });
  });
});
