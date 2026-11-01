/**
 * Small helpers shared by every screen.
 *
 * Everything here except {@link el} is a pure function with no access to the page, so it can be
 * unit-tested with Node (see src/test/js/util.test.js).
 *
 * Status: implemented.
 * @module util
 */

/**
 * Escapes text so it can be placed inside HTML without being treated as markup.
 * Always use this (or {@link formatText}) before putting lesson or API text into innerHTML.
 *
 * @param {unknown} text - any value; it is converted to a string first
 * @returns {string} the escaped text
 */
export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * Turns lesson text into safe HTML. Supports two markers used in data/lesson.json and
 * data/quiz-bank.json: **bold** and *italic*. Everything else is escaped.
 *
 * @example formatText('Push **right** first') // 'Push <strong>right</strong> first'
 * @param {string} text - lesson text
 * @returns {string} HTML that is safe to assign to innerHTML
 */
export function formatText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/**
 * Checks a whole number typed by a student, before anything is sent to the server.
 * The server checks again; this only gives faster, friendlier feedback (NFR-04).
 *
 * @param {string|number|null|undefined} input - the raw text from an input box
 * @param {{min?: number, max?: number}} [range] - allowed range, 0 to 99 by default (BR-1)
 * @returns {{ok: true, value: number} | {ok: false, message: string}}
 */
export function parseWholeNumber(input, { min = 0, max = 99 } = {}) {
  const text = String(input ?? '').trim();
  if (text === '') {
    return { ok: false, message: 'Type a whole number first.' };
  }
  if (!/^-?\d+$/.test(text)) {
    return { ok: false, message: `"${text}" is not a whole number. Use digits only, for example 42.` };
  }
  const value = Number(text);
  if (value < min || value > max) {
    return { ok: false, message: `${value} is out of range. Use a whole number from ${min} to ${max}.` };
  }
  return { ok: true, value };
}

/**
 * Reads a typed list such as "20, 30, 40" or "20 30 40". This is the keyboard alternative to
 * drag-and-drop ordering tasks (ID document, section 7.1).
 *
 * @param {string} input - the raw text
 * @returns {{ok: true, values: number[]} | {ok: false, message: string}}
 */
export function parseNumberList(input) {
  const parts = String(input ?? '').split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) {
    return { ok: false, message: 'Type the values in order, separated by commas.' };
  }
  const bad = parts.find((part) => !/^-?\d+$/.test(part));
  if (bad !== undefined) {
    return { ok: false, message: `"${bad}" is not a whole number.` };
  }
  return { ok: true, values: parts.map(Number) };
}

/**
 * Creates a DOM element in one line. Keys starting with "on" become event listeners, "class"
 * sets the class name, and everything else becomes an attribute. Children may be strings
 * (added as text, never as HTML) or elements; null and false are skipped.
 *
 * @example el('button', { class: 'btn', onclick: next }, 'Next')
 * @param {string} tag - element name
 * @param {Record<string, any>} [attributes]
 * @param {...(Node|string|null|false|undefined)} children
 * @returns {HTMLElement}
 */
export function el(tag, attributes = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'class') {
      element.className = value;
    } else {
      element.setAttribute(key, value === true ? '' : String(value));
    }
  }
  for (const child of children) {
    if (child === undefined || child === null || child === false) continue;
    element.append(child);
  }
  return element;
}

/**
 * Creates a paragraph from lesson text, applying {@link formatText}.
 *
 * @param {string} text - lesson text with optional **bold** / *italic*
 * @returns {HTMLParagraphElement}
 */
export function paragraph(text) {
  const p = document.createElement('p');
  p.innerHTML = formatText(text);
  return p;
}

/**
 * Creates the dashed "not built yet" box used by screens and components whose backlog ticket is
 * still open. Search the code for `placeholder(` to see what is left to do.
 *
 * @param {string} ticket - the backlog ticket id, for example "F-02"
 * @param {string} what - a short description of what will appear here
 * @returns {HTMLElement}
 */
export function placeholder(ticket, what) {
  return el('div', { class: 'placeholder', role: 'note' },
    el('strong', {}, `Not built yet (${ticket}). `), what);
}
