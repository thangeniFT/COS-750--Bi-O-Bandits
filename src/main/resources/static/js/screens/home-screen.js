/**
 * Screen type "home" (wireframe 01). Gagné events 1 and 2.
 *
 *  - Event 1, gain attention: the preview tree animates a real DFS search (from the server) while
 *    the caption tells the maze story: take the left-most passage, back up at a dead end.
 *  - Event 2, state the objectives: the three "What you'll learn" cards are the outcomes.
 *  - "Start learning" goes to the first screen the student has not finished (the recommended path);
 *    it says "Continue learning" once they have started.
 *
 * lesson.json fields: eyebrow, titleLines[], subtitle, meta[], preview {label, tree, target,
 * caption}, outcomesTitle, outcomes[] {title, text}, exploreLabel.
 *
 * Accessibility: the animation pauses itself for students who ask for reduced motion, and there is
 * always a Pause/Play button (moving content longer than 5 seconds must be stoppable, WCAG 2.2.2).
 *
 * Status: implemented.
 * @module screens/home-screen
 */

import { api } from '../api.js';
import { progress } from '../progress.js';
import { StepPlayer } from '../components/step-player.js';
import { renderTree, treeLegend } from '../components/tree-view.js';
import { el } from '../util.js';
import { card, richText } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {any} ctx
 * @returns {() => void} stops the animation
 */
export function render(screen, container, ctx) {
  const started = ctx.lesson.screens.some((s) => s.id !== 'home' && progress.isDone(s.id));
  const preview = screen.preview;

  // --- Left: the pitch -------------------------------------------------------------------
  const intro = el('div', {},
    el('p', { class: 'eyebrow' }, screen.eyebrow),
    el('h1', { class: 'hero__title' }, ...screen.titleLines.map((line) => el('span', {}, line))),
    richText('p', { class: 'subtitle' }, screen.subtitle),
    el('div', { class: 'hero__actions' },
      el('button', { type: 'button', class: 'btn btn--primary', onclick: () => { ctx.markDone(); ctx.go(ctx.nextUnfinished()); } },
        started ? 'Continue learning' : 'Start learning', el('span', { 'aria-hidden': 'true' }, '→')),
      el('button', { type: 'button', class: 'btn', onclick: () => ctx.go('explorer') }, screen.exploreLabel)),
    el('p', { class: 'hero__meta' }, ...screen.meta.map((text) => el('span', {}, text))));

  // --- Right: animated preview (the maze hook) ---------------------------------------------
  const svg = document.createElementNS(SVG_NS, 'svg');
  const playBtn = el('button', { type: 'button', class: 'btn btn--small btn--quiet' }, 'Pause');
  const visited = el('p', { class: 'visit-order', 'aria-hidden': 'true' });
  const previewCard = card({ label: preview.label, alt: true, className: 'preview' },
    richText('p', { class: 'preview__caption' }, preview.caption),
    svg,
    visited,
    el('div', { class: 'preview__controls' }, treeLegend(), playBtn));

  container.append(
    el('div', { class: 'hero' }, intro, previewCard),
    el('h2', { class: 'section-title' }, screen.outcomesTitle),
    el('div', { class: 'outcomes' }, ...screen.outcomes.map((outcome, i) => card({ className: 'outcome' },
      el('div', { class: 'outcome__head' },
        el('span', { class: 'outcome__num' }, String(i + 1).padStart(2, '0')),
        el('h3', { class: 'outcome__title' }, outcome.title)),
      el('p', { class: 'outcome__text' }, outcome.text)))));

  /** @type {StepPlayer|null} */
  let player = null;
  let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stopped = false;

  const setPlaying = (on) => {
    playing = on;
    playBtn.textContent = on ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-label', on ? 'Pause the animation' : 'Play the animation');
    if (!player) return;
    if (on) {
      if (player.atEnd) player.restart();
      player.play({ interval: 1100, loop: true });
    } else {
      player.stopPlaying();
    }
  };
  playBtn.addEventListener('click', () => setPlaying(!playing));

  // The steps come from the real algorithm on the server, like everywhere else (NFR-03).
  (async () => {
    try {
      const values = ctx.trees[preview.tree].values;
      const [view, result] = await Promise.all([api.preview(values), api.search(preview.target, values)]);
      if (stopped) return;
      const tree = renderTree(svg, view);
      svg.setAttribute('aria-label', `${preview.label}: a depth-first search for ${preview.target} on a binary search tree.`);
      player = new StepPlayer({ tree, visited });
      player.load(result);
      setPlaying(playing);
    } catch {
      // The preview is decoration: if the server is unreachable, just hide the animation controls.
      playBtn.hidden = true;
    }
  })();

  return () => {
    stopped = true;
    player?.stopPlaying();
  };
}
