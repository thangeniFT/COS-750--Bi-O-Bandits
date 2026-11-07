/**
 * Screen type "summary" (wireframe 08). Gagné event 9 (retention and transfer).
 *
 * Everything on this page reflects what the student actually did:
 *  - the readiness card shows the real quiz score, and how many outcomes need review;
 *  - "What you can now do" ticks only the outcomes whose quiz questions were all correct, and
 *    marks the others "worth reviewing" (no ticks at all if the quiz was not taken);
 *  - "Choose what to do next" offers the worked example, the student's own tree, and the
 *    questions to bring to the lecture.
 *
 * lesson.json fields: titles { ready, review, noQuiz }, subtitle, canDoTitle, nextTitle,
 * nextCards { replay, ownTree, lecture } (title, text), lectureQuestions[].
 *
 * Status: implemented.
 * @module screens/summary-screen
 */

import { loadData } from '../api.js';
import { progress } from '../progress.js';
import { el } from '../util.js';
import { card, pageFooter, renderPageHeader, richText, showError } from './common.js';
import { hydrate } from './quiz-screen.js';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {any} ctx
 */
export function render(screen, container, ctx) {
  const message = el('div', { class: 'message', role: 'alert' });
  container.append(message);
  ctx.markDone();

  loadData('quiz-bank').then((bank) => {
    const saved = progress.get('quizResult');
    const responses = saved ? hydrate(bank, saved.responses) : [];
    const outcomeIds = Object.keys(bank.outcomes);
    /** Outcomes with at least one wrong answer. */
    const missed = outcomeIds.filter((lo) => responses.some((r) => r.item.outcome === lo && !r.result.correct));

    const title = !saved ? screen.titles.noQuiz : missed.length === 0 ? screen.titles.ready : screen.titles.review;
    renderPageHeader(container, { eyebrow: 'Learning summary / End of session', title, subtitle: screen.subtitle });

    // --- Readiness card --------------------------------------------------------------------
    const readiness = saved
      ? card({ label: 'Readiness check', alt: true },
        el('p', { class: 'score' }, `${saved.correct} / ${saved.total} correct`),
        el('p', {}, missed.length === 0
          ? 'You are ready for the lecture.'
          : `Review ${missed.length} concept${missed.length === 1 ? '' : 's'} before the lecture.`),
        missed.length > 0 && el('button', { type: 'button', class: 'btn btn--small', onclick: () => ctx.go('quiz/review') }, 'Open the guided review'))
      : card({ label: 'Readiness check', alt: true },
        el('p', {}, 'Take the six-question readiness quiz to see how ready you are.'),
        el('button', { type: 'button', class: 'btn btn--primary', onclick: () => ctx.go('quiz') }, 'Take the quiz →'));

    // --- What you can now do (honest: from the quiz) -----------------------------------------
    const canDo = el('ul', { class: 'can-do' }, ...outcomeIds.map((lo) => {
      const outcome = bank.outcomes[lo];
      const answered = responses.some((r) => r.item.outcome === lo);
      const needsReview = missed.includes(lo);
      const mark = !saved || !answered ? '•' : needsReview ? '○' : '✓';
      return el('li', { class: needsReview ? 'is-review' : '' },
        el('span', { class: 'can-do__mark', 'aria-hidden': 'true' }, mark),
        el('span', {}, outcome.canDo, needsReview ? ' (worth reviewing)' : ''));
    }));

    container.append(el('div', { class: 'summary-top' }, readiness, card({ title: screen.canDoTitle }, canDo)));

    // --- Choose what to do next ----------------------------------------------------------------
    const lecture = card({ title: screen.nextCards.lecture.title, className: 'lecture-questions' },
      el('p', {}, 'Questions to bring to the lecture:'),
      el('ol', {}, ...screen.lectureQuestions.map((q) => richText('li', {}, q))));
    lecture.id = 'lecture-questions';
    lecture.hidden = true;

    const nextCard = (data, onClick, extra = {}) => el('button', { type: 'button', class: 'card next-card', onclick: onClick, ...extra },
      el('span', { class: 'next-card__title' }, data.title),
      el('span', { class: 'next-card__text' }, data.text));
    const unlocked = Boolean(progress.get('explorerUnlocked'));
    const lectureBtn = nextCard(screen.nextCards.lecture, () => {
      lecture.hidden = !lecture.hidden;
      lectureBtn.setAttribute('aria-expanded', String(!lecture.hidden));
      if (!lecture.hidden) lecture.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, { 'aria-expanded': 'false', 'aria-controls': 'lecture-questions' });

    container.append(
      el('h2', { class: 'section-title' }, screen.nextTitle),
      el('div', { class: 'next-cards' },
        nextCard(screen.nextCards.replay, () => ctx.go('explorer', { tab: 'example' })),
        nextCard(screen.nextCards.ownTree, () => ctx.go('explorer', { tab: unlocked ? 'own' : 'example' })),
        lectureBtn),
      lecture,
      pageFooter(ctx, {
        backLabel: 'Back to quiz',
        onBack: () => ctx.go('quiz'),
        nextLabel: 'Return home',
        onNext: () => ctx.go('home'),
        note: false,
      }));
  }).catch((error) => showError(message, error));
}
