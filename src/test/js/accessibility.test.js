// Tests for the accessibility helpers in static/js/util.js (ticket F-12). Run with: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { describeNodeTag, nameTreeNode } from '../../main/resources/static/js/util.js';

/** A stand-in for an SVG <g> holding <text> elements, enough for nameTreeNode. */
function fakeNode(...texts) {
  const parts = texts.map((t) => ({ textContent: t }));
  const attrs = {};
  return {
    parts,
    attrs,
    querySelectorAll: () => parts,
    setAttribute: (k, v) => { attrs[k] = v; },
  };
}

describe('nameTreeNode (WCAG 2.5.3 label in name)', () => {
  test('the name starts with the words shown on the node', () => {
    const g = fakeNode('20', 'LEAF');
    nameTreeNode(g, 'Left child of 30.');
    assert.equal(g.attrs['aria-label'], '20 LEAF. Left child of 30.');
  });

  test('visible pieces are kept apart with a trailing space, except the last', () => {
    const g = fakeNode('45', 'NOW');
    nameTreeNode(g);
    assert.deepEqual(g.parts.map((p) => p.textContent), ['45 ', 'NOW']);
  });

  test('empty tags are ignored and calling twice adds no extra spaces', () => {
    const g = fakeNode('62', '');
    nameTreeNode(g, 'Root.');
    nameTreeNode(g, 'Root.');
    assert.equal(g.attrs['aria-label'], '62. Root.');
    assert.equal(g.parts[0].textContent, '62');
  });
});

describe('describeNodeTag', () => {
  test('explains every short tag drawn under a node', () => {
    for (const tag of ['NOW', 'WAIT', 'FIXED', 'PICKED', 'NEW', '✓', '✕', '#3']) {
      assert.ok(describeNodeTag(tag), `no description for ${tag}`);
    }
    assert.equal(describeNodeTag('#3'), 'Number 3 in the order.');
    assert.equal(describeNodeTag(''), '');
  });
});
