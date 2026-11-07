/**
 * Maps each screen `type` in data/lesson.json to the module that draws it.
 *
 * Every screen module exports `render(screen, container, ctx)`:
 *  - `screen`    the screen's object from lesson.json
 *  - `container` an empty element to draw into
 *  - `ctx`       from app.js: { lesson, trees, screen, params, prev, next, go(id, params),
 *                goNext(), goBack(), markDone(), nextUnfinished(), lessonCount }
 * and may return a clean-up function, which app.js calls when the student leaves the screen
 * (stop timers, remove listeners).
 *
 * To add a new type of screen: create js/screens/<name>-screen.js exporting `render`, import it
 * here, add it to RENDERERS, and use the type in lesson.json.
 *
 * Status: implemented.
 * @module screens
 */

import { render as explorer } from './explorer-screen.js';
import { render as home } from './home-screen.js';
import { render as lesson } from './lesson-screen.js';
import { render as practice } from './practice-screen.js';
import { render as quiz } from './quiz-screen.js';
import { render as review } from './review-screen.js';
import { render as summary } from './summary-screen.js';
import { el } from '../util.js';

/** @type {Record<string, (screen: any, container: HTMLElement, ctx: any) => (void|(() => void))>} */
const RENDERERS = { home, lesson, explorer, practice, quiz, review, summary };

/** The screen types lesson.json may use. A test checks lesson.json against this list. */
export const SCREEN_TYPES = Object.freeze(Object.keys(RENDERERS));

/**
 * Draws one screen using the renderer for its type.
 *
 * @param {any} screen - the screen object from lesson.json
 * @param {HTMLElement} container - where to draw
 * @param {any} ctx - shared context from app.js
 * @returns {(() => void)|undefined} the renderer's clean-up function, if any
 */
export function renderScreen(screen, container, ctx) {
  const renderer = RENDERERS[screen.type];
  if (!renderer) {
    container.append(el('h1', {}, screen.title),
      el('div', { class: 'message message--error' }, `There is no renderer for screen type "${screen.type}". Add one in js/screens/index.js.`));
    return undefined;
  }
  return renderer(screen, container, ctx) ?? undefined;
}
