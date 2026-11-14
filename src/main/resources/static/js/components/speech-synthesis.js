/**
 * Browser speech controls for reading the currently rendered screen.
 *
 * @module components/speech-synthesis
 */

let activeUtterance = null;
let autoReadEnabled = false;

function isSupported() {
  return typeof window !== 'undefined'
    && typeof window.speechSynthesis?.speak === 'function'
    && typeof window.SpeechSynthesisUtterance === 'function';
}

/**
 * Stops any utterance started by this module.
 */
export function stopSpeech() {
  if (!isSupported()) return;

  window.speechSynthesis.cancel();
  activeUtterance = null;
}

/**
 * Pauses speech playback.
 *
 * @returns {boolean} whether speech playback was paused
 */
export function pauseSpeech() {
  if (!isSupported() || !window.speechSynthesis.speaking) return false;

  window.speechSynthesis.pause();
  return true;
}

/**
 * Resumes paused speech playback.
 *
 * @returns {boolean} whether speech playback was resumed
 */
export function resumeSpeech() {
  if (!isSupported() || !window.speechSynthesis.paused) return false;

  window.speechSynthesis.resume();
  return true;
}

/**
 * Speaks text using the browser's default voice.
 *
 * @param {string} text
 * @param {{rate?: number, onEnd?: () => void, onError?: (event: SpeechSynthesisErrorEvent) => void}} [options]
 * @returns {boolean} whether speech playback was started
 */
export function speakText(text, { rate = 0.65, onEnd, onError } = {}) {
  const spokenText = String(text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim();

  if (!spokenText || !isSupported()) return false;

  stopSpeech();

  const utterance = new window.SpeechSynthesisUtterance(spokenText);
  utterance.rate = rate;
  activeUtterance = utterance;
  utterance.onend = () => {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    onEnd?.();
  };
  utterance.onerror = (event) => {
    if (activeUtterance !== utterance) return;
    activeUtterance = null;
    onError?.(event);
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

function getReadablePageText(container) {
  const clone = container.cloneNode(true);
  const sourceElements = Array.from(container.querySelectorAll('*'));
  const clonedElements = Array.from(clone.querySelectorAll('*'));
  const ignoredElements = 'button, input, select, textarea, script, style, svg, [role="button"], [role="tab"], [role="menuitem"], [aria-hidden="true"], [hidden], .speech-controls';

  for (let i = sourceElements.length - 1; i >= 0; i -= 1) {
    const source = sourceElements[i];
    const style = window.getComputedStyle(source);
    if (source.matches(ignoredElements)
      || style.display === 'none'
      || style.visibility === 'hidden') {
      clonedElements[i].remove();
    }
  }

  return (clone.innerText || clone.textContent || '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Creates controls that read the current visible text from a screen container.
 *
 * @param {HTMLElement} page
 * @returns {HTMLElement}
 */
export function createSpeechControls(page) {
  const controls = document.createElement('div');
  controls.className = 'speech-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Read page aloud');

  const readButton = document.createElement('button');
  readButton.type = 'button';
  readButton.className = 'speech-controls__button';
  readButton.textContent = 'Read this page';

  const pauseButton = document.createElement('button');
  pauseButton.type = 'button';
  pauseButton.className = 'speech-controls__button speech-controls__button--secondary';
  pauseButton.textContent = 'Pause';
  pauseButton.disabled = true;

  const stopButton = document.createElement('button');
  stopButton.type = 'button';
  stopButton.className = 'speech-controls__button speech-controls__button--secondary';
  stopButton.textContent = 'Stop';
  stopButton.disabled = true;

  const rateLabel = document.createElement('label');
  rateLabel.className = 'speech-controls__rate-label';
  rateLabel.textContent = 'Speed ';

  const rateSelect = document.createElement('select');
  rateSelect.className = 'speech-controls__rate';
  rateSelect.setAttribute('aria-label', 'Speech speed');
  [
    { value: '0.5', label: '0.5× (slow)' },
    { value: '0.65', label: '0.65×' },
    { value: '0.75', label: '0.75×' },
    { value: '1', label: '1×' },
    { value: '1.25', label: '1.25×' },
    { value: '1.5', label: '1.5×' },
  ].forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (value === '0.65') option.selected = true;
    rateSelect.append(option);
  });
  rateLabel.append(rateSelect);

  const autoReadLabel = document.createElement('label');
  autoReadLabel.className = 'speech-controls__auto-label';
  const autoReadCheckbox = document.createElement('input');
  autoReadCheckbox.type = 'checkbox';
  autoReadCheckbox.checked = autoReadEnabled;
  autoReadCheckbox.setAttribute('aria-describedby', 'speech-auto-read-hint');
  autoReadLabel.append(autoReadCheckbox, ' Auto-read pages');

  const autoReadHint = document.createElement('span');
  autoReadHint.id = 'speech-auto-read-hint';
  autoReadHint.className = 'speech-controls__hint';
  autoReadHint.textContent = 'Auto-read starts on each page and may overlap other screen-reader speech.';

  const status = document.createElement('span');
  status.className = 'speech-controls__status';
  status.setAttribute('aria-live', 'polite');

  if (!isSupported()) {
    readButton.disabled = true;
    readButton.title = 'Speech synthesis is not supported in this browser.';
    pauseButton.hidden = true;
    stopButton.hidden = true;
    rateLabel.hidden = true;
    autoReadLabel.hidden = true;
    autoReadHint.hidden = true;
    status.textContent = 'Read aloud is not supported in this browser.';
  } else {
    let reading = false;
    let paused = false;

    const reset = (message) => {
      reading = false;
      paused = false;
      readButton.disabled = false;
      pauseButton.disabled = true;
      pauseButton.textContent = 'Pause';
      stopButton.disabled = true;
      rateSelect.disabled = false;
      status.textContent = message;
    };

    const beginReading = () => {
      const currentPageText = getReadablePageText(page);
      const started = speakText(currentPageText, {
        rate: Number(rateSelect.value),
        onEnd: () => reset('Finished reading.'),
        onError: (event) => reset(`Speech playback failed${event.error ? `: ${event.error}` : '.'}`),
      });

      if (!started) {
        reset(currentPageText ? 'Speech could not be started.' : 'There is no readable text on this page.');
        return false;
      }

      reading = true;
      paused = false;
      readButton.disabled = true;
      pauseButton.disabled = false;
      stopButton.disabled = false;
      rateSelect.disabled = true;
      status.textContent = 'Reading aloud.';
      return true;
    };

    readButton.addEventListener('click', beginReading);

    pauseButton.addEventListener('click', () => {
      const changed = paused ? resumeSpeech() : pauseSpeech();
      if (!changed) return;

      paused = !paused;
      pauseButton.textContent = paused ? 'Resume' : 'Pause';
      status.textContent = paused ? 'Reading paused.' : 'Reading aloud.';
    });

    stopButton.addEventListener('click', () => {
      if (!reading) return;
      stopSpeech();
      reset('Reading stopped.');
    });

    autoReadCheckbox.addEventListener('change', () => {
      autoReadEnabled = autoReadCheckbox.checked;
      if (autoReadEnabled) beginReading();
    });

    if (autoReadEnabled) beginReading();
  }

  controls.append(readButton, pauseButton, stopButton, rateLabel, autoReadLabel, autoReadHint, status);
  return controls;
}
