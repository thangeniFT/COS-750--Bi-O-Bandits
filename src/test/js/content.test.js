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

const ORDERS = ['PRE_ORDER', 'IN_ORDER', 'POST_ORDER'];
const screenIds = new Set(lesson.screens.map((s) => s.id));
/** "explorer?tab=example" -> "explorer" */
const screenOf = (target) => target.split('?')[0];
const inRange = (v) => Number.isInteger(v) && v >= 0 && v <= 99;

describe('lesson.json', () => {
  test('every screen has a unique id, a title, a short title, a known type and a known section', () => {
    const ids = new Set();
    const sections = new Set(lesson.sections.map((s) => s.id));
    for (const screen of lesson.screens) {
      assert.ok(screen.id && !ids.has(screen.id), `duplicate or missing id: ${screen.id}`);
      ids.add(screen.id);
      assert.ok(screen.title && screen.shortTitle, `screen ${screen.id} needs a title and a shortTitle`);
      assert.ok(SCREEN_TYPES.includes(screen.type), `screen ${screen.id} has unknown type "${screen.type}"`);
      assert.ok(sections.has(screen.section), `screen ${screen.id} has unknown section "${screen.section}"`);
    }
  });

  test('every menu section starts at a screen that exists', () => {
    for (const section of lesson.sections) assert.ok(screenIds.has(section.start), section.id);
  });

  test('lessons are numbered 1, 2, 3, ... in path order', () => {
    const numbers = lesson.screens.filter((s) => s.type === 'lesson').map((s) => s.lesson);
    assert.deepEqual(numbers, numbers.map((_, i) => i + 1));
  });

  test('quick checks have exactly one correct option, unique ids and feedback on every option', () => {
    for (const screen of lesson.screens.filter((s) => s.quickCheck)) {
      const { options, position } = screen.quickCheck;
      assert.equal(options.filter((o) => o.correct).length, 1, `${screen.id}: number of correct options`);
      assert.equal(new Set(options.map((o) => o.id)).size, options.length, `${screen.id}: option ids`);
      for (const option of options) assert.ok(option.feedback, `${screen.id}/${option.id} has no feedback`);
      assert.ok(['start', 'end'].includes(position), `${screen.id}: position must be start or end`);
    }
  });

  test('figures, the explorer, the home preview and practice use trees that exist and valid settings', () => {
    for (const screen of lesson.screens) {
      const uses = [screen.figure, screen.example, screen.preview, screen.type === 'practice' ? screen : null].filter(Boolean);
      for (const part of uses.filter((u) => u.tree)) {
        assert.ok(trees[part.tree], `${screen.id} uses unknown tree "${part.tree}"`);
      }
      const figure = screen.figure;
      if (!figure) continue;
      assert.ok(['tree', 'dfs', 'code'].includes(figure.kind), `${screen.id}: unknown figure kind "${figure.kind}"`);
      if (figure.kind === 'dfs') {
        assert.ok(figure.search !== undefined || ORDERS.includes(figure.order), `${screen.id}: a dfs figure needs search or order`);
        if (figure.search !== undefined) assert.ok(inRange(figure.search), `${screen.id}: search target out of range`);
      }
      if (figure.kind === 'tree' && figure.labels) {
        for (const value of Object.keys(figure.labels)) {
          assert.ok(trees[figure.tree].values.includes(Number(value)), `${screen.id}: label for ${value}, which is not in the tree`);
        }
      }
    }
    for (const target of [lesson.screens.find((s) => s.type === 'explorer').example.target,
      lesson.screens.find((s) => s.type === 'practice').target]) {
      assert.ok(inRange(target));
    }
  });

  test('the guided review is off the path, and the screens other screens link to exist', () => {
    for (const id of ['home', 'quiz', 'quiz/review', 'summary', 'explorer']) assert.ok(screenIds.has(id), id);
    assert.equal(lesson.screens.find((s) => s.id === 'quiz/review').inPath, false);
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

  test('every item has three hints and an outcome with a label, a "can do" line and a review link that exists', () => {
    for (const item of bank.items) {
      assert.equal(item.hints?.length, 3, `${item.id} needs three hints`);
      const outcome = bank.outcomes[item.outcome];
      assert.ok(outcome?.label && outcome.canDo, `${item.id}: outcome ${item.outcome} is missing or incomplete`);
      assert.ok(screenIds.has(screenOf(outcome.review.screen)), `${item.outcome}: review screen "${outcome.review.screen}" does not exist`);
    }
  });
});
