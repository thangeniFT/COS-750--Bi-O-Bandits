/**
 * Maps each screen `type` in data/lesson.json to the module that draws it.
 *
 * Every screen module exports `render(screen, container, ctx)`:
 *  - `screen`    the screen's object from lesson.json
 *  - `container` an empty element to draw into
 *  - `ctx`       { trees, lesson, goNext(), setNextEnabled(boolean) } from app.js
 * and may return a clean-up function, which app.js calls when the student leaves the screen.
 *
 * To add a new type of screen: create js/screens/<name>-screen.js exporting `render`, import it
 * here, add it to RENDERERS, and use the type in lesson.json.
 *
 * Status: implemented.
 * @module screens
 */
import { render as welcome } from './welcome-screen.js';
import { render as bst } from './bst-screen.js';
import { render as dfs } from './dfs-screen.js';
import { render as choice } from './choice-screen.js';
import { render as explorer } from './explorer-screen.js';
import { render as practice } from './practice-screen.js';
import { render as quiz } from './quiz-screen.js';
import { render as text } from './text-screen.js';
import { render as warmup } from './warmup-screen.js';
import { render as review } from './review-screen.js';
import { renderHeader } from './common.js';
import { render as summary } from './summary-screen.js';
import { placeholder } from '../util.js';



/** @type {Record<string, (screen: any, container: HTMLElement, ctx: any) => (void|(() => void))>} */
const RENDERERS = { welcome,bst, dfs, choice, explorer, warmup, practice, quiz,text, review, summary };

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
    renderHeader(screen, container);
    container.append(placeholder('?', `There is no renderer for screen type "${screen.type}". Add one in js/screens/index.js.`));
    return undefined;
  }
  return renderer(screen, container, ctx) ?? undefined;
}
