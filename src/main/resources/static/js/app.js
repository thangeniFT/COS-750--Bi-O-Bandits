/**
 * Starts the tutor: loads the content, draws the section menu, and shows one screen at a time.
 *
 * How it works:
 *  - data/lesson.json lists every screen in the recommended order ("the path"). Each screen has an
 *    `id` (which is also its URL, for example "learn/2"), a `section` (which menu item it belongs
 *    to) and a `type` (which file in js/screens draws it).
 *  - The URL hash names the current screen: #/learn/2. Extra options go after "?", for example
 *    #/explorer?tab=example. The browser's Back button, refresh and direct links all work.
 *  - Each screen draws its own Back/Next buttons (see renderFooter in screens/common.js). Next
 *    marks the screen as finished, so the menu can tick finished sections.
 *  - Screens with "inPath": false (the guided review) are reached from another screen, never by
 *    Next/Back.
 *
 * Status: implemented. To add a new kind of screen, see js/screens/index.js rather than this file.
 * @module app
 */

import { loadData } from './api.js';
import { progress } from './progress.js';
import { renderScreen } from './screens/index.js';
import { el } from './util.js';

// Page elements (null when this module is imported by a Node test).
const page = typeof document === 'undefined' ? null : document;
const screenEl = page?.getElementById('screen');
const mainEl = page?.getElementById('main');
const navEl = page?.getElementById('section-nav');

/** Everything loaded at start-up, plus the current position. */
const state = {
  /** @type {any} */
  lesson: null,
  /** @type {Record<string, {label: string, values: number[]}>} */
  trees: {},
  /** Screens in recommended order, without the ones marked "inPath": false. */
  path: [],
  /** Clean-up function returned by the current screen (stops timers, listeners, ...). */
  cleanup: null,
};

/**
 * Splits the URL hash into a screen id and options.
 *
 * @example parseHash('#/explorer?tab=example') // { id: 'explorer', params: URLSearchParams{tab: 'example'} }
 * @param {string} hash - window.location.hash
 * @returns {{id: string, params: URLSearchParams}}
 */
export function parseHash(hash) {
  const text = decodeURIComponent(String(hash).replace(/^#\/?/, ''));
  const [id, query = ''] = text.split('?');
  return { id, params: new URLSearchParams(query) };
}

/**
 * Builds a URL hash for a screen.
 *
 * @param {string} id - screen id, for example "quiz"
 * @param {Record<string, string>} [params] - options, for example { new: '1' }
 * @returns {string} for example "#/quiz?new=1"
 */
function hashFor(id, params) {
  const query = params ? new URLSearchParams(params).toString() : '';
  return `#/${id}${query ? `?${query}` : ''}`;
}

/**
 * True when every screen of a section that counts towards progress is finished.
 *
 * @param {string} sectionId
 * @returns {boolean}
 */
function sectionDone(sectionId) {
  const screens = state.lesson.screens.filter((s) => s.section === sectionId && s.countsForProgress !== false);
  return screens.length > 0 && screens.every((s) => progress.isDone(s.id));
}

/**
 * Draws the section menu: highlights the current section and ticks finished ones.
 *
 * @param {string} currentSection
 */
function renderNav(currentSection) {
  navEl.replaceChildren(...state.lesson.sections.map((section) => {
    const done = sectionDone(section.id);
    const current = section.id === currentSection;
    return el('li', {},
      el('a', {
        href: hashFor(section.start),
        class: `section-nav__link${current ? ' is-current' : ''}`,
        'aria-current': current ? 'page' : null,
      },
      section.label,
      done && el('span', { class: 'section-nav__done', 'aria-hidden': 'true' }, '✓'),
      done && el('span', { class: 'visually-hidden' }, ' (finished)')));
  }));
}

/**
 * The first screen in the path that is not finished yet: where "Start learning" leads.
 *
 * @returns {string} a screen id
 */
function nextUnfinished() {
  const screen = state.path.find((s) => s.id !== 'home' && !progress.isDone(s.id));
  return screen ? screen.id : 'summary';
}

/** Renders the screen named in the URL. Unknown ids show the home screen. */
function show() {
  if (typeof state.cleanup === 'function') state.cleanup();
  state.cleanup = null;

  const { id, params } = parseHash(window.location.hash);
  const screen = state.lesson.screens.find((s) => s.id === id) ?? state.lesson.screens[0];
  const pathIndex = state.path.indexOf(screen);

  const go = (targetId, targetParams) => {
    const hash = hashFor(targetId, targetParams);
    if (window.location.hash === hash) show();
    else window.location.hash = hash;
  };

  /** Context passed to every screen renderer. */
  const ctx = {
    lesson: state.lesson,
    trees: state.trees,
    screen,
    params,
    /** Previous and next screen in the path (null at either end, or for screens off the path). */
    prev: pathIndex > 0 ? state.path[pathIndex - 1] : null,
    next: pathIndex >= 0 && pathIndex < state.path.length - 1 ? state.path[pathIndex + 1] : null,
    go,
    goNext: () => { if (ctx.next) go(ctx.next.id); },
    goBack: () => { if (ctx.prev) go(ctx.prev.id); },
    /** Marks this screen as finished and updates the ticks in the menu. */
    markDone: () => { progress.markDone(screen.id); renderNav(screen.section); },
    nextUnfinished,
    /** Number of lesson screens and this screen's position among them (lesson screens only). */
    lessonCount: state.lesson.screens.filter((s) => s.type === 'lesson').length,
  };

  renderNav(screen.section);
  document.title = `${screen.title} · COS212 DFS Tutor`;
  screenEl.replaceChildren();
  state.cleanup = renderScreen(screen, screenEl, ctx) ?? null;

  window.scrollTo(0, 0);
  const heading = screenEl.querySelector('h1');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

/** Loads content, wires up navigation and shows the first screen. */
async function start() {
  try {
    const [lesson, trees] = await Promise.all([loadData('lesson'), loadData('trees')]);
    state.lesson = lesson;
    state.trees = trees;
    state.path = lesson.screens.filter((s) => s.inPath !== false);
  } catch (error) {
    screenEl.replaceChildren(el('div', { class: 'message message--error', role: 'alert' },
      'The lesson could not be loaded. Check that the server is running and reload the page. ',
      el('code', {}, String(error.message))));
    return;
  }
  window.addEventListener('hashchange', show);
  show();
  mainEl.focus({ preventScroll: true });
}

// Only start in a browser (lets Node tests import parseHash without a page).
if (screenEl) {
  start();
}
