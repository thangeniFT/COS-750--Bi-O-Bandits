/**
 * Screen type "explorer" (wireframe 04). Gagné event 5 (learning guidance), then free exploration.
 *
 * Two tabs, in a fixed order:
 *  1. "Worked example" - tree A, target 60, and only the Search button. Fewer controls keep the
 *     cognitive load low while the student learns to read the stack.
 *  2. "Try your own tree" - unlocked after the worked example has been stepped to the end. Adds
 *     insert, reset, any search target and the three traversal orders, on the sandbox tree.
 * The unlock is remembered for the tab's session. #/explorer?tab=example always opens the worked
 * example (the guided review links here).
 *
 * lesson.json fields: title, subtitle, example { tree, target, intro }, own { intro },
 * doneMessage, lockedNote.
 *
 * Talks to the server through api.js only: preview (draw tree A), getTree / insert / reset (sandbox),
 * search and traverse (the steps).
 *
 * Status: implemented.
 * @module screens/explorer-screen
 */

import { api } from '../api.js';
import { progress } from '../progress.js';
import { StackPanel } from '../components/stack-panel.js';
import { StepPlayer } from '../components/step-player.js';
import { renderTree, treeLegend } from '../components/tree-view.js';
import { el, parseWholeNumber } from '../util.js';
import { card, clearMessage, pageFooter, renderPageHeader, richText, showError, showFeedback } from './common.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * @param {any} screen
 * @param {HTMLElement} container
 * @param {any} ctx
 */
export function render(screen, container, ctx) {
  const unlocked = Boolean(progress.get('explorerUnlocked'));
  const tab = ctx.params.get('tab') === 'own' && unlocked ? 'own'
    : ctx.params.get('tab') === 'example' || !unlocked ? 'example' : 'own';
  const isExample = tab === 'example';

  renderPageHeader(container, {
    eyebrow: `Interactive explorer / ${isExample ? 'Worked example' : 'Your own tree'}`,
    title: screen.title,
    subtitle: screen.subtitle,
  });

  // --- Tabs --------------------------------------------------------------------------------
  const tabButton = (id, text, enabled) => el('button', {
    type: 'button', class: 'tab', role: 'tab', 'aria-selected': String(tab === id), disabled: !enabled,
    onclick: () => ctx.go('explorer', { tab: id }),
  }, text);
  const ownTab = tabButton('own', unlocked ? '2. Try your own tree' : '2. Try your own tree 🔒', unlocked);
  container.append(el('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Explorer mode' },
    tabButton('example', '1. Worked example', true), ownTab));
  container.append(richText('p', { class: 'subtitle' }, isExample ? screen.example.intro : screen.own.intro));
  if (!unlocked) container.append(richText('p', { class: 'visually-hidden' }, screen.lockedNote));

  // --- Page parts --------------------------------------------------------------------------
  const svg = document.createElementNS(SVG_NS, 'svg');
  const visited = el('p', { class: 'visit-order' });
  const stackBox = el('div');
  const explanation = el('p', { class: 'explanation', 'aria-live': 'polite' });
  const status = el('span', { class: 'step-status' });
  const message = el('div', { class: 'message', role: 'alert' });
  const done = el('div', { class: 'message', 'aria-live': 'polite' });
  const stackTitle = el('h2', { class: 'card__title' }, 'DFS Stack (top first)');
  const stack = new StackPanel(stackBox, { emptyText: isExample ? 'Press Search to start.' : 'Run a search or traversal to see the stack.' });

  /** @type {StepPlayer|null} */
  let player = null;
  /** @type {import('../components/tree-view.js').TreeViewHandle|null} */
  let tree = null;

  const backBtn = el('button', { type: 'button', class: 'btn', onclick: () => player?.back() }, '← Previous');
  const nextBtn = el('button', { type: 'button', class: 'btn btn--primary', onclick: () => player?.next() }, 'Next step →');
  const restartBtn = el('button', { type: 'button', class: 'btn', onclick: () => player?.restart() }, 'Restart');

  /** Enables the step buttons only when there is somewhere to go, and notices the end. */
  function afterStep() {
    backBtn.disabled = !player?.canBack;
    nextBtn.disabled = !player?.canNext;
    restartBtn.disabled = !player?.canBack;
    if (isExample && player?.atEnd && !progress.get('explorerUnlocked')) {
      progress.set('explorerUnlocked', true);
      ctx.markDone();
      ownTab.disabled = false;
      ownTab.textContent = '2. Try your own tree';
      showFeedback(done, 'success', screen.doneMessage);
      done.append(' ', el('button', { type: 'button', class: 'btn btn--small', onclick: () => ctx.go('explorer', { tab: 'own' }) }, 'Try your own tree →'));
    }
  }

  /** Draws a tree and forgets any previous run. */
  function drawTree(view) {
    tree = renderTree(svg, view);
    player = new StepPlayer({ tree, stack, explanation, status, visited, onStep: afterStep });
    stack.clear();
    visited.textContent = '';
    status.textContent = '';
    explanation.textContent = isExample ? '' : 'Insert values, then search or run a traversal.';
    afterStep();
  }

  /**
   * Runs an API call that returns a DfsResult and loads it into the player.
   * @param {() => Promise<import('../api.js').DfsResult>} call
   * @param {boolean} traversal - true for a traversal (the panel then shows the path from the root)
   */
  async function runDfs(call, traversal) {
    clearMessage(message);
    try {
      const result = await call();
      stackTitle.textContent = traversal ? 'Path from the root (top first)' : 'DFS Stack (top first)';
      player.load(result);
    } catch (error) {
      showError(message, error);
    }
  }

  // --- Controls bar: only Search in the worked example ---------------------------------------
  const values = isExample ? ctx.trees[screen.example.tree].values : undefined;
  const targetInput = el('input', { type: 'number', id: 'explorer-target', min: 0, max: 99, value: isExample ? screen.example.target : '', disabled: isExample });
  const search = () => {
    const parsed = parseWholeNumber(targetInput.value);
    if (!parsed.ok) { showError(message, parsed); return; }
    runDfs(() => api.search(parsed.value, values), false);
  };
  const searchForm = el('form', { novalidate: true, onsubmit: (event) => { event.preventDefault(); search(); } },
    el('span', { class: 'field' },
      el('label', { for: 'explorer-target' }, 'Find target'),
      targetInput,
      el('button', { type: 'submit', class: 'btn btn--primary' }, 'Search')));

  const bar = card({ alt: true, className: 'controls-bar' });
  if (isExample) {
    bar.append(searchForm);
  } else {
    const insertInput = el('input', { type: 'number', id: 'explorer-insert', min: 0, max: 99, placeholder: 'e.g. 65' });
    const insert = async () => {
      clearMessage(message);
      const parsed = parseWholeNumber(insertInput.value);
      if (!parsed.ok) { showError(message, parsed); return; }
      try {
        drawTree(await api.insert(parsed.value));
        explanation.textContent = `${parsed.value} was inserted. Run a search to see how DFS reaches it.`;
        insertInput.value = '';
      } catch (error) {
        showError(message, error);
      }
    };
    const reset = async () => {
      clearMessage(message);
      try {
        drawTree(await api.reset());
        explanation.textContent = 'The tree is back to the example tree.';
      } catch (error) {
        showError(message, error);
      }
    };
    const orderSelect = el('select', { id: 'explorer-order' },
      el('option', { value: 'PRE_ORDER' }, 'Pre-order'),
      el('option', { value: 'IN_ORDER' }, 'In-order'),
      el('option', { value: 'POST_ORDER' }, 'Post-order'));
    bar.append(
      el('form', { novalidate: true, onsubmit: (event) => { event.preventDefault(); insert(); } },
        el('span', { class: 'field' },
          el('label', { for: 'explorer-insert' }, 'Insert value'),
          insertInput,
          el('button', { type: 'submit', class: 'btn' }, 'Insert'))),
      searchForm,
      el('button', { type: 'button', class: 'btn', onclick: reset }, 'Reset tree'),
      el('form', { novalidate: true, onsubmit: (event) => { event.preventDefault(); runDfs(() => api.traverse(orderSelect.value), true); } },
        el('span', { class: 'field' },
          el('label', { for: 'explorer-order' }, 'Traversal'),
          orderSelect,
          el('button', { type: 'submit', class: 'btn' }, 'Run'))));
  }

  container.append(
    bar,
    message,
    el('div', { class: 'two-col' },
      card({ title: 'Binary Search Tree' }, svg, treeLegend(), visited),
      card({ alt: true }, stackTitle, stackBox, explanation)),
    el('div', { class: 'step-bar' }, backBtn, nextBtn, restartBtn, status),
    done,
    pageFooter(ctx));

  // --- Initial load ------------------------------------------------------------------------
  (async () => {
    try {
      drawTree(isExample ? await api.preview(values) : await api.getTree());
    } catch (error) {
      showError(message, error);
    }
  })();
}
