/**
 * Screen type "lesson" (wireframes 02 and 03): one short lesson with a figure on the left, a side
 * card on the right, and an optional quick check. Gagné events 3 (recall), 4 (present) and 7
 * (feedback on the quick check).
 *
 * lesson.json fields:
 *  - lesson, title, shortTitle, progressLabel, subtitle
 *  - figure: { title, text?, kind, ... } where kind is
 *      "tree" - a fixed tree, optionally with labels: { tree, labels: {"50": "root"} }
 *      "dfs"  - a real DFS run from the server, played step by step:
 *               { tree, search: 60 } or { tree, order: "PRE_ORDER" }, plus optional
 *               orderPicker (choose pre/in/post), showStack, autoplay,
 *               afterRun: { "IN_ORDER": "text shown after the last step" },
 *               caption ("{nodesVisited}" is replaced with the server's count)
 *      "code" - a code listing: { lines: ["..."] }
 *  - side: { title, items: [{heading, text}] or ["text"], ordered?, note? }
 *  - quickCheck (optional): { position: "start"|"end", prompt, options: [{id, text, correct?,
 *    feedback}], refresher? } - a wrong answer shows its feedback and the refresher. Students may
 *    try again; it never blocks Next (it is a check, not a gate).
 *
 * Status: implemented.
 * @module screens/lesson-screen
 */

import { api } from '../api.js';
import { StackPanel } from '../components/stack-panel.js';
import { StepPlayer } from '../components/step-player.js';
import { renderTree, treeLegend } from '../components/tree-view.js';
import { el } from '../util.js';
import { card, choiceGroup, pageFooter, progressBar, renderPageHeader, richText, showError, showFeedback } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const ORDERS = [
  { id: 'PRE_ORDER', text: 'Pre-order' },
  { id: 'IN_ORDER', text: 'In-order' },
  { id: 'POST_ORDER', text: 'Post-order' },
];

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {any} ctx
 * @returns {() => void} clean-up
 */
export function render(screen, container, ctx) {
  const number = String(screen.lesson).padStart(2, '0');
  const total = String(ctx.lessonCount).padStart(2, '0');
  renderPageHeader(container, { eyebrow: `Learn / Lesson ${number} of ${total}`, title: screen.title, subtitle: screen.subtitle });
  container.append(progressBar(screen.lesson, ctx.lessonCount, `Lesson ${screen.lesson} of ${ctx.lessonCount} • ${screen.progressLabel}`));

  const cleanups = [];
  if (screen.quickCheck?.position === 'start') container.append(quickCheck(screen.quickCheck, 'quick-check--start'));

  const figure = figureCard(screen.figure, ctx, cleanups);
  container.append(el('div', { class: 'two-col' }, figure, sideCard(screen.side)));

  if (screen.quickCheck && screen.quickCheck.position !== 'start') container.append(quickCheck(screen.quickCheck));
  container.append(pageFooter(ctx));

  return () => cleanups.forEach((fn) => fn());
}

/**
 * The quick check: one question, immediate feedback for whichever option is chosen.
 *
 * @param {any} check - quickCheck from lesson.json
 * @param {string} [extraClass]
 * @returns {HTMLElement}
 */
function quickCheck(check, extraClass = '') {
  const feedback = el('div', { class: 'message', role: 'status' });
  const refresher = el('div', { class: 'message', role: 'note' });
  const group = choiceGroup(check.options, (id) => {
    const option = check.options.find((o) => o.id === id);
    group.select(id);
    for (const button of group.element.querySelectorAll('.choice')) button.classList.remove('is-correct', 'is-wrong');
    group.mark(id, option.correct ? 'correct' : 'wrong');
    showFeedback(feedback, option.correct ? 'success' : 'error', `${option.correct ? '**Correct.**' : '**Not quite.**'} ${option.feedback}`);
    if (!option.correct && check.refresher) showFeedback(refresher, 'info', check.refresher);
    else refresher.textContent = '';
  }, { letters: false, inline: true, label: check.prompt });
  return el('section', { class: `quick-check ${extraClass}`.trim() },
    el('p', { class: 'quick-check__prompt' }, check.prompt), group.element, feedback, refresher);
}

/**
 * The right-hand card: a heading and a list of short points.
 *
 * @param {any} side - side from lesson.json
 * @returns {HTMLElement}
 */
function sideCard(side) {
  const items = side.items.map((item) => (typeof item === 'string'
    ? richText('li', {}, item)
    : el('li', {},
      richText('span', { class: 'side-list__heading' }, item.heading),
      item.text && richText('span', { class: 'side-list__text' }, item.text))));
  return card({ title: side.title, alt: true },
    el(side.ordered ? 'ol' : 'ul', { class: `side-list${side.ordered ? ' side-list--ordered' : ''}` }, ...items),
    side.note && richText('p', { class: 'card__note' }, side.note));
}

/**
 * The left-hand card: a tree, a DFS run or a code listing.
 *
 * @param {any} figure - figure from lesson.json
 * @param {any} ctx
 * @param {(() => void)[]} cleanups - functions to call when leaving the screen
 * @returns {HTMLElement}
 */
function figureCard(figure, ctx, cleanups) {
  const body = el('div');
  const result = card({ title: figure.title, className: 'figure' }, figure.text && richText('p', { class: 'figure__text' }, figure.text), body);

  if (figure.kind === 'code') {
    body.append(el('pre', { class: 'code' }, el('code', {}, ...figure.lines.map((line, i) => el('span', { class: 'code__line' },
      el('span', { class: 'code__num', 'aria-hidden': 'true' }, String(i + 1)), line)))));
    return result;
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  const message = el('div', { class: 'message', role: 'alert' });
  body.append(svg, message);
  const values = ctx.trees[figure.tree].values;

  if (figure.kind === 'tree') {
    api.preview(values)
      .then((view) => renderTree(svg, view, { labels: figure.labels }))
      .catch((error) => showError(message, error));
    return result;
  }

  // kind "dfs": a real run from the server, played back with the step player.
  const visited = el('p', { class: 'visit-order' });
  const explanation = el('p', { class: 'explanation', 'aria-live': 'polite' });
  const status = el('span', { class: 'step-status' });
  const caption = el('p', { class: 'figure__text' });
  const afterRun = el('div', { class: 'message', 'aria-live': 'polite' });
  const stackBox = el('div');
  const stack = figure.showStack ? new StackPanel(stackBox) : null;

  const backBtn = el('button', { type: 'button', class: 'btn btn--small' }, '← Previous');
  const nextBtn = el('button', { type: 'button', class: 'btn btn--small btn--primary' }, 'Next step →');
  const playBtn = el('button', { type: 'button', class: 'btn btn--small' }, 'Play');
  const restartBtn = el('button', { type: 'button', class: 'btn btn--small btn--quiet' }, 'Restart');

  /** @type {StepPlayer|null} */
  let player = null;
  let currentOrder = figure.order ?? null;

  const updateButtons = () => {
    backBtn.disabled = !player?.canBack;
    nextBtn.disabled = !player?.canNext;
    restartBtn.disabled = !player?.canBack;
    if (player?.atEnd && currentOrder && figure.afterRun?.[currentOrder]) {
      showFeedback(afterRun, 'success', figure.afterRun[currentOrder]);
    }
  };
  backBtn.addEventListener('click', () => { player?.stopPlaying(); player?.back(); });
  nextBtn.addEventListener('click', () => { player?.stopPlaying(); player?.next(); });
  restartBtn.addEventListener('click', () => { player?.stopPlaying(); player?.restart(); });
  playBtn.addEventListener('click', () => {
    if (!player) return;
    if (player.atEnd) player.restart();
    player.play({ interval: 900 });
  });
  cleanups.push(() => player?.stopPlaying());

  const picker = figure.orderPicker
    ? choiceGroup(ORDERS, (id) => { picker.select(id); run(id); }, { letters: false, inline: true, label: 'Traversal order' })
    : null;

  if (picker) body.prepend(picker.element); // order buttons go above the tree
  body.append(
    figure.showStack
      ? el('div', { class: 'two-col', style: 'margin-top:8px' },
        el('div', {}, visited),
        el('div', {}, el('p', { class: 'card__label' }, 'Stack (top first)'), stackBox))
      : visited,
    treeLegend(),
    explanation,
    el('div', { class: 'figure__controls' }, backBtn, nextBtn, playBtn, restartBtn, status),
    caption,
    afterRun);

  let tree = null;

  /**
   * Fetches a run from the server and loads it into the player.
   * @param {string|null} order - a traversal order, or null to run figure.search
   */
  async function run(order) {
    currentOrder = order;
    afterRun.textContent = '';
    try {
      const dfs = order ? await api.traverse(order, values) : await api.search(figure.search, values);
      player = new StepPlayer({
        tree, stack, visited, explanation, status,
        startText: order ? 'Press Next step or Play to watch the walk.' : `Press Next step or Play to search for ${figure.search}.`,
        onStep: updateButtons,
      });
      player.load(dfs);
      if (figure.caption) caption.innerHTML = '';
      if (figure.caption) caption.append(richText('span', {}, figure.caption.replace('{nodesVisited}', String(dfs.nodesVisited))));
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (figure.autoplay && !reduceMotion) player.play({ interval: 900 });
    } catch (error) {
      showError(message, error);
    }
  }

  (async () => {
    try {
      tree = renderTree(svg, await api.preview(values));
      if (picker && currentOrder) picker.select(currentOrder);
      await run(currentOrder);
    } catch (error) {
      showError(message, error);
    }
  })();

  return result;
}
