// Tests for the URL parsing in static/js/app.js (the rest of app.js needs a browser).
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { parseHash } from '../../main/resources/static/js/app.js';

describe('parseHash', () => {
  test('a plain screen id', () => {
    const { id, params } = parseHash('#/learn/2');
    assert.equal(id, 'learn/2');
    assert.equal([...params].length, 0);
  });

  test('options after "?"', () => {
    const { id, params } = parseHash('#/explorer?tab=example');
    assert.equal(id, 'explorer');
    assert.equal(params.get('tab'), 'example');
  });

  test('an empty hash gives an empty id (app.js then shows home)', () => {
    assert.equal(parseHash('').id, '');
  });
});
