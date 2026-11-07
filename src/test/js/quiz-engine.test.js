// Specification for static/js/quiz/quiz-engine.js (backlog ticket F-06).
// The tests use the real quiz bank, so they also catch content mistakes.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { gradeAnswer, planReview, scoreQuiz, selectItems } from '../../main/resources/static/js/quiz/quiz-engine.js';

const bank = JSON.parse(readFileSync(new URL('../../main/resources/static/data/quiz-bank.json', import.meta.url), 'utf8'));
const item = (id) => bank.items.find((i) => i.id === id);

/** Builds a response as the quiz screen would. */
const response = (id, correct, confidence) => ({
  item: item(id), answer: 'x', confidence, result: { correct, feedback: '', misconception: null },
});

describe('selectItems', () => {
  test('first attempt: variant A of every slot, in slot order', () => {
    assert.deepEqual(selectItems(bank).map((i) => i.id), ['1A', '2A', '3A', '4A', '5A', '6A']);
  });

  test('retry: a variant the student has not seen', () => {
    const seen = ['1A', '2A', '3A', '4A', '5A', '6A'];
    assert.deepEqual(selectItems(bank, seen).map((i) => i.id), ['1B', '2B', '3B', '4B', '5B', '6B']);
  });

  test('when every variant of a slot has been seen, variant A comes back', () => {
    const seen = ['1A', '1B', '2A'];
    assert.deepEqual(selectItems(bank, seen).map((i) => i.id), ['1A', '2B', '3A', '4A', '5A', '6A']);
  });
});

describe('gradeAnswer: choice items', () => {
  test('the correct option', () => {
    assert.deepEqual(gradeAnswer(item('1A'), 'a'), {
      correct: true, feedback: item('1A').options[0].feedback, misconception: null,
    });
  });

  test('a wrong option returns its own feedback and misconception', () => {
    const result = gradeAnswer(item('1A'), 'b');
    assert.equal(result.correct, false);
    assert.equal(result.misconception, 'M1');
    assert.match(result.feedback, /queue/i);
  });

  test('a wrong option without a misconception tag gives null', () => {
    assert.equal(gradeAnswer(item('1A'), 'd').misconception, null);
  });

  test('an unknown option id is a programming error', () => {
    assert.throws(() => gradeAnswer(item('1A'), 'z'));
  });
});

describe('gradeAnswer: order items', () => {
  test('the exact answer is correct', () => {
    const result = gradeAnswer(item('3A'), [50, 30, 20, 40, 70, 60, 80]);
    assert.equal(result.correct, true);
    assert.equal(result.feedback, item('3A').correctFeedback);
  });

  test('a known wrong order (in-order instead of pre-order) gets the rule feedback', () => {
    const result = gradeAnswer(item('3A'), [20, 30, 40, 50, 60, 70, 80]);
    assert.equal(result.correct, false);
    assert.equal(result.misconception, 'M3');
    assert.match(result.feedback, /in-order/);
  });

  test('any other wrong order names the first wrong position', () => {
    const result = gradeAnswer(item('3A'), [50, 30, 40, 20, 70, 60, 80]);
    assert.equal(result.correct, false);
    assert.equal(result.misconception, null);
    assert.match(result.feedback, /Position 3 should be 20/);
  });

  test('a short answer counts the first missing position as wrong', () => {
    assert.match(gradeAnswer(item('3A'), [50, 30]).feedback, /Position 3 should be 20/);
  });
});

describe('scoreQuiz', () => {
  const responses = (correctCount) => ['1A', '2A', '3A', '4A', '5A', '6A']
    .map((id, index) => response(id, index < correctCount, 'certain'));

  test('4 out of 6 passes with the default pass mark', () => {
    assert.deepEqual(scoreQuiz(responses(4)), { correct: 4, total: 6, passed: true });
  });

  test('3 out of 6 does not pass', () => {
    assert.equal(scoreQuiz(responses(3)).passed, false);
  });

  test('a custom pass mark is respected', () => {
    assert.equal(scoreQuiz(responses(4), 5).passed, false);
  });
});

describe('planReview', () => {
  test('wrong answers are reviewed most-confident first, then by slot', () => {
    const plan = planReview([
      response('1A', false, 'guessing'),
      response('2A', false, 'certain'),
      response('3A', true, 'certain'),
      response('4A', false, 'fairly-sure'),
      response('5A', false, 'certain'),
      response('6A', true, 'guessing'),
    ]);
    assert.deepEqual(plan.review.map((r) => r.itemId), ['2A', '5A', '4A', '1A']);
    assert.deepEqual(plan.review[0], { itemId: '2A', slot: 2, outcome: 'LO2', confidence: 'certain', misconception: null });
  });

  test('correct answers given while guessing are listed as worth a look', () => {
    const plan = planReview([response('1A', true, 'guessing'), response('2A', true, 'certain')]);
    assert.deepEqual(plan.worthALook, [{ itemId: '1A', slot: 1, outcome: 'LO1' }]);
    assert.deepEqual(plan.review, []);
  });
});
