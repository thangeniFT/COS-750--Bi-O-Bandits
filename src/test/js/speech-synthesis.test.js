import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  pauseSpeech,
  resumeSpeech,
  speakText,
  stopSpeech,
} from '../../main/resources/static/js/components/speech-synthesis.js';

describe('speech synthesis', () => {
  test('speaks formatted lesson text and cancels playback when stopped', () => {
    const spoken = [];
    let cancelled = false;
    let paused = false;

    class MockUtterance {
      constructor(text) {
        this.text = text;
      }
    }

    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        SpeechSynthesisUtterance: MockUtterance,
        speechSynthesis: {
          speaking: true,
          get paused() { return paused; },
          speak: (utterance) => spoken.push(utterance),
          cancel: () => { cancelled = true; },
          pause: () => { paused = true; },
          resume: () => { paused = false; },
        },
      },
    });

    try {
      assert.equal(speakText('Read **this** aloud.', { rate: 1.25 }), true);
      assert.equal(spoken[0].text, 'Read this aloud.');
      assert.equal(spoken[0].rate, 1.25);
      assert.equal(pauseSpeech(), true);
      assert.equal(resumeSpeech(), true);
      assert.equal(speakText('This uses the slower default.'), true);
      assert.equal(spoken[1].rate, 0.65);
      stopSpeech();
      assert.equal(cancelled, true);
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow);
      } else {
        delete globalThis.window;
      }
    }
  });

  test('does not start playback for blank text or unsupported browsers', () => {
    assert.equal(speakText('   '), false);
    assert.equal(speakText('Some text'), false);
  });
});
