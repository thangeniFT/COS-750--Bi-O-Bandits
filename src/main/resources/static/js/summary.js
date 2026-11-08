/* ==========================================================
   Learning Summary page
   ========================================================== */
(function () {
  const total = QUESTIONS.length;
  const answers = Store.load().answers;

  let correct = 0;
  let answered = 0;
  const missed = [];
  QUESTIONS.forEach((q, i) => {
    const a = answers[i];
    if (!a) { missed.push({ i, q, unanswered: true }); return; }
    answered++;
    if (a.first === q.answer) correct++;
    else missed.push({ i, q, unanswered: false });
  });

  // ----- Score ring -----
  document.getElementById("score").textContent = `${correct} / ${total}`;
  const ring = document.getElementById("ring-fill");
  const circumference = 2 * Math.PI * 52;
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ring.style.strokeDashoffset = circumference * (1 - correct / total);
  }));
  document.querySelector(".ring").setAttribute("aria-label", `${correct} of ${total} correct on first attempt`);

  // ----- Message -----
  const wrongCount = missed.filter(m => !m.unanswered).length;
  const skipped = total - answered;
  const words = ["zero", "one", "two", "three", "four", "five", "six"];
  let msg;
  if (answered === 0) msg = "You haven't taken the quiz yet.";
  else if (missed.length === 0) msg = "All correct — you're ready for lecture.";
  else {
    const parts = [];
    if (wrongCount) parts.push(`Review ${words[wrongCount] || wrongCount} concept${wrongCount > 1 ? "s" : ""} before lecture.`);
    if (skipped) parts.push(`${skipped} question${skipped > 1 ? "s" : ""} not answered yet.`);
    msg = parts.join(" ");
  }
  document.getElementById("ready-msg").textContent = msg;

  // ----- Concepts to review -----
  const list = document.getElementById("review-list");
  missed.forEach(({ i, q, unanswered }) => {
    const href = unanswered ? `quiz.html?q=${i + 1}` : `feedback.html?q=${i + 1}`;
    list.append(el("li", {},
      el("a", { href }, el("span", { text: q.concept }), el("span", { text: unanswered ? "Answer →" : "Review →" }))
    ));
  });

  // ----- Retake -----
  document.getElementById("restart-btn").addEventListener("click", () => {
    Store.clear();
    location.href = "quiz.html?q=1";
  });
})();
