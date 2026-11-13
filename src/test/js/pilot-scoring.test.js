// Tests for scripts/pilot/scoring.js (ticket Q-01). Run with: npm test
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  COLUMNS, parseCsv, susScore, minutesBetween, median, scoreParticipant, evaluate, toMarkdown
} from '../../../scripts/pilot/scoring.js';

const row = overrides => {
  const base = {
    id: 'P1', round: 'one-to-one', pre_form: '1',
    pre1: '1', pre2: '0', pre3: '0', pre4: '0', pre5: '0',
    post1: '1', post2: '1', post3: '1', post4: '0', post5: '1',
    quiz_score: '6',
    sus1: '4', sus2: '2', sus3: '4', sus4: '2', sus5: '4', sus6: '2', sus7: '4', sus8: '2', sus9: '4', sus10: '2',
    start: '14:00', end: '14:22', confusing_screens: ''
  };
  return { ...base, ...overrides };
};

describe('susScore', () => {
  test('all neutral answers give 50', () => {
    assert.equal(susScore(Array(10).fill(3)), 50);
  });
  test('best possible answers give 100 and worst give 0', () => {
    assert.equal(susScore([5, 1, 5, 1, 5, 1, 5, 1, 5, 1]), 100);
    assert.equal(susScore([1, 5, 1, 5, 1, 5, 1, 5, 1, 5]), 0);
  });
  test('rejects missing or out-of-range answers', () => {
    assert.throws(() => susScore([3, 3, 3]));
    assert.throws(() => susScore(Array(10).fill(6)));
  });
});

describe('minutesBetween and median', () => {
  test('counts minutes across the hour', () => {
    assert.equal(minutesBetween('13:50', '14:12'), 22);
  });
  test('rejects end before start and bad formats', () => {
    assert.throws(() => minutesBetween('14:10', '14:00'));
    assert.throws(() => minutesBetween('2pm', '14:00'));
  });
  test('median handles odd and even counts', () => {
    assert.equal(median([30, 10, 20]), 20);
    assert.equal(median([10, 20, 30, 40]), 25);
  });
});

describe('parseCsv', () => {
  test('reads the header and skips comments and blank lines', () => {
    const csv = `${COLUMNS.join(',')}\n# example\n\n${COLUMNS.map(c => row()[c]).join(',')}\n`;
    const rows = parseCsv(csv);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].id, 'P1');
  });
  test('names missing columns', () => {
    assert.throws(() => parseCsv('id,round\nP1,x'), /missing columns/);
  });
});

describe('scoreParticipant', () => {
  test('totals the tests, SUS and time', () => {
    const p = scoreParticipant(row());
    assert.equal(p.pre, 1);
    assert.equal(p.post, 4);
    assert.equal(p.gain, 3);
    assert.equal(p.sus, 75);
    assert.equal(p.minutes, 22);
  });
  test('reports which participant has a bad value', () => {
    assert.throws(() => scoreParticipant(row({ id: 'P7', pre3: 'yes' })), /P7: pre3/);
  });
  test('allows SUS to be left blank (one-to-one sessions may skip it)', () => {
    const blank = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`sus${i + 1}`, '']));
    assert.equal(scoreParticipant(row(blank)).sus, null);
  });
});

describe('evaluate', () => {
  test('all criteria met for a good pilot', () => {
    const people = [row({ id: 'P1' }), row({ id: 'P2', confusing_screens: 'quiz' })].map(scoreParticipant);
    const { criteria } = evaluate(people);
    assert.ok(criteria.every(c => c.met === true), JSON.stringify(criteria));
  });
  test('flags a student who scored lower and a screen confusing to two people', () => {
    const people = [
      row({ id: 'P1', confusing_screens: 'worked-example' }),
      row({ id: 'P2', post1: '0', post2: '0', post3: '0', post5: '0', pre2: '1', confusing_screens: 'Worked-example; quiz' })
    ].map(scoreParticipant);
    const { criteria, screenCounts } = evaluate(people);
    assert.equal(criteria.find(c => c.name.startsWith('No student')).met, false);
    assert.equal(screenCounts['worked-example'], 2);
    assert.equal(criteria.find(c => c.name.startsWith('Screen')).met, false);
  });
  test('pass-mark reading says too high when one below the pass mark does as well as at it', () => {
    const people = [row({ id: 'A', quiz_score: '5' }), row({ id: 'B', quiz_score: '7' })].map((r) => scoreParticipant(r));
    const result = evaluate(people, { total: 8, passMark: 6 });
    assert.match(result.threshold.note, /5\/8 did as well as those at 6\/8/);
    assert.match(result.threshold.note, /too high/);
  });

  test('rejects a quiz score above the number of questions', () => {
    assert.throws(() => scoreParticipant(row({ quiz_score: '9' }), { total: 8, passMark: 6 }), /0\.\.8/);
  });

  test('the default quiz matches the shipped quiz bank', async () => {
    const { readFileSync } = await import('node:fs');
    const bank = JSON.parse(readFileSync(new URL('../../main/resources/static/data/quiz-bank.json', import.meta.url), 'utf8'));
    const { QUIZ } = await import('../../../scripts/pilot/scoring.js');
    assert.deepEqual(QUIZ, { total: new Set(bank.items.map((i) => i.slot)).size, passMark: bank.passMark });
  });
  test('markdown output contains every participant and verdict', () => {
    const people = [row({ id: 'P1' }), row({ id: 'P2' })].map(scoreParticipant);
    const md = toMarkdown(people, evaluate(people));
    assert.match(md, /\| P1 \|/);
    assert.match(md, /\| P2 \|/);
    assert.match(md, /Mean SUS/);
  });
});
