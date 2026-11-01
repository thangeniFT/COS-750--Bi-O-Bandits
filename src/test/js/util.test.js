// Tests for static/js/util.js. Run with: npm test  (or: node --test "src/test/js/**/*.test.js")
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { escapeHtml, formatText, parseNumberList, parseWholeNumber } from '../../main/resources/static/js/util.js';

describe('escapeHtml', () => {
  test('escapes the characters that could start markup', () => {
    assert.equal(escapeHtml('<b>"x" & \'y\'</b>'), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
  });
});

describe('formatText', () => {
  test('turns **bold** and *italic* into tags', () => {
    assert.equal(formatText('Push **right** then *left*'), 'Push <strong>right</strong> then <em>left</em>');
  });

  test('never lets lesson text inject HTML', () => {
    assert.equal(formatText('**<img src=x>**'), '<strong>&lt;img src=x&gt;</strong>');
  });
});

describe('parseWholeNumber', () => {
  test('accepts whole numbers in range, ignoring spaces', () => {
    assert.deepEqual(parseWholeNumber(' 42 '), { ok: true, value: 42 });
    assert.deepEqual(parseWholeNumber(0), { ok: true, value: 0 });
  });

  test('rejects empty input, text, decimals and out-of-range values with a message', () => {
    for (const input of ['', 'abc', '3.5', '1e2', '150', '-1']) {
      const result = parseWholeNumber(input);
      assert.equal(result.ok, false, `expected "${input}" to be rejected`);
      assert.ok(result.message.length > 0);
    }
  });

  test('uses a custom range when given', () => {
    assert.equal(parseWholeNumber('150', { min: 0, max: 200 }).ok, true);
  });
});

describe('parseNumberList', () => {
  test('accepts commas, spaces or both', () => {
    assert.deepEqual(parseNumberList('20, 30 40,50'), { ok: true, values: [20, 30, 40, 50] });
  });

  test('rejects an empty list and non-numbers', () => {
    assert.equal(parseNumberList('').ok, false);
    assert.equal(parseNumberList('20, x, 40').ok, false);
  });
});
