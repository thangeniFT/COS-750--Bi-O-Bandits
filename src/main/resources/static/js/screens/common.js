/**
 * Pieces shared by several screens: the page header (eyebrow, title, subtitle), progress bars,
 * cards, answer buttons, footer navigation and error messages. Keeping them here means every
 * screen looks the same and the wireframe styles live in one place.
 *
 * Status: implemented.
 * @module screens/common
 */

import { el, formatText, paragraph } from '../util.js';

/**
 * Creates an element whose content is lesson text with **bold** / *italic*.
 *
 * @param {string} tag - for example 'p' or 'span'
 * @param {Record<string, any>} attributes
 * @param {string} text - lesson text
 * @returns {HTMLElement}
 */
export function richText(tag, attributes, text) {
  const element = el(tag, attributes);
  element.innerHTML = formatText(text);
  return element;
}

/**
 * Draws the top of a page (wireframes: small grey eyebrow, big title, grey subtitle).
 *
 * @param {HTMLElement} container
 * @param {{eyebrow?: string, title: string, subtitle?: string, body?: string[]}} parts
 */
export function renderPageHeader(container, { eyebrow, title, subtitle, body = [] }) {
  if (eyebrow) container.append(el('p', { class: 'eyebrow' }, eyebrow));
  container.append(el('h1', { class: 'page-title' }, title));
  if (subtitle) container.append(richText('p', { class: 'subtitle' }, subtitle));
  for (const text of body) container.append(paragraph(text));
}

/**
 * A progress bar with a caption, for lessons and the quiz.
 *
 * @param {number} value - how far along (1-based)
 * @param {number} max - total
 * @param {string} label - caption under the bar, for example "Lesson 1 of 6 • Introduction to trees"
 * @returns {HTMLElement}
 */
export function progressBar(value, max, label) {
  const labelId = `progress-${Math.random().toString(36).slice(2, 8)}`;
  return el('div', { class: 'progress' },
    el('div', {
      class: 'progress__track',
      role: 'progressbar',
      'aria-valuemin': 0,
      'aria-valuemax': max,
      'aria-valuenow': value,
      'aria-labelledby': labelId,
    }, el('div', { class: 'progress__bar', style: `width:${Math.round((value / max) * 100)}%` })),
    el('div', { class: 'progress__label', id: labelId }, label));
}

/**
 * A white (or grey) card with an optional title.
 *
 * @param {{title?: string, label?: string, alt?: boolean, className?: string}} options
 *        title: big heading; label: small grey uppercase heading; alt: grey background
 * @param {...(Node|string|null|false|undefined)} children
 * @returns {HTMLElement}
 */
export function card({ title, label, alt = false, className = '' }, ...children) {
  return el('section', { class: `card${alt ? ' card--alt' : ''} ${className}`.trim() },
    label && el('p', { class: 'card__label' }, label),
    title && el('h2', { class: 'card__title' }, title),
    ...children);
}

/**
 * A group of answer buttons ("A. Node 25"). Only one can be chosen at a time.
 *
 * @param {{id: string, text: string}[]} options - id is returned to onChoose; text may use **bold**
 * @param {(id: string) => void} onChoose
 * @param {{letters?: boolean, label?: string, inline?: boolean}} [settings] - letters: prefix A., B., ...;
 *        label: accessible name for the group; inline: lay the buttons out in a row
 * @returns {{element: HTMLElement, select: (id: string|null) => void, mark: (id: string, kind: 'correct'|'wrong') => void, lock: () => void}}
 */
export function choiceGroup(options, onChoose, { letters = true, label = 'Answers', inline = false } = {}) {
  const buttons = options.map((option, i) => {
    const button = el('button', { type: 'button', class: 'choice', 'aria-pressed': 'false', 'data-id': option.id },
      letters && el('span', { class: 'choice__letter', 'aria-hidden': 'true' }, `${String.fromCharCode(65 + i)}.`),
      richText('span', {}, option.text));
    button.addEventListener('click', () => onChoose(option.id));
    return button;
  });
  const find = (id) => buttons.find((b) => b.dataset.id === String(id));
  return {
    element: el('div', { class: `choices${inline ? ' choices--inline' : ''}`, role: 'group', 'aria-label': label }, ...buttons),
    select(id) {
      for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.id === String(id)));
    },
    mark(id, kind) {
      find(id)?.classList.add(kind === 'correct' ? 'is-correct' : 'is-wrong');
    },
    lock() {
      for (const b of buttons) b.disabled = true;
    },
  };
}

/**
 * Footer with Back and Next buttons and the "not graded" note (wireframes 03, 05, 07).
 * Next marks the current screen as finished before moving on, which drives the ticks in the menu.
 *
 * @param {any} ctx - from app.js
 * @param {{backLabel?: string|null, nextLabel?: string|null, onBack?: () => void, onNext?: () => void, note?: boolean}} [options]
 *        labels default to the neighbouring screens' shortTitle; null hides a button
 * @returns {HTMLElement}
 */
export function pageFooter(ctx, options = {}) {
  const backLabel = options.backLabel === undefined ? ctx.prev?.shortTitle : options.backLabel;
  const nextLabel = options.nextLabel === undefined ? ctx.next?.shortTitle : options.nextLabel;
  const onBack = options.onBack ?? ctx.goBack;
  const onNext = options.onNext ?? (() => { ctx.markDone(); ctx.goNext(); });
  const note = options.note ?? true;
  return el('nav', { class: 'page-footer', 'aria-label': 'Page' },
    backLabel ? el('button', { type: 'button', class: 'btn', onclick: onBack }, `← ${backLabel}`) : el('span'),
    note ? el('p', { class: 'page-footer__note' }, ...ctx.lesson.footerNote.map((text) => el('span', {}, text))) : el('span'),
    nextLabel ? el('button', { type: 'button', class: 'btn btn--primary', onclick: onNext }, `${nextLabel} →`) : el('span'));
}

/**
 * Shows an error from the API or from input checking in a message box.
 *
 * @param {HTMLElement} box - an element with class "message"
 * @param {{message: string, code?: string}} error - usually an ApiError from js/api.js
 */
export function showError(box, error) {
  const notBuilt = error.code === 'NOT_IMPLEMENTED';
  box.className = `message ${notBuilt ? 'message--info' : 'message--error'}`;
  box.textContent = notBuilt ? `This part of the tutor is still being built. ${error.message}` : error.message;
}

/**
 * Shows feedback (correct / not quite) in a message box. The text may use **bold** / *italic*.
 *
 * @param {HTMLElement} box - an element with class "message"
 * @param {'success'|'error'|'info'} kind
 * @param {string} text
 */
export function showFeedback(box, kind, text) {
  box.className = `message message--${kind}`;
  box.innerHTML = formatText(text);
}

/**
 * Empties a message box (it is hidden by CSS when empty).
 *
 * @param {HTMLElement} box
 */
export function clearMessage(box) {
  box.textContent = '';
}
