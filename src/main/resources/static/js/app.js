
/**
 * Starts the COS212 DFS Tutor.
 *
 * Responsibilities:
 * - Load lesson content and example trees.
 * - Navigate between screens using URL hashes.
 * - Render screens using the existing screen modules.
 * - Update application and learning progress.
 * - Display the main navigation matching the Figma designs.
 *
 * @module app
 */

import { loadData } from './api.js';
import { renderScreen } from './screens/index.js';
import { el } from './util.js';

// Existing page elements
const screenEl = document.getElementById('screen');
const mainEl = document.getElementById('main');
const backBtn = document.getElementById('nav-back');
const nextBtn = document.getElementById('nav-next');
const progressEl = document.getElementById('progress');
const progressLabel = document.getElementById('progress-label');

// Application state
const state = {
  lesson: null,
  trees: {},
  index: 0,
  cleanup: null,
};

// ------------------------------------------------------
// Main navigation
// ------------------------------------------------------

const NAV_ITEMS = [
  { label: 'Home', id: 'hook', section: 'home' },
  { label: 'Learn', id: 'concept-bst', section: 'learn' },
  { label: 'Explorer', id: 'worked-example', section: 'explorer' },
  { label: 'Practice', id: 'practice', section: 'practice' },
  { label: 'Quiz', id: 'quiz', section: 'quiz' }
];


const LEARNING_SCREENS = [
  'concept-bst',
  'concept-idea'
];


function getSection(screenId) {
  if (screenId === 'hook') {
    return 'home';
  }

  if ([
    'concept-bst',
    'concept-idea',
    'concept-stack',
    'concept-steps',
    'concept-not',
    'goals',
    'warmup'
  ].includes(screenId)) {
    return 'learn';
  }

  if ([
    'concept-orders',
    'worked-example',
    'sandbox'
  ].includes(screenId)) {
    return 'explorer';
  }

  if (screenId === 'practice') {
    return 'practice';
  }

  if (screenId === 'quiz') {
    return 'quiz';
  }

  return null;
}

function setupTopNavigation() {
  const header = document.querySelector('.app-header');

  if (!header || header.querySelector('.top-nav')) {
    return;
  }

  const nav = document.createElement('nav');

  nav.className = 'top-nav';
  nav.setAttribute('aria-label', 'Main navigation');

  NAV_ITEMS.forEach(({ label, id, section }) => {
    const link = document.createElement('a');

    link.textContent = label;
    link.href = `#/${id}`;
    link.dataset.section = section;

    nav.appendChild(link);
  });

  const progress = header.querySelector('.app-header__progress');

  if (progress) {
    header.insertBefore(nav, progress);
  } else {
    header.appendChild(nav);
  }
}


function updateTopNavigation(screenId) {
  const activeSection = getSection(screenId);

  document.querySelectorAll('.top-nav a').forEach((link) => {
    const active = link.dataset.section === activeSection;

    link.classList.toggle('top-nav__link--active', active);

    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// ------------------------------------------------------
// Learning progress
// ------------------------------------------------------


function setupLearningProgress() {
  const header = document.querySelector('.app-header');

  if (!header || document.getElementById('learning-progress')) {
    return;
  }

  const section = document.createElement('section');

  section.id = 'learning-progress';
  section.className = 'learning-progress';
  section.hidden = true;

  section.innerHTML = `
    <div class="learning-progress__heading">
      <div>
        <span class="learning-progress__eyebrow">
          LEARN / LESSON 1 OF 2
        </span>
        <h2 id="learning-progress-title"></h2>
      </div>

      <span id="learning-progress-percent"></span>
    </div>

    <div
      class="learning-progress__track"
      role="progressbar"
      aria-label="Learning module position"
      aria-valuemin="0"
      aria-valuemax="2"
      aria-valuenow="0"
    >
      <div class="learning-progress__bar"></div>
    </div>

   <div class="learning-progress__labels">
  <a href="#/concept-bst">BST Introduction</a>
  <a href="#/concept-idea">DFS Introduction</a>
</div>
  `;

  header.after(section);
}



function updateLearningProgress(screenId) {
  const section = document.getElementById('learning-progress');
  if (!section) return;

  const lessons = [
    {
      id: 'concept-bst',
      title: 'Binary Search Trees'
    },
    {
      id: 'concept-idea',
      title: 'Depth-First Search'
    }
  ];

  const index = lessons.findIndex(
    lesson => lesson.id === screenId
  );

  if (index === -1) {
    section.hidden = true;
    return;
  }

  section.hidden = false;

  const lessonNumber = index + 1;
  const progress = (lessonNumber / lessons.length) * 100;

  section.querySelector(
    '.learning-progress__eyebrow'
  ).textContent = `LEARN / LESSON ${lessonNumber} OF 2`;

  section.querySelector(
    '#learning-progress-title'
  ).textContent = lessons[index].title;

  section.querySelector(
    '#learning-progress-percent'
  ).textContent = `${lessonNumber} / 2`;

  section.querySelector(
    '.learning-progress__bar'
  ).style.width = `${progress}%`;

  const track = section.querySelector(
    '.learning-progress__track'
  );

  track.setAttribute('aria-valuenow', lessonNumber);
  track.setAttribute('aria-valuetext',
    `Lesson ${lessonNumber} of 2`);

  section.querySelectorAll(
    '.learning-progress__labels a'
  ).forEach((link, i) => {
    link.classList.toggle('is-current', i === index);

    if (i === index) {
      link.setAttribute('aria-current', 'step');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}


// ------------------------------------------------------
// Screen navigation
// ------------------------------------------------------


function indexFromHash() {
  const id = decodeURIComponent(
    window.location.hash.replace(/^#\/?/, '')
  );

  const index = state.lesson.screens.findIndex(
    (screen) => screen.id === id
  );

  return index >= 0 ? index : 0;
}


function go(index) {
  if (index < 0 || index >= state.lesson.screens.length) {
    return;
  }

  window.location.hash =
    `#/${state.lesson.screens[index].id}`;
}

/**
 * Adds a bottom action only to the BST and DFS lessons.
 * Other screens use the top navigation.
 */

function addLearningAction(screenId) {
  // Navigation buttons only appear on learning pages.
  if (
    screenId !== 'concept-bst' &&
    screenId !== 'concept-idea'
  ) {
    return;
  }

  const actions = document.createElement('nav');
  actions.className = 'lesson-actions';
  actions.setAttribute('aria-label', 'Lesson navigation');

  function createLink(label, target, className) {
    const link = document.createElement('a');

    link.href = `#/${target}`;
    link.textContent = label;
    link.className = `lesson-action ${className}`;

    return link;
  }

  if (screenId === 'concept-bst') {
    // PAGE 2: BST Introduction
    // Next lesson on the right, as in Figma.
    actions.classList.add('lesson-actions--next-only');

    actions.appendChild(
      createLink(
        'Next Lesson →',
        'concept-idea',
        'lesson-action--primary'
      )
    );
  }

  if (screenId === 'concept-idea') {
    // PAGE 3: DFS Introduction
    // BST Basics on the left, Explorer on the right.
    actions.append(
      createLink(
        '← BST Basics',
        'concept-bst',
        'lesson-action--secondary'
      ),
      createLink(
        'Go to Explorer →',
        'worked-example',
        'lesson-action--primary'
      )
    );
  }

  screenEl.appendChild(actions);
}

 


function show(index) {

  if (typeof state.cleanup === 'function') {
    state.cleanup();
  }

  state.cleanup = null;
  state.index = index;

  const screens = state.lesson.screens;
  const screen = screens[index];


  progressEl.setAttribute(
    'aria-valuemax',
    String(screens.length)
  );

  progressEl.setAttribute(
    'aria-valuenow',
    String(index + 1)
  );

  const progressPercentage =
    ((index + 1) / screens.length) * 100;

  progressEl.querySelector('.progress__bar').style.width =
    `${progressPercentage}%`;

  progressLabel.textContent ='';

  document.title = `${screen.title} · COS212 DFS Tutor`;


  updateTopNavigation(screen.id);
  updateLearningProgress(screen.id);

 
  backBtn.disabled = index === 0;
  nextBtn.disabled = index === screens.length - 1;


  const ctx = {
    trees: state.trees,
    lesson: state.lesson,
    goNext: () => go(state.index + 1),

    setNextEnabled: (enabled) => {
      nextBtn.disabled =
        !enabled || index === screens.length - 1;
    },
  };


  screenEl.replaceChildren();

  state.cleanup =
    renderScreen(screen, screenEl, ctx) ?? null;
addLearningAction(screen.id);
 
  const heading = screenEl.querySelector('h1');

  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

// ------------------------------------------------------
// Application startup
// ------------------------------------------------------

async function start() {
  try {
    const [lesson, trees] = await Promise.all([
      loadData('lesson'),
      loadData('trees')
    ]);

    state.lesson = lesson;
    state.trees = trees;
  } catch (error) {
    screenEl.replaceChildren(
      el(
        'div',
        {
          class: 'message message--error',
          role: 'alert'
        },
        'The lesson could not be loaded. ' +
        'Check that the server is running and reload the page. ',
        el('code', {}, String(error.message))
      )
    );

    backBtn.disabled = true;
    nextBtn.disabled = true;

    return;
  }

  setupTopNavigation();
  setupLearningProgress();

  backBtn.addEventListener('click', () => {
    go(state.index - 1);
  });

  nextBtn.addEventListener('click', () => {
    go(state.index + 1);
  });

  window.addEventListener('hashchange', () => {
    show(indexFromHash());
  });

 
  show(indexFromHash());
  mainEl.focus();
}

start();
