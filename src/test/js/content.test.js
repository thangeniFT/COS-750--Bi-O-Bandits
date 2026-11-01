// Checks the content files in static/data so that a typo in lesson.json or quiz-bank.json is
// caught by CI instead of on screen during the demo. Run this after every content change.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { SCREEN_TYPES } from '../../main/resources/static/js/screens/index.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../../main/resources/static/data/${name}.json`, import.meta.url), 'utf8'));

const lesson = load('lesson');
const trees = load('trees');
const bank = load('quiz-bank');
const sameValues = (a, b) => JSON.stringify([...a].sort((x, y) => x - y)) === JSON.stringify([...b].sort((x, y) => x - y));

describe('lesson.json', () => {
  test('every screen has a unique id, a title and a known type', () => {
    const ids = new Set();
    for (const screen of lesson.screens) {
      assert.ok(screen.id && !ids.has(screen.id), `duplicate or missing id: ${screen.id}`);
      ids.add(screen.id);
      assert.ok(screen.title, `screen ${screen.id} has no title`);
      assert.ok(SCREEN_TYPES.includes(screen.type), `screen ${screen.id} has unknown type "${screen.type}"`);
    }
  });

  test('screens refer only to trees that exist', () => {
    for (const screen of lesson.screens.filter((s) => s.tree)) {
      assert.ok(screen.tree === 'sandbox' || trees[screen.tree], `screen ${screen.id} uses unknown tree "${screen.tree}"`);
    }
  });

  test('search targets are within 0..99', () => {
    for (const screen of lesson.screens.filter((s) => s.target !== undefined)) {
      assert.ok(Number.isInteger(screen.target) && screen.target >= 0 && screen.target <= 99, screen.id);
    }
  });
});

describe('trees.json', () => {
  test('each tree has 1 to 15 distinct values in 0..99', () => {
    for (const [id, tree] of Object.entries(trees).filter(([key]) => !key.startsWith('_'))) {
      assert.ok(tree.values.length >= 1 && tree.values.length <= 15, id);
      assert.equal(new Set(tree.values).size, tree.values.length, `${id} has duplicates`);
      assert.ok(tree.values.every((v) => Number.isInteger(v) && v >= 0 && v <= 99), id);
    }
  });
});

describe('quiz-bank.json', () => {
  test('item ids are unique', () => {
    const ids = bank.items.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test('slots 1 to 6 each have at least two variants (for retries)', () => {
    for (let slot = 1; slot <= 6; slot++) {
      const count = bank.items.filter((item) => item.slot === slot).length;
      assert.ok(count >= 2, `slot ${slot} has ${count} variant(s)`);
    }
  });

  test('choice items have exactly one correct option, unique option ids and feedback on every option', () => {
    for (const item of bank.items.filter((i) => i.type === 'choice')) {
      assert.equal(item.options.filter((o) => o.correct).length, 1, `${item.id}: number of correct options`);
      assert.equal(new Set(item.options.map((o) => o.id)).size, item.options.length, `${item.id}: option ids`);
      for (const option of item.options) assert.ok(option.feedback, `${item.id}/${option.id} has no feedback`);
    }
  });

  test('order items use exactly the values of their tree, and rules never equal the answer', () => {
    for (const item of bank.items.filter((i) => i.type === 'order')) {
      const values = trees[item.tree].values;
      assert.ok(sameValues(item.answer, values), `${item.id}: answer is not a permutation of tree ${item.tree}`);
      assert.ok(item.correctFeedback && item.fallbackFeedback, `${item.id}: missing feedback`);
      for (const rule of item.rules) {
        assert.ok(sameValues(rule.match, values), `${item.id}: a rule uses values not in the tree`);
        assert.notDeepEqual(rule.match, item.answer, `${item.id}: a rule matches the correct answer`);
      }
    }
  });

  test('misconception tags are M1 to M5', () => {
    const tags = bank.items.flatMap((item) => [...(item.options ?? []), ...(item.rules ?? [])])
      .map((entry) => entry.misconception).filter(Boolean);
    for (const tag of tags) assert.match(tag, /^M[1-5]$/);
  });
});
