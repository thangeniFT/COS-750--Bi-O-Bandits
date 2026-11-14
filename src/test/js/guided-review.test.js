// Tests for the guided review after the quiz (ticket F-08): the engine helpers in
// static/js/quiz/quiz-engine.js and the content in static/data/guided-review.json.
// Run with: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  addSeen, gradeAnswer, nextStep, planReview, reviewOutcomes, scoreQuiz, selectItems
} from '../../main/resources/static/js/quiz/quiz-engine.js';

const load = (name) => JSON.parse(readFileSync(new URL(`../../main/resources/static/data/${name}.json`, import.meta.url), 'utf8'));
const bank = load('quiz-bank');
const trees = load('trees');
const review = load('guided-review');
const item = (id) => bank.items.find((i) => i.id === id);

/** A response as the quiz screen builds it. */
const response = (id, correct, confidence) => ({
  item: item(id), answer: 'x', confidence, result: { correct, feedback: '', misconception: null },
});

describe('reviewOutcomes', () => {
  test('lists each missed outcome once, most confident mistake first', () => {
    const plan = planReview([
      response('4A', false, 'guessing'),
      response('5A', false, 'certain'),
      response('6A', false, 'fairly-sure'),
      response('3A', false, 'certain'),
      response('1A', true, 'certain'),
    ]);
    // Certain mistakes by slot (3A, 5A), then fairly sure (6A), then guessing (4A).
    const expected = [...new Set(['3A', '5A', '6A', '4A'].map((id) => item(id).outcome))];
    assert.deepEqual(reviewOutcomes(plan), expected);
  });

  test('nothing to review when every answer is correct', () => {
    assert.deepEqual(reviewOutcomes(planReview([response('1A', true, 'guessing')])), []);
  });
});

describe('addSeen and selectItems: a new attempt uses unseen variants', () => {
  test('adds ids once, without changing the original list', () => {
    const before = ['1A'];
    const after = addSeen(before, [{ id: '1A' }, { id: '2A' }]);
    assert.deepEqual(after, ['1A', '2A']);
    assert.deepEqual(before, ['1A']);
  });

  test('the second attempt shows no item from the first where another variant exists', () => {
    const first = selectItems(bank, []);
    const seen = addSeen([], first);
    const second = selectItems(bank, seen);
    for (const next of second) {
      const variants = bank.items.filter((i) => i.slot === next.slot).length;
      if (variants > 1) assert.ok(!seen.includes(next.id), `slot ${next.slot} repeated ${next.id}`);
    }
  });
});

describe('nextStep: what the results screen offers', () => {
  const passMark = bank.passMark;
  const attempt = (correctCount) => bank.items
    .filter((i) => i.variant === 'A')
    .map((i, n) => response(i.id, n < correctCount, 'fairly-sure'));

  test('below the pass mark: guided review first, summary still offered', () => {
    const responses = attempt(passMark - 1);
    const step = nextStep(scoreQuiz(responses, passMark), reviewOutcomes(planReview(responses)));
    assert.deepEqual(step, { primary: 'review', offerReview: true, offerSummary: true });
  });

  test('at the pass mark: summary first, review of misses still offered', () => {
    const responses = attempt(passMark);
    const step = nextStep(scoreQuiz(responses, passMark), reviewOutcomes(planReview(responses)));
    assert.equal(step.primary, 'summary');
    assert.equal(step.offerSummary, true);
  });

  test('all correct: summary only', () => {
    const responses = attempt(99);
    const step = nextStep(scoreQuiz(responses, passMark), reviewOutcomes(planReview(responses)));
    assert.deepEqual(step, { primary: 'summary', offerReview: false, offerSummary: true });
  });
});

describe('guided-review.json', () => {
  test('LO1 replay follows the BST insert path for 65 (50 → 70 → 60)', () => {
    const steps = review.outcomes.LO1.replay.steps;
    assert.deepEqual(steps.map((st) => st.current), [50, 70, 60]);
    assert.ok(steps.every((st) => st.stack === undefined), 'an insert replay has no DFS stack');
  });

  const values = trees[review.tree].values;
  const outcomes = [...new Set(bank.items.map((i) => i.outcome))];

  test('every outcome in the quiz bank has review content', () => {
    for (const id of outcomes) assert.ok(review.outcomes[id], `no guided review for ${id}`);
  });

  test('each entry has a title, a screen link, an explanation and a hint', () => {
    for (const [id, entry] of Object.entries(review.outcomes)) {
      assert.ok(entry.title && entry.explain, `${id}: title or explain missing`);
      assert.match(entry.screen.route, /^#\//, `${id}: route should start with #/`);
      assert.match(entry.practice.hint, /^Hint 1/, `${id}: hint 1 should be labelled`);
    }
  });

  test('replay steps only use values from the review tree and every step has a reason', () => {
    for (const [id, entry] of Object.entries(review.outcomes)) {
      assert.ok(entry.replay.steps.length >= 2, `${id}: replay needs at least two steps`);
      for (const step of entry.replay.steps) {
        for (const v of [step.current, ...step.visited, ...(step.stack ?? [])]) {
          assert.ok(values.includes(v), `${id}: ${v} is not in tree ${review.tree}`);
        }
        assert.ok(step.reason, `${id}: a step has no reason`);
      }
    }
  });

  test('search replays match DFS search for 60 on Tree A (stack top first, checked against Java)', () => {
    // From DepthFirstSearch.search(Tree A, 60): node -> stackAfter (top first).
    const java = new Map([[50, [30, 70]], [30, [20, 40, 70]], [20, [40, 70]], [40, [70]], [70, [60, 80]], [60, [80]]]);
    for (const id of ['LO2', 'LO4', 'LO5']) {
      for (const step of review.outcomes[id].replay.steps) {
        assert.deepEqual(step.stack, java.get(step.current), `${id}: stack after visiting ${step.current}`);
      }
    }
  });

  test('easier questions have exactly one correct option, feedback everywhere, and grade with the engine', () => {
    for (const [id, entry] of Object.entries(review.outcomes)) {
      const options = entry.practice.options;
      assert.equal(options.filter((o) => o.correct).length, 1, `${id}: number of correct options`);
      assert.equal(new Set(options.map((o) => o.id)).size, options.length, `${id}: option ids`);
      const asItem = { id: `review-${id}`, type: 'choice', options };
      for (const option of options) {
        assert.ok(option.feedback, `${id}/${option.id} has no feedback`);
        assert.equal(gradeAnswer(asItem, option.id).correct, option.correct === true);
        if (option.misconception) assert.match(option.misconception, /^M[1-5]$/);
      }
    }
  });
});
