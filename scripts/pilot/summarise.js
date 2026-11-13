// Usage: node scripts/pilot/summarise.js [path/to/results.csv]
// Default input: docs/pilot/results.csv. Prints Markdown tables to paste into docs/pilot-findings.md.
import { readFileSync } from 'node:fs';
import { parseCsv, scoreParticipant, evaluate, toMarkdown, QUIZ } from './scoring.js';

// Use the quiz as it actually ships, so the pass-mark analysis follows any change to the bank.
function loadQuiz() {
  try {
    const bank = JSON.parse(readFileSync('src/main/resources/static/data/quiz-bank.json', 'utf8'));
    return { total: new Set(bank.items.map((i) => i.slot)).size, passMark: bank.passMark };
  } catch {
    return QUIZ;
  }
}

const file = process.argv[2] ?? 'docs/pilot/results.csv';
try {
  const quiz = loadQuiz();
  const people = parseCsv(readFileSync(file, 'utf8')).map((row) => scoreParticipant(row, quiz));
  if (!people.length) {
    console.log(`No participants in ${file} yet. Add one row per participant (see docs/pilot/README.md).`);
    process.exit(0);
  }
  console.log(toMarkdown(people, evaluate(people, quiz)));
} catch (err) {
  console.error(`Could not summarise ${file}: ${err.message}`);
  process.exit(1);
}
