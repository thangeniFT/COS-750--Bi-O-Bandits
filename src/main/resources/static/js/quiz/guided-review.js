/**
 * Guided review after the quiz (ticket F-08, FR-13, ID document section 10.5).
 *
 * For each missed learning outcome, most confident mistake first:
 *  1. replay part of the worked example, with the reason for each step highlighted;
 *  2. ask an easier version of the question, with hint 1 already shown;
 *  3. explain the answer.
 * Then the student is offered a fresh quiz attempt. "Continue to summary anyway" is always shown.
 *
 * The content comes from data/guided-review.json. Grading uses {@link gradeAnswer}, so the easier
 * questions follow the same rules as the quiz bank. Text is only ever set with textContent.
 *
 * @module quiz/guided-review
 */
import { gradeAnswer } from './quiz-engine.js';

/**
 * @typedef {object} ReplayStep
 * @property {number[]} visited
 * @property {number} current
 * @property {number[]} [stack] - top first; leave out for replays that are not DFS
 * @property {string} reason
 */

/**
 * @typedef {object} OutcomeReview
 * @property {string} title
 * @property {{route: string, label: string}} screen
 * @property {{intro: string, steps: ReplayStep[]}} replay
 * @property {{prompt: string, hint: string, highlight?: {visited: number[], current: number},
 *   options: {id: string, text: string, correct?: boolean, misconception?: string, feedback: string}[]}} practice
 * @property {string} explain
 */

function node(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function button(text, className = 'quiz-button') {
  const element = node('button', className, text);
  element.type = 'button';
  return element;
}

/**
 * Draws the guided review into `container`, one outcome at a time.
 *
 * @param {HTMLElement} container - an empty element to draw into
 * @param {object} options
 * @param {string[]} options.outcomes - outcome ids in review order (see reviewOutcomes)
 * @param {{tree: string, outcomes: Record<string, OutcomeReview>}} options.content - data/guided-review.json
 * @param {(treeKey: string, highlight: {visited?: number[], current?: number}) => HTMLElement} options.drawTree
 * @param {() => void} options.onRetry - called when the student asks for a fresh quiz
 * @param {string} [options.summaryHref] - where "Continue to summary anyway" goes
 * @returns {void}
 */
export function renderGuidedReview(container, { outcomes, content, drawTree, onRetry, summaryHref = '#/summary' }) {
  // Skip outcomes with no review content rather than failing in front of a student.
  const queue = outcomes.filter((id) => content.outcomes[id]);
  let index = 0;

  function frame(eyebrowText, titleText) {
    container.replaceChildren();
    const eyebrow = node('span', 'quiz-eyebrow', eyebrowText);
    const title = node('h2', 'quiz-review-title', titleText);
    title.tabIndex = -1;
    const body = node('div', 'quiz-review-body');
    const footer = node('div', 'quiz-actions quiz-review-footer');
    const skip = node('a', 'quiz-button quiz-button--quiet', 'Continue to summary anyway');
    skip.href = summaryHref;
    footer.append(skip);
    container.append(eyebrow, title, body, footer);
    title.focus({ preventScroll: true });
    container.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    return { body, footer, skip };
  }

  function eyebrowFor(id, part) {
    return `GUIDED REVIEW · TOPIC ${index + 1} OF ${queue.length} · ${id} · ${part}`;
  }

  // ---------- 1. Replay ----------
  function showReplay() {
    const id = queue[index];
    const review = content.outcomes[id];
    const { body } = frame(eyebrowFor(id, 'WATCH'), review.title);
    const steps = review.replay.steps;
    let step = 0;

    const intro = node('p', 'quiz-lead', review.replay.intro);
    const stage = node('div', 'quiz-review-replay');
    const figure = node('div', 'quiz-review-figure');
    const side = node('div', 'quiz-review-side');
    const stackTitle = node('p', 'quiz-subheading', 'Stack (top first)');
    const stack = node('ol', 'quiz-review-stack');
    stack.setAttribute('aria-label', 'Stack, top first');
    const reason = node('p', 'quiz-review-reason');
    reason.setAttribute('aria-live', 'polite');
    side.append(stackTitle, stack, reason);
    stage.append(figure, side);

    const controls = node('div', 'quiz-actions');
    const back = button('← Back');
    const counter = node('span', 'quiz-muted quiz-review-counter');
    const next = button('Next step →', 'quiz-button quiz-button--primary');
    controls.append(back, counter, next);

    body.append(intro, stage, controls);

    function draw() {
      const s = steps[step];
      figure.replaceChildren(drawTree(content.tree, { visited: s.visited, current: s.current }));
      // A step without a stack (the BST insert replay) hides the stack panel.
      const hasStack = Array.isArray(s.stack);
      stackTitle.hidden = !hasStack;
      stack.hidden = !hasStack;
      if (hasStack) stack.replaceChildren(...(s.stack.length
        ? s.stack.map((value, i) => node('li', i === 0 ? 'is-top' : '', i === 0 ? `${value}  ← top` : String(value)))
        : [node('li', 'is-empty', 'empty')]));
      reason.textContent = s.reason;
      counter.textContent = `Step ${step + 1} of ${steps.length}`;
      back.disabled = step === 0;
      next.textContent = step === steps.length - 1 ? 'Try an easier question →' : 'Next step →';
    }

    back.addEventListener('click', () => { if (step > 0) { step--; draw(); } });
    next.addEventListener('click', () => {
      if (step < steps.length - 1) { step++; draw(); } else { showPractice(); }
    });
    draw();
  }

  // ---------- 2. Easier question with hint 1, then 3. explanation ----------
  function showPractice() {
    const id = queue[index];
    const review = content.outcomes[id];
    const practice = review.practice;
    const { body } = frame(eyebrowFor(id, 'TRY'), review.title);
    const item = { id: `review-${id}`, type: 'choice', options: practice.options };

    body.append(node('h3', 'quiz-question', practice.prompt));
    if (practice.highlight) body.append(drawTree(content.tree, practice.highlight));
    const hint = node('p', 'quiz-review-hint', practice.hint);
    body.append(hint);

    const choices = node('div', 'quiz-choices');
    const feedback = node('div', 'quiz-feedback');
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    const explain = node('div', 'quiz-guidance quiz-review-explain');
    explain.hidden = true;
    const actions = node('div', 'quiz-actions');
    const replay = button('↺ Watch the steps again');
    const next = button(index === queue.length - 1 ? 'Finish review →' : 'Next topic →', 'quiz-button quiz-button--primary');
    next.hidden = true;
    actions.append(replay, next);

    let wrongTries = 0;
    let finished = false;

    function reveal() {
      finished = true;
      choices.querySelectorAll('button').forEach((b) => { b.disabled = true; });
      const link = node('a', 'quiz-inline-link', `Revisit: ${review.screen.label} →`);
      link.href = review.screen.route;
      explain.replaceChildren(node('h3', '', 'Why'), node('p', '', review.explain), link);
      explain.hidden = false;
      next.hidden = false;
      next.focus({ preventScroll: true });
    }

    for (const option of practice.options) {
      const choice = button(option.text, 'quiz-choice');
      choice.setAttribute('aria-pressed', 'false');
      choice.addEventListener('click', () => {
        if (finished) return;
        choices.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === choice)));
        const result = gradeAnswer(item, option.id);
        feedback.className = result.correct ? 'quiz-feedback is-correct' : 'quiz-feedback is-review';
        feedback.replaceChildren(node('strong', '', result.correct ? '✓ Correct' : 'Not quite'), node('p', '', result.feedback));
        if (result.correct) {
          reveal();
        } else {
          wrongTries++;
          choice.disabled = true;
          if (wrongTries >= 2) {
            const correct = practice.options.find((o) => o.correct);
            feedback.append(node('p', 'quiz-muted', `The answer is: ${correct.text}`));
            reveal();
          } else {
            feedback.append(node('p', 'quiz-muted', 'Use the hint above and try once more.'));
          }
        }
      });
      choices.append(choice);
    }

    replay.addEventListener('click', showReplay);
    next.addEventListener('click', () => {
      index++;
      if (index < queue.length) showReplay(); else showDone();
    });

    body.append(choices, feedback, explain, actions);
  }

  // ---------- Finish: offer a fresh attempt ----------
  function showDone() {
    const { body, footer, skip } = frame('GUIDED REVIEW · DONE', 'Ready for another try?');
    body.append(
      node('p', 'quiz-lead', `You reviewed ${queue.length} ${queue.length === 1 ? 'topic' : 'topics'}.`),
      node('p', 'quiz-muted', 'The next attempt uses questions you have not seen yet where possible, so it checks understanding rather than memory.')
    );
    const retry = button('Take a fresh quiz →', 'quiz-button quiz-button--primary');
    retry.addEventListener('click', onRetry);
    footer.prepend(retry);
    footer.append(skip);
  }

  if (queue.length) showReplay(); else showDone();
}
