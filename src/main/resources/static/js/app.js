/**
 * Starts the tutor: loads the lesson content, then shows one screen at a time.
 *
 * How it works:
 *  - data/lesson.json lists the screens in order. Each has an `id` and a `type`.
 *  - The URL hash names the current screen (for example #/worked-example), so the browser's
 *    Back button and page refresh both work, and a screen can be linked to directly.
 *  - js/screens/index.js maps each `type` to a render function.
 *  - Back/Next move through the list. A screen can ask to block Next (for example the quiz,
 *    until it is finished) through ctx.setNextEnabled.
 *
 * Status: implemented. To add a new kind of screen, see js/screens/index.js rather than this file.
 * @module app
 */

import { loadData } from './api.js';
import { renderScreen } from './screens/index.js';
import { el } from './util.js';

const screenEl = document.getElementById('screen');
const mainEl = document.getElementById('main');
const backBtn = document.getElementById('nav-back');
const nextBtn = document.getElementById('nav-next');
const progressEl = document.getElementById('progress');
const progressLabel = document.getElementById('progress-label');

/** Everything loaded at start-up, plus the current position. */
const state = {
  /** @type {{title: string, screens: any[]}|null} */
  lesson: null,
  /** @type {Record<string, {label: string, values: number[]}>} */
  trees: {},
  index: 0,
  /** Clean-up function returned by the current screen (stops timers, listeners, ...). */
  cleanup: null,
};

/**
 * Finds the screen index named in the URL hash, or 0 if there is none or it is unknown.
 *
 * @returns {number}
 */
function indexFromHash() {
  const id = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  const index = state.lesson.screens.findIndex((screen) => screen.id === id);
  return index >= 0 ? index : 0;
}

/**
 * Moves to another screen by changing the hash; the hashchange listener then renders it.
 *
 * @param {number} index - position in lesson.screens; ignored if out of range
 */
function go(index) {
  if (index < 0 || index >= state.lesson.screens.length) return;
  window.location.hash = `#/${state.lesson.screens[index].id}`;
}

/**
 * Renders the screen at `index`: clears the old one, updates progress and navigation, calls the
 * screen's renderer and moves keyboard focus to the new heading for screen-reader users.
 *
 * @param {number} index
 */
function show(index) {
  if (typeof state.cleanup === 'function') state.cleanup();
  state.cleanup = null;
  state.index = index;

  const screens = state.lesson.screens;
  const screen = screens[index];

  // Progress bar and label
  progressEl.setAttribute('aria-valuemax', String(screens.length));
  progressEl.setAttribute('aria-valuenow', String(index + 1));
  progressEl.querySelector('.progress__bar').style.width = `${((index + 1) / screens.length) * 100}%`;
  progressLabel.textContent = `Screen ${index + 1} of ${screens.length}`;
  document.title = `${screen.title} · COS212 DFS Tutor`;

  backBtn.disabled = index === 0;
  nextBtn.disabled = index === screens.length - 1;

  /** Context passed to every screen renderer. */
  const ctx = {
    trees: state.trees,
    lesson: state.lesson,
    goNext: () => go(state.index + 1),
    setNextEnabled: (enabled) => { nextBtn.disabled = !enabled || index === screens.length - 1; },
  };

  screenEl.replaceChildren();
  state.cleanup = renderScreen(screen, screenEl, ctx) ?? null;

  const heading = screenEl.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

/** Loads content, wires up navigation and shows the first screen. */
async function start() {
  try {
    const [lesson, trees] = await Promise.all([loadData('lesson'), loadData('trees')]);
    state.lesson = lesson;
    state.trees = trees;
  } catch (error) {
    screenEl.replaceChildren(el('div', { class: 'message message--error', role: 'alert' },
      'The lesson could not be loaded. Check that the server is running and reload the page. ',
      el('code', {}, String(error.message))));
    backBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  backBtn.addEventListener('click', () => go(state.index - 1));
  nextBtn.addEventListener('click', () => go(state.index + 1));
  window.addEventListener('hashchange', () => show(indexFromHash()));
  show(indexFromHash());
  mainEl.focus();
}

start();
