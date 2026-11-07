/**
 * Remembers what the student has done in this browser tab: finished screens, whether the worked
 * example has been completed, and the quiz (seen questions, current attempt, last result).
 *
 * Why sessionStorage: the tutor has no accounts and records nothing (ID document, section 10).
 * sessionStorage keeps progress while the tab is open, survives a page refresh, and is wiped
 * when the tab closes. Nothing is ever sent to the server.
 *
 * Storage can be unavailable (private windows, blocked site data), so every access is wrapped in
 * try/catch and falls back to memory: the app then works normally but forgets on refresh.
 *
 * Status: implemented.
 * @module progress
 */

const KEY = 'cos212-dfs-tutor-v1';

/** Used when sessionStorage cannot be read or written. */
let memory = {};

/** @returns {Record<string, any>} the saved state, or an empty object */
function read() {
  try {
    const text = window.sessionStorage.getItem(KEY);
    return text ? JSON.parse(text) : { ...memory };
  } catch {
    return { ...memory };
  }
}

/** @param {Record<string, any>} state - the whole state to save */
function write(state) {
  memory = state;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage is blocked or full: keep the in-memory copy only.
  }
}

export const progress = {
  /**
   * @param {string} screenId - for example "learn/2"
   * @returns {boolean} true once the screen has been finished
   */
  isDone(screenId) {
    return (read().done ?? []).includes(screenId);
  },

  /**
   * Marks a screen as finished. Safe to call more than once.
   * @param {string} screenId
   */
  markDone(screenId) {
    const state = read();
    const done = new Set(state.done ?? []);
    done.add(screenId);
    write({ ...state, done: [...done] });
  },

  /**
   * Reads any other saved value, such as "explorerUnlocked" or "quiz".
   * @param {string} key
   * @returns {any} the value, or undefined
   */
  get(key) {
    return read()[key];
  },

  /**
   * Saves any other value. It must survive JSON.stringify.
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    write({ ...read(), [key]: value });
  },
};
