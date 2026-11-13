// Scoring for the peer pilot (ticket Q-01). Pure functions, no file or DOM access,
// so they can be tested with `npm test`. The CLI in summarise.js reads the CSV and calls these.
//
// Everything here follows ID document section 13 (Evaluation) and appendix D (instruments).

/** Columns expected in docs/pilot/results.csv, in order. */
export const COLUMNS = [
  'id', 'round', 'pre_form',
  'pre1', 'pre2', 'pre3', 'pre4', 'pre5',
  'post1', 'post2', 'post3', 'post4', 'post5',
  'quiz_score',
  'sus1', 'sus2', 'sus3', 'sus4', 'sus5', 'sus6', 'sus7', 'sus8', 'sus9', 'sus10',
  'start', 'end',
  'confusing_screens'
];

/** The readiness quiz as shipped (data/quiz-bank.json); summarise.js reads the real values. */
export const QUIZ = { total: 8, passMark: 6 };

/** ID section 13.4 thresholds. */
export const CRITERIA = {
  minMeanGain: 2,
  minMeanSus: 68,
  sessionMinutes: [15, 30],
  maxParticipantsConfusedPerScreen: 1
};

/**
 * Parses a simple CSV (comma-separated, no quoted commas) into row objects keyed by header.
 * Blank lines and lines starting with '#' are skipped.
 * @param {string} text CSV text with a header row.
 * @returns {Array<Record<string,string>>} One object per data row.
 * @throws {Error} If the header is missing a required column.
 */
export function parseCsv(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  if (!lines.length) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const missing = COLUMNS.filter(c => !header.includes(c));
  if (missing.length) throw new Error(`results.csv is missing columns: ${missing.join(', ')}`);
  return lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim());
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']));
  });
}

/**
 * System Usability Scale score (Brooke, 1996).
 * Odd items contribute (answer - 1), even items (5 - answer); the sum is multiplied by 2.5.
 * @param {number[]} answers Ten answers, each 1..5.
 * @returns {number} Score from 0 to 100.
 * @throws {Error} If there are not exactly ten answers in range.
 */
export function susScore(answers) {
  if (answers.length !== 10 || answers.some(a => !Number.isInteger(a) || a < 1 || a > 5)) {
    throw new Error('SUS needs ten whole-number answers from 1 to 5');
  }
  const sum = answers.reduce((s, a, i) => s + (i % 2 === 0 ? a - 1 : 5 - a), 0);
  return sum * 2.5;
}

/**
 * Minutes between two clock times on the same day ("14:05" to "14:31" -> 26).
 * @param {string} start "HH:MM"
 * @param {string} end "HH:MM"
 * @returns {number} Whole minutes.
 * @throws {Error} If a time is malformed or end is before start.
 */
export function minutesBetween(start, end) {
  const toMin = t => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t);
    if (!m) throw new Error(`Time "${t}" should look like 14:05`);
    return Number(m[1]) * 60 + Number(m[2]);
  };
  const diff = toMin(end) - toMin(start);
  if (diff < 0) throw new Error(`End time ${end} is before start time ${start}`);
  return diff;
}

/** Median of a list of numbers (mean of the middle two for an even count). */
export function median(values) {
  if (!values.length) return NaN;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Arithmetic mean, NaN for an empty list. */
export function mean(values) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN;
}

const toBit = (v, col, id) => {
  if (v !== '0' && v !== '1') throw new Error(`${id}: ${col} must be 0 or 1, got "${v}"`);
  return Number(v);
};

/**
 * Turns one CSV row into a scored participant.
 * @param {Record<string,string>} row A row from parseCsv.
 * @returns {{id:string, round:string, pre:number, post:number, gain:number, quiz:number|null,
 *   sus:number|null, minutes:number|null, confusing:string[]}}
 * @throws {Error} With the participant id if a value is invalid.
 */
export function scoreParticipant(row, quiz = QUIZ) {
  const id = row.id || '(no id)';
  const pre = [1, 2, 3, 4, 5].reduce((s, i) => s + toBit(row[`pre${i}`], `pre${i}`, id), 0);
  const post = [1, 2, 3, 4, 5].reduce((s, i) => s + toBit(row[`post${i}`], `post${i}`, id), 0);

  const susRaw = Array.from({ length: 10 }, (_, i) => row[`sus${i + 1}`]);
  const sus = susRaw.every(v => v === '') ? null : susScore(susRaw.map(Number));

  const quizScore = row.quiz_score === '' ? null : Number(row.quiz_score);
  if (quizScore !== null && (!Number.isInteger(quizScore) || quizScore < 0 || quizScore > quiz.total)) {
    throw new Error(`${id}: quiz_score must be 0..${quiz.total}`);
  }

  const minutes = row.start && row.end ? minutesBetween(row.start, row.end) : null;
  const confusing = (row.confusing_screens || '')
    .split(';').map(s => s.trim().toLowerCase()).filter(Boolean);

  return { id, round: row.round, pre, post, gain: post - pre, quiz: quizScore, sus, minutes, confusing };
}

/**
 * Checks the ID section 13.4 success criteria and the pass-mark question: do students one point
 * below the pass mark do as well on the post-test as students at or above it?
 * @param {ReturnType<typeof scoreParticipant>[]} people Scored participants.
 * @param {{total: number, passMark: number}} [quiz] The readiness quiz (defaults to {@link QUIZ}).
 * @returns {{criteria: Array<{name:string, value:string, target:string, met:boolean|null}>,
 *   screenCounts: Record<string,number>, threshold: {at3:number|null, at4plus:number|null, below3:number|null, note:string}}}
 */
export function evaluate(people, quiz = QUIZ) {
  const gains = people.map(p => p.gain);
  const sus = people.map(p => p.sus).filter(v => v !== null);
  const mins = people.map(p => p.minutes).filter(v => v !== null);

  const screenCounts = {};
  for (const p of people) {
    for (const s of new Set(p.confusing)) screenCounts[s] = (screenCounts[s] || 0) + 1;
  }
  const worstScreen = Object.entries(screenCounts).sort((a, b) => b[1] - a[1])[0];

  const fmt = n => (Number.isNaN(n) ? 'n/a' : (Math.round(n * 10) / 10).toString());
  const meanGain = mean(gains);
  const meanSus = mean(sus);
  const medMin = median(mins);
  const anyLower = people.filter(p => p.gain < 0).map(p => p.id);

  const criteria = [
    {
      name: 'Mean pre → post gain',
      value: `${fmt(meanGain)} (pre ${fmt(mean(people.map(p => p.pre)))}, post ${fmt(mean(people.map(p => p.post)))})`,
      target: `≥ ${CRITERIA.minMeanGain} of 5`,
      met: people.length ? meanGain >= CRITERIA.minMeanGain : null
    },
    {
      name: 'No student scores lower after',
      value: anyLower.length ? `lower: ${anyLower.join(', ')}` : 'none lower',
      target: 'none lower',
      met: people.length ? anyLower.length === 0 : null
    },
    {
      name: 'Mean SUS',
      value: fmt(meanSus),
      target: `≥ ${CRITERIA.minMeanSus}`,
      met: sus.length ? meanSus >= CRITERIA.minMeanSus : null
    },
    {
      name: 'Median session time (min)',
      value: fmt(medMin),
      target: `${CRITERIA.sessionMinutes[0]}–${CRITERIA.sessionMinutes[1]}`,
      met: mins.length ? medMin >= CRITERIA.sessionMinutes[0] && medMin <= CRITERIA.sessionMinutes[1] : null
    },
    {
      name: 'Screen marked confusing by most participants',
      value: worstScreen ? `${worstScreen[0]} (${worstScreen[1]})` : 'none',
      target: `≤ ${CRITERIA.maxParticipantsConfusedPerScreen} per screen`,
      met: people.length ? !worstScreen || worstScreen[1] <= CRITERIA.maxParticipantsConfusedPerScreen : null
    }
  ];

  // Threshold check (ID 13.4): one point below the pass mark versus at or above it.
  const postFor = pred => {
    const g = people.filter(p => p.quiz !== null && pred(p.quiz)).map(p => p.post);
    return g.length ? mean(g) : null;
  };
  const pm = quiz.passMark;
  const at3 = postFor(q => q === pm - 1);
  const at4plus = postFor(q => q >= pm);
  const below3 = postFor(q => q < pm - 1);
  const t = (n) => `${n}/${quiz.total}`;
  let note;
  if (at3 === null || at4plus === null) {
    note = 'Not enough participants on both sides of the threshold to compare.';
  } else if (at3 >= at4plus) {
    note = `Students at ${t(pm - 1)} did as well as those at ${t(pm)} or more on the post-test: the pass mark may be too high.`;
  } else if (at4plus < 3) {
    note = `Students at ${t(pm)} or more still scored under 3/5 on the post-test: the pass mark may be too low.`;
  } else {
    note = `Post-test scores separate at the pass mark, so ${t(pm)} looks reasonable.`;
  }

  return { criteria, screenCounts, quiz, threshold: { at3, at4plus, below3, note } };
}

/**
 * Renders the per-participant table and the criteria table as Markdown,
 * ready to paste into docs/pilot-findings.md.
 * @param {ReturnType<typeof scoreParticipant>[]} people
 * @param {ReturnType<typeof evaluate>} result
 * @returns {string} Markdown.
 */
export function toMarkdown(people, result) {
  const cell = v => (v === null || v === undefined ? '–' : String(v));
  const tick = m => (m === null ? '–' : m ? '✅ met' : '❌ not met');
  const r1 = n => (n === null ? '–' : (Math.round(n * 10) / 10).toString());
  const out = [];
  out.push('| Participant | Round | Pre (/5) | Post (/5) | Gain | Quiz (/6) | SUS | Minutes | Confusing screens |');
  out.push('|---|---|---|---|---|---|---|---|---|');
  for (const p of people) {
    out.push(`| ${p.id} | ${p.round} | ${p.pre} | ${p.post} | ${p.gain > 0 ? '+' : ''}${p.gain} | ${cell(p.quiz)} | ${cell(p.sus)} | ${cell(p.minutes)} | ${p.confusing.join(', ') || '–'} |`);
  }
  out.push('');
  out.push('| Criterion (ID 13.4) | Result | Target | Verdict |');
  out.push('|---|---|---|---|');
  for (const c of result.criteria) out.push(`| ${c.name} | ${c.value} | ${c.target} | ${tick(c.met)} |`);
  out.push('');
  out.push('| Quiz score group | Mean post-test (/5) |');
  out.push('|---|---|');
  const { passMark: pm, total } = result.quiz;
  out.push(`| Below ${pm - 1}/${total} | ${r1(result.threshold.below3)} |`);
  out.push(`| Exactly ${pm - 1}/${total} (one below the pass mark) | ${r1(result.threshold.at3)} |`);
  out.push(`| ${pm}/${total} or higher (pass mark) | ${r1(result.threshold.at4plus)} |`);
  out.push('');
  out.push(`Threshold reading: ${result.threshold.note}`);
  return out.join('\n');
}
