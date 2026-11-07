/**
 * Screen type "practice" (wireframe 05). Gagné events 6 (practice) and 7 (feedback).
 *
 * Practice 1 - predict the next node: DFS searches tree B for 55. Before each step the student
 * chooses the next node with the A/B/C buttons or by clicking it on the tree. "Get a hint" (or a
 * wrong answer) climbs the hint ladder: nudge, rule, worked answer. The stack is hidden at first
 * and shown from hint 1 on; hiding it is what makes this practice rather than reading.
 *
 * Practice 2 - put tree B in in-order, by clicking nodes or typing. The answer is checked against
 * api.traverse(...).visitOrder from the server, never against a list in JavaScript.
 *
 * lesson.json fields: eyebrow, title, subtitle, tree, target, questionHint, treeTitle,
 * choicesTitle, finishText, worked (text suggesting the worked example), orderTask { order,
 * title, text, correct, wrong }.
 *
 * Status: implemented (closes F-05 and the practice part of F-07).
 * @module screens/practice-screen
 */

import { api } from '../api.js';
import { createOrderInput } from '../components/order-input.js';
import { PredictMode } from '../components/predict-mode.js';
import { StackPanel } from '../components/stack-panel.js';
import { StepPlayer } from '../components/step-player.js';
import { renderTree, treeLegend } from '../components/tree-view.js';
import { el } from '../util.js';
import { card, choiceGroup, pageFooter, renderPageHeader, richText, showError, showFeedback } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {any} ctx
 * @returns {() => void} clean-up
 */
export function render(screen, container, ctx) {
  renderPageHeader(container, { eyebrow: screen.eyebrow, title: screen.title, subtitle: screen.subtitle });
  const values = ctx.trees[screen.tree].values;

  // --- Practice 1: parts -------------------------------------------------------------------
  const questionTitle = el('h2', { class: 'question-card__title' }, 'Loading the practice tree…');
  const questionCard = card({ alt: true, className: 'question-card' },
    questionTitle, el('p', { class: 'question-card__hint' }, screen.questionHint));

  const svg = document.createElementNS(SVG_NS, 'svg');
  const visited = el('p', { class: 'visit-order' });
  const choicesBox = el('div');
  const feedback = el('div', { class: 'message', role: 'status' });
  const stackBox = el('div');
  const stackSection = el('div', { hidden: true }, el('p', { class: 'card__label' }, 'Stack now (top first)'), stackBox);
  const stack = new StackPanel(stackBox);
  const hintBtn = el('button', { type: 'button', class: 'btn btn--quiet' }, 'Get a hint');
  const ladderSteps = ['nudge', 'rule', 'worked answer'].map((text) => el('span', {}, text));
  const ladder = el('p', { class: 'hint-ladder' }, 'Hint ladder: ',
    ladderSteps[0], ' → ', ladderSteps[1], ' → ', ladderSteps[2]);
  const message = el('div', { class: 'message', role: 'alert' });
  const part2 = el('div');

  container.append(
    questionCard,
    message,
    el('div', { class: 'two-col' },
      card({ title: screen.treeTitle }, svg, treeLegend(), visited),
      card({ title: screen.choicesTitle, alt: true }, choicesBox, hintBtn, feedback, stackSection)),
    ladder,
    part2,
    pageFooter(ctx));

  /** Underlines the current rung of the hint ladder (0 = none). */
  const setLadder = (level) => {
    ladderSteps.forEach((step, i) => {
      if (i + 1 === level) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  };

  /** @type {PredictMode|null} */
  let predict = null;
  /** @type {(() => void)[]} */
  const cleanups = [];

  (async () => {
    try {
      const [view, result] = await Promise.all([api.preview(values), api.search(screen.target, values)]);
      const tree = renderTree(svg, view);
      const player = new StepPlayer({ tree, stack, visited });

      predict = new PredictMode({
        player,
        tree,
        onQuestion: ({ justVisited, options }) => {
          questionTitle.textContent = `DFS just visited ${justVisited}. Which node will it visit next?`;
          stackSection.hidden = true;
          setLadder(0);
          hintBtn.disabled = false;
          const group = choiceGroup(options.map((v) => ({ id: String(v), text: `Node ${v}` })),
            (id) => predict.guess(Number(id)), { label: 'Choose the next node' });
          choicesBox.replaceChildren(group.element);
        },
        onFeedback: (fb) => {
          if (fb.correct) {
            showFeedback(feedback, 'success', `**Correct.** ${fb.message}`);
            return;
          }
          setLadder(fb.hintLevel);
          stackSection.hidden = false; // hint 1 points at the stack, so show it from now on
          const prefix = fb.guess === null ? `**Hint ${fb.hintLevel}.**` : `**Not ${fb.guess}.** Hint ${fb.hintLevel}:`;
          showFeedback(feedback, fb.reveal ? 'info' : 'error', `${prefix} ${fb.message}`);
        },
        onFinish: ({ steps, hintsUsed, revealed }) => {
          questionTitle.textContent = `Found ${screen.target}. You predicted all ${steps} steps.`;
          choicesBox.replaceChildren();
          hintBtn.disabled = true;
          stackSection.hidden = false;
          setLadder(0);
          const hintsText = hintsUsed === 0 ? 'without any hints' : `with ${hintsUsed} hint${hintsUsed === 1 ? '' : 's'}`;
          showFeedback(feedback, 'success', `**Well done:** you finished ${hintsText}. ${screen.finishText}`);
          if (revealed >= 2) {
            feedback.append(el('br'), richText('span', {}, screen.worked), ' ',
              el('button', { type: 'button', class: 'btn btn--small', onclick: () => ctx.go('explorer', { tab: 'example' }) }, 'Replay worked example'));
          }
          showOrderTask(view);
        },
      });
      hintBtn.addEventListener('click', () => predict.hint());
      predict.start(result);
    } catch (error) {
      showError(message, error);
    }
  })();

  /**
   * Practice 2: the ordering task, on a fresh drawing of the same tree.
   * @param {import('../api.js').TreeView} view
   */
  function showOrderTask(view) {
    const task = screen.orderTask;
    const orderSvg = document.createElementNS(SVG_NS, 'svg');
    const result = el('div', { class: 'message', role: 'status' });
    const tree = renderTree(orderSvg, view);
    const input = createOrderInput({
      tree,
      onSubmit: async (answer) => {
        try {
          const expected = (await api.traverse(task.order, values)).visitOrder;
          const firstWrong = expected.findIndex((v, i) => answer[i] !== v);
          if (firstWrong === -1 && answer.length === expected.length) {
            showFeedback(result, 'success', task.correct);
            input.lock();
            ctx.markDone();
          } else {
            const position = firstWrong === -1 ? expected.length + 1 : firstWrong + 1;
            const should = firstWrong === -1 ? 'nothing' : String(expected[firstWrong]);
            showFeedback(result, 'error', `**Not quite.** Position ${position} should be ${should}. ${task.wrong}`);
          }
        } catch (error) {
          showError(result, error);
        }
      },
    });
    part2.replaceChildren(el('div', { class: 'two-col', style: 'margin-top:28px' },
      card({ title: task.title }, richText('p', { class: 'figure__text' }, task.text), orderSvg),
      card({ alt: true }, input.element, result)));
    cleanups.push(input.destroy);
  }

  return () => {
    predict?.stop();
    cleanups.forEach((fn) => fn());
  };
}
