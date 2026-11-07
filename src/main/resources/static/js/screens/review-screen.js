/**
 * Screen type "review" (wireframe 07): guided review after the quiz. Gagné event 7 (feedback),
 * with scaffolding (three hints) and a link back to the part of the lesson that teaches it.
 *
 * Wrong answers are reviewed one at a time, most confident first (planReview in quiz-engine.js):
 * a mistake made while "certain" points to a firmly held misconception, so it comes first.
 * Correct answers given while "guessing" are listed at the end as worth a second look.
 *
 * Content comes from data/quiz-bank.json: each item's feedback and three "hints", and for each
 * outcome a "review" { text, screen, button } that says where to go back to.
 *
 * lesson.json fields: title, subtitle, emptyTitle, emptyText.
 *
 * Status: implemented (backlog ticket F-08).
 * @module screens/review-screen
 */

import { loadData } from '../api.js';
import { progress } from '../progress.js';
import { planReview } from '../quiz/quiz-engine.js';
import { el } from '../util.js';
import { card, pageFooter, renderPageHeader, richText, showError } from './common.js';
import { describeAnswer, hydrate } from './quiz-screen.js';

/**
 * Opens a screen given as "explorer?tab=example".
 *
 * @param {any} ctx
 * @param {string} target
 */
function goTo(ctx, target) {
  const [id, query = ''] = target.split('?');
  ctx.go(id, Object.fromEntries(new URLSearchParams(query)));
}

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {any} ctx
 */
export function render(screen, container, ctx) {
  const message = el('div', { class: 'message', role: 'alert' });
  container.append(message);

  loadData('quiz-bank').then((bank) => {
    const saved = progress.get('quizResult');
    const responses = saved ? hydrate(bank, saved.responses) : [];
    const plan = planReview(responses);
    const mistakes = plan.review.map((entry) => responses.find((r) => r.item.id === entry.itemId));

    if (mistakes.length === 0) {
      renderPageHeader(container, { eyebrow: 'Feedback / Guided review', title: screen.emptyTitle, subtitle: screen.emptyText });
      container.append(el('div', { class: 'hero__actions' },
        el('button', { type: 'button', class: 'btn btn--primary', onclick: () => ctx.go(saved ? 'summary' : 'quiz') }, saved ? 'See your summary →' : 'Take the quiz →')));
      return;
    }

    showMistake(0);

    /**
     * Draws mistake `index` (0-based).
     * @param {number} index
     */
    function showMistake(index) {
      container.replaceChildren();
      const response = mistakes[index];
      const { item } = response;
      const outcome = bank.outcomes[item.outcome] ?? {};
      const correctAnswer = item.type === 'order' ? item.answer : item.options.find((o) => o.correct).id;
      const last = index === mistakes.length - 1;

      renderPageHeader(container, {
        eyebrow: `Feedback / Guided review • ${index + 1} of ${mistakes.length}`,
        title: screen.title,
        subtitle: screen.subtitle,
      });

      container.append(card({ alt: true, label: `Question • ${outcome.label ?? item.outcome}` },
        richText('p', {}, item.prompt),
        el('p', { class: 'answer-line' },
          el('span', {}, `Your answer: ${describeAnswer(item, response.answer)}`),
          el('span', {}, `Correct answer: ${describeAnswer(item, correctAnswer)}`)),
        richText('p', {}, response.result.feedback),
        response.confidence === 'certain' && richText('p', { class: 'figure__text' },
          'You were **certain** about this one, so it is worth a careful look: a confident mistake usually means a rule has been mixed up.')));

      // Hints appear one at a time: the student decides how much help they need.
      const hints = item.hints ?? [];
      const hintList = el('div', { class: 'hints' });
      let shown = 0;
      const moreBtn = el('button', { type: 'button', class: 'btn btn--small btn--quiet' });
      const showNext = () => {
        if (shown >= hints.length) return;
        hintList.append(el('div', { class: 'hint' },
          el('span', { class: 'hint__label' }, `Hint ${shown + 1}`), richText('span', {}, hints[shown])));
        shown += 1;
        moreBtn.textContent = `Show hint ${shown + 1}`;
        moreBtn.hidden = shown >= hints.length;
      };
      moreBtn.addEventListener('click', showNext);
      showNext();

      container.append(el('div', { class: 'two-col', style: 'margin-top:20px' },
        card({ title: 'Need a little more support?' }, hintList, moreBtn),
        card({ title: 'Recommended review', alt: true },
          richText('p', {}, outcome.review?.text ?? ''),
          outcome.review && el('button', { type: 'button', class: 'btn btn--primary', onclick: () => goTo(ctx, outcome.review.screen) }, outcome.review.button))));

      if (last && plan.worthALook.length > 0) {
        container.append(card({ title: 'Worth a second look', className: 'lecture-questions' },
          el('p', {}, 'You answered these correctly, but said you were guessing. Make sure you can explain why the answer is right:'),
          el('ul', {}, ...plan.worthALook.map((entry) => {
            const r = responses.find((x) => x.item.id === entry.itemId);
            return richText('li', {}, r.item.prompt);
          }))));
      }

      container.append(pageFooter(ctx, {
        backLabel: index === 0 ? 'Quiz results' : 'Previous question',
        onBack: () => (index === 0 ? ctx.go('quiz') : showMistake(index - 1)),
        nextLabel: last ? 'Try again' : 'Next question',
        onNext: () => (last ? ctx.go('quiz', { new: '1' }) : showMistake(index + 1)),
      }));
      container.querySelector('h1')?.focus();
    }
  }).catch((error) => showError(message, error));
}
