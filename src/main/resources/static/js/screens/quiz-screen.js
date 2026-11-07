/**
 * Screen type "quiz" (wireframe 06). Gagné events 8 (assess) and 7 (feedback).
 *
 * One question at a time. The student chooses an answer (buttons, a node on the tree for
 * "tree-click" questions, or an ordering for order questions), says how sure they are
 * (Guessing / Fairly sure / Certain), and submits. Short feedback from the quiz bank appears
 * straight away. After six questions the results screen offers the guided review (wireframe 07)
 * and the summary (wireframe 08).
 *
 * All grading is rule-based, in js/quiz/quiz-engine.js. The confidence rating feeds planReview,
 * which reviews confident mistakes first.
 *
 * Saved in the tab's session (js/progress.js) so a refresh does not lose answers:
 *  - "quiz": { seenIds, attempt: { itemIds, responses[], finished } }
 *  - "quizResult": the finished attempt, read by the review and summary screens.
 * #/quiz?new=1 starts a fresh attempt with questions the student has not seen yet.
 *
 * lesson.json fields: title, subtitle, resultsTitle, passText, failText.
 *
 * Status: implemented (closes F-07; the review part of F-08 is in review-screen.js).
 * @module screens/quiz-screen
 */

import { api, loadData } from '../api.js';
import { progress } from '../progress.js';
import { createOrderInput } from '../components/order-input.js';
import { renderTree, treeLegend } from '../components/tree-view.js';
import { gradeAnswer, scoreQuiz, selectItems } from '../quiz/quiz-engine.js';
import { el } from '../util.js';
import { card, choiceGroup, pageFooter, progressBar, renderPageHeader, richText, showError, showFeedback } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CONFIDENCE_LABELS = { guessing: 'Guessing', 'fairly-sure': 'Fairly sure', certain: 'Certain' };

/**
 * Turns saved responses back into the shape quiz-engine.js expects ({item, answer, confidence, result}).
 *
 * @param {any} bank - the quiz bank
 * @param {any[]} saved - responses as saved in progress
 * @returns {import('../quiz/quiz-engine.js').QuizResponse[]}
 */
export function hydrate(bank, saved) {
  return saved.filter(Boolean).map((r) => ({ ...r, item: bank.items.find((i) => i.id === r.itemId) }));
}

/**
 * Describes an answer in words, for feedback and the review ("Node 70", "50, 30, 20").
 *
 * @param {any} item
 * @param {string|number[]} answer
 * @returns {string}
 */
export function describeAnswer(item, answer) {
  if (item.type === 'order') return answer.join(', ');
  return item.options.find((o) => o.id === answer)?.text ?? String(answer);
}

/**
 * The feedback sentence for a graded answer. Most bank feedback already starts with "Correct." or
 * "Not quite."; the rest (for example "That is in-order.") gets the word added, so every answer
 * is clearly marked right or wrong.
 *
 * @param {{correct: boolean, feedback: string}} result - from gradeAnswer
 * @returns {string}
 */
export function feedbackText(result) {
  const { correct, feedback } = result;
  if (correct) return /^correct/i.test(feedback) ? feedback : `**Correct.** ${feedback}`;
  return /^(not quite|close|very close)/i.test(feedback) ? feedback : `**Not quite.** ${feedback}`;
}

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {any} ctx
 * @returns {() => void} clean-up
 */
export function render(screen, container, ctx) {
  const cleanups = [];
  const message = el('div', { class: 'message', role: 'alert' });
  container.append(message);

  loadData('quiz-bank').then((bank) => {
    let quiz = progress.get('quiz') ?? { seenIds: [], attempt: null };

    if (ctx.params.get('new') || !quiz.attempt) {
      const items = selectItems(bank, quiz.seenIds);
      quiz = {
        seenIds: [...new Set([...quiz.seenIds, ...items.map((i) => i.id)])],
        attempt: { itemIds: items.map((i) => i.id), responses: items.map(() => null), finished: false },
      };
      progress.set('quiz', quiz);
      // Drop "?new=1" from the address so a refresh does not start yet another attempt.
      window.history.replaceState(null, '', '#/quiz');
    }

    const items = quiz.attempt.itemIds.map((id) => bank.items.find((i) => i.id === id));
    const save = () => progress.set('quiz', quiz);

    if (quiz.attempt.finished) {
      showResults();
      return;
    }
    const firstOpen = quiz.attempt.responses.findIndex((r) => r === null);
    showQuestion(firstOpen === -1 ? items.length - 1 : firstOpen);

    /**
     * Draws question `index`. Answered questions are shown locked, with their feedback.
     * @param {number} index
     */
    function showQuestion(index) {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      container.replaceChildren();
      const item = items[index];
      const saved = quiz.attempt.responses[index];
      const topic = bank.outcomes[item.outcome]?.label ?? item.outcome;
      const number = String(index + 1).padStart(2, '0');

      renderPageHeader(container, {
        eyebrow: `Readiness quiz / Question ${index + 1} of ${items.length}`,
        title: screen.title,
        subtitle: screen.subtitle,
      });
      container.append(progressBar(index + 1, items.length, `Question ${index + 1} of ${items.length}`));

      /** @type {string|number[]|null} */
      let answer = saved ? saved.answer : null;
      let confidence = saved ? saved.confidence : null;
      const feedback = el('div', { class: 'message', role: 'status' });
      const submitBtn = el('button', { type: 'button', class: 'btn btn--primary' });
      const local = el('div', { class: 'message', role: 'alert' });

      // --- Left card: the question and its tree ---
      const svg = item.tree ? document.createElementNS(SVG_NS, 'svg') : null;
      const left = card({ label: `Question ${number} • ${topic}` },
        richText('h2', { class: 'card__title' }, item.prompt),
        svg, svg && item.highlight && treeLegend(), local);

      // --- Right card: the answer and the confidence rating ---
      const right = card({ alt: true, title: item.type === 'order' ? 'Build your answer' : 'Select one answer' });
      let answerGroup = null;
      let orderInput = null;
      const answerReady = () => answer !== null && (!Array.isArray(answer) || answer.length > 0);
      const updateSubmit = () => { submitBtn.disabled = !saved && !(answerReady() && confidence); };

      if (item.type === 'choice') {
        answerGroup = choiceGroup(item.options, (id) => {
          if (saved) return;
          answer = id;
          answerGroup.select(id);
          updateSubmit();
        }, { label: 'Answers' });
        right.append(answerGroup.element);
        if (saved) answerGroup.select(saved.answer);
      }

      const confidenceGroup = choiceGroup(bank.confidenceLevels.map((id) => ({ id, text: CONFIDENCE_LABELS[id] ?? id })),
        (id) => {
          if (saved) return;
          confidence = id;
          confidenceGroup.select(id);
          updateSubmit();
        }, { letters: false, label: 'How sure are you?' });
      if (saved) confidenceGroup.select(saved.confidence);

      // Trees come from the server, like every other tree in the app.
      if (svg) {
        api.preview(ctx.trees[item.tree].values).then((view) => {
          const tree = renderTree(svg, view);
          if (item.highlight) {
            for (const v of item.highlight.visited ?? []) tree.setState(v, 'visited');
            if (item.highlight.current != null) tree.setState(item.highlight.current, 'current');
          }
          if (saved) return;
          if (item.type === 'order') {
            orderInput = createOrderInput({
              tree,
              submitLabel: 'Use this order',
              onChange: (values) => { answer = values.length ? values : null; updateSubmit(); },
              onSubmit: (values) => { answer = values; updateSubmit(); },
            });
            right.prepend(orderInput.element);
            cleanups.push(orderInput.destroy);
          } else if (item.presentation === 'tree-click') {
            // Clicking a node chooses the option with the same id (for example node 20 = "20").
            cleanups.push(tree.makeClickable((value) => {
              if (item.options.some((o) => o.id === String(value))) {
                answer = String(value);
                answerGroup.select(answer);
                updateSubmit();
              }
            }));
          }
        }).catch((error) => showError(local, error));
      }
      if (item.type === 'order' && saved) {
        right.append(el('p', {}, el('strong', {}, 'Your order: '), saved.answer.join(', ')));
      }

      right.append(el('div', { class: 'confidence' },
        el('p', { class: 'confidence__label' }, 'How sure are you?'), confidenceGroup.element));

      /** Shows the feedback for an answered question and locks it. */
      const showAnswered = (response) => {
        answerGroup?.lock();
        confidenceGroup.lock();
        if (item.type === 'choice') {
          answerGroup.mark(item.options.find((o) => o.correct).id, 'correct');
          if (!response.result.correct) answerGroup.mark(response.answer, 'wrong');
        }
        showFeedback(feedback, response.result.correct ? 'success' : 'error', feedbackText(response.result));
        const last = index === items.length - 1;
        submitBtn.textContent = last ? 'See your results →' : 'Next question →';
        submitBtn.disabled = false;
        submitBtn.onclick = () => (last ? finish() : showQuestion(index + 1));
      };

      submitBtn.textContent = 'Submit answer →';
      submitBtn.onclick = () => {
        if (!answerReady() || !confidence) return;
        const response = { itemId: item.id, answer, confidence, result: gradeAnswer(item, answer) };
        quiz.attempt.responses[index] = response;
        save();
        orderInput?.lock();
        showAnswered(response);
        feedback.focus?.();
      };
      updateSubmit();

      container.append(
        el('div', { class: 'two-col' }, left, right),
        feedback,
        el('nav', { class: 'page-footer', 'aria-label': 'Question' },
          index > 0 ? el('button', { type: 'button', class: 'btn', onclick: () => showQuestion(index - 1) }, '← Previous') : el('span'),
          submitBtn));

      if (saved) showAnswered(saved);
    }

    /** Ends the attempt: saves the result for the review and summary screens. */
    function finish() {
      const responses = hydrate(bank, quiz.attempt.responses);
      const score = scoreQuiz(responses, bank.passMark);
      quiz.attempt.finished = true;
      save();
      progress.set('quizResult', { responses: quiz.attempt.responses, ...score });
      ctx.markDone();
      showResults();
    }

    /** The results card, with the way forward. */
    function showResults() {
      container.replaceChildren();
      const result = progress.get('quizResult');
      const wrong = result.total - result.correct;
      renderPageHeader(container, { eyebrow: 'Readiness quiz / Results', title: screen.resultsTitle });
      const responses = hydrate(bank, result.responses);
      container.append(
        el('div', { class: 'two-col' },
          card({ label: 'Readiness check', alt: true },
            el('p', { class: 'score' }, `${result.correct} / ${result.total} correct`),
            richText('p', {}, result.passed ? screen.passText : screen.failText)),
          card({ title: 'Your answers' },
            el('ul', { class: 'can-do' }, ...responses.map((r, i) => el('li', { class: r.result.correct ? '' : 'is-review' },
              el('span', { class: 'can-do__mark', 'aria-hidden': 'true' }, r.result.correct ? '✓' : '✗'),
              el('span', {}, `Question ${i + 1} (${bank.outcomes[r.item.outcome]?.label ?? r.item.outcome}): `,
                r.result.correct ? 'correct' : 'not quite', `, you said "${CONFIDENCE_LABELS[r.confidence]}"`)))))),
        el('div', { class: 'hero__actions' },
          wrong > 0 && el('button', { type: 'button', class: `btn${result.passed ? '' : ' btn--primary'}`, onclick: () => ctx.go('quiz/review') }, 'Start guided review →'),
          el('button', { type: 'button', class: `btn${result.passed || wrong === 0 ? ' btn--primary' : ''}`, onclick: () => ctx.go('summary') }, 'See your summary →'),
          el('button', { type: 'button', class: 'btn btn--quiet', onclick: () => ctx.go('quiz', { new: '1' }) }, 'Try a new set of questions')),
        pageFooter(ctx, { nextLabel: null }));
    }
  }).catch((error) => showError(message, error));

  return () => cleanups.forEach((fn) => fn());
}
