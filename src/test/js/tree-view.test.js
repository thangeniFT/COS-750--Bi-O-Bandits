// Tests for the pure layout function in static/js/components/tree-view.js.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { layoutTree } from '../../main/resources/static/js/components/tree-view.js';

/** Tree A as the API returns it (GET /api/tree). */
const n = (value, left = null, right = null) => ({ value, left, right });
const treeA = n(50, n(30, n(20), n(40)), n(70, n(60), n(80)));

describe('layoutTree', () => {
  test('an empty tree has no nodes but still has a size', () => {
    const layout = layoutTree(null);
    assert.equal(layout.nodes.length, 0);
    assert.ok(layout.width > 0 && layout.height > 0);
  });

  test('nodes are placed left to right in sorted order', () => {
    const { nodes } = layoutTree(treeA);
    assert.deepEqual(nodes.map((node) => node.value), [20, 30, 40, 50, 60, 70, 80]);
    const xs = nodes.map((node) => node.x);
    assert.deepEqual([...xs].sort((a, b) => a - b), xs);
  });

  test('depth decides the row, and each node knows its parent', () => {
    const byValue = new Map(layoutTree(treeA).nodes.map((node) => [node.value, node]));
    assert.equal(byValue.get(50).depth, 0);
    assert.equal(byValue.get(50).parent, null);
    assert.equal(byValue.get(70).depth, 1);
    assert.equal(byValue.get(80).parent, 70);
    assert.ok(byValue.get(80).y > byValue.get(70).y);
  });

  test('a left child is always drawn left of its parent, a right child to the right', () => {
    const byValue = new Map(layoutTree(treeA).nodes.map((node) => [node.value, node]));
    assert.ok(byValue.get(30).x < byValue.get(50).x);
    assert.ok(byValue.get(70).x > byValue.get(50).x);
    assert.ok(byValue.get(60).x < byValue.get(70).x);
  });
});
